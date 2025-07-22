#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { WebClient } from '@slack/web-api';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize Slack client
const slack = new WebClient(process.env.SLACK_BOT_TOKEN);

// Create MCP server
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

// Define available tools
server.setRequestHandler('tools/list', async () => ({
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
      description: 'List all channels in the Slack workspace',
      inputSchema: {
        type: 'object',
        properties: {
          include_private: {
            type: 'boolean',
            description: 'Include private channels (default: false)',
            default: false,
          },
        },
      },
    },
    {
      name: 'search_messages',
      description: 'Search for messages across the Slack workspace',
      inputSchema: {
        type: 'object',
        properties: {
          query: {
            type: 'string',
            description: 'Search query',
          },
          in_channel: {
            type: 'string',
            description: 'Limit search to specific channel (optional)',
          },
        },
        required: ['query'],
      },
    },
  ],
}));

// Handle tool execution
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'get_channel_messages': {
        const { channel, limit = 100, since } = args;
        
        // Get channel ID if name was provided
        let channelId = channel;
        if (!channel.startsWith('C') && !channel.startsWith('G')) {
          const channelsResult = await slack.conversations.list({
            types: 'public_channel,private_channel',
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

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                channel: channel,
                message_count: formattedMessages?.length || 0,
                messages: formattedMessages,
              }, null, 2),
            },
          ],
        };
      }

      case 'list_channels': {
        const { include_private = false } = args;
        const types = include_private 
          ? 'public_channel,private_channel' 
          : 'public_channel';
        
        const result = await slack.conversations.list({ types });
        const channels = result.channels?.map(c => ({
          name: c.name,
          id: c.id,
          is_private: c.is_private,
          member_count: c.num_members,
          purpose: c.purpose?.value,
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                channel_count: channels?.length || 0,
                channels,
              }, null, 2),
            },
          ],
        };
      }

      case 'search_messages': {
        const { query, in_channel } = args;
        let searchQuery = query;
        if (in_channel) {
          searchQuery = `${query} in:${in_channel}`;
        }

        const result = await slack.search.messages({
          query: searchQuery,
          count: 100,
        });

        const messages = result.messages?.matches?.map(match => ({
          user: match.username,
          text: match.text,
          channel: match.channel?.name,
          timestamp: new Date(parseFloat(match.ts) * 1000).toISOString(),
        }));

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                query,
                match_count: messages?.length || 0,
                messages,
              }, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
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

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Slack MCP Assistant running on stdio');
}

main().catch(console.error);