# Project 8: Slack MCP Assistant

## Overview

MCP server connecting Claude Desktop to Slack workspace for message retrieval and summarisation.

## Setup

### Slack App Configuration

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Create new app from scratch
3. Add Bot Token Scopes:
   - `channels:history` - Read public channel messages
   - `channels:read` - List public channels
   - `users:read` - Get user information
4. Install app to workspace
5. Copy Bot User OAuth Token (starts with `xoxb-`)

### Installation

```bash
git clone https://github.com/nfroze/Project-8-Slack-MCP-Assistant.git
cd Project-8-Slack-MCP-Assistant

npm install

cp .env.example .env
# Add Slack bot token to .env
```

### Claude Desktop Configuration

Add to config file:
- macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
- Windows: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "slack-assistant": {
      "command": "node",
      "args": ["/path/to/slack-mcp-assistant/src/index.js"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-bot-token"
      }
    }
  }
}
```

Restart Claude Desktop to load the server.

## MCP Tools

- `get_channel_messages` - Retrieve messages from specific channel
- `list_channels` - List available channels
- `search_messages` - Search messages across workspace

## Example Queries

- "What happened in #engineering this week?"
- "Summarise discussions about the API redesign"
- "Show messages from #general in the last 24 hours"
- "What blockers were mentioned today?"

## Features

- Channel message retrieval
- Message summarisation
- Cross-channel search
- Time-based filtering
- User context in messages

## Security

- Data remains local
- Accesses only invited channels
- Respects workspace permissions
- No permanent message storage

## Project Structure

```
slack-mcp-assistant/
├── src/
│   └── index.js      # MCP server implementation
├── .env.example      # Environment variable template
└── package.json      # Dependencies
```