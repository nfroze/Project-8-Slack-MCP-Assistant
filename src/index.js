#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Slack client
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Tool implementations
async function getChannelMessages({ channel, limit = 100, since }) {
  try {
    // Get channel ID if name was provided
    let channelId = channel;
    if (!channel.startsWith('C') && !channel.startsWith('G')) {
      const channelsResult = await slack.conversations.list({
        types: 'public_channel',
      });
      const foundChannel = channelsResult.channels?.find(
        c => c.name === channel
      );
      if (!foundChannel) {
        throw new Error(`Channel ${channel} not found`);
      }
      channelId = foundChannel.id;
    }

    // Calculate timestamp if 'since' is provided
    let oldest;
    if (since) {
      const sinceDate = new Date(since);
      oldest = Math.floor(sinceDate.getTime() / 1000).toString();
    }

    // Get messages
    const result = await slack.conversations.history({
      channel: channelId,
      limit,
      oldest,
    });

    // Get user info for better formatting
    const userIds = [...new Set(result.messages?.map(m => m.user).filter(Boolean))];
    const userPromises = userIds.map(id => 
      slack.users.info({ user: id }).catch(() => null)
    );
    const userResults = await Promise.all(userPromises);
    const userMap = {};
    userResults.forEach((res, i) => {
      if (res?.user) {
        userMap[userIds[i]] = res.user.real_name || res.user.name;
      }
    });

    // Format messages
    const formattedMessages = result.messages?.map(msg => ({
      user: userMap[msg.user] || msg.user || 'Unknown',
      text: msg.text,
      timestamp: new Date(parseFloat(msg.ts) * 1000).toISOString(),
      thread_count: msg.thread_ts ? msg.reply_count : undefined,
    }));

    return JSON.stringify({
      channel: channel,
      message_count: formattedMessages?.length || 0,
      messages: formattedMessages,
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to get messages: ${error.message}`);
  }
}

async function listChannels({ include_private = false }) {
  try {
    const result = await slack.conversations.list({ 
      types: 'public_channel' 
    });
    
    const channels = result.channels?.map(c => ({
      name: c.name,
      id: c.id,
      is_private: c.is_private,
      member_count: c.num_members,
      purpose: c.purpose?.value,
    }));

    return JSON.stringify({
      channel_count: channels?.length || 0,
      channels,
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to list channels: ${error.message}`);
  }
}

// Create server
const server = new Server(
  {
    name: 'slack-mcp-assistant',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Handler for listing tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'get_channel_messages',
        description: 'Get messages from a Slack channel',
        inputSchema: {
          type: 'object',
          properties: {
            channel: {
              type: 'string',
              description: 'Channel name (without #) or channel ID',
            },
            limit: {
              type: 'number',
              description: 'Number of messages to retrieve (default: 100)',
              default: 100,
            },
            since: {
              type: 'string',
              description: 'Get messages since this date (ISO format or relative like "1 week ago")',
            },
          },
          required: ['channel'],
        },
      },
      {
        name: 'list_channels',
        description: 'List all public channels in the Slack workspace',
        inputSchema: {
          type: 'object',
          properties: {
            include_private: {
              type: 'boolean',
              description: 'Include private channels (requires additional permissions)',
              default: false,
            },
          },
        },
      },
    ],
  };
});

// Handler for calling tools  
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;
    
    switch (name) {
      case 'get_channel_messages':
        result = await getChannelMessages(args);
        break;
      case 'list_channels':
        result = await listChannels(args);
        break;
      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: result,
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text', 
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Slack MCP Assistant started on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});