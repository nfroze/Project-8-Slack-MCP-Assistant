# 🤖 Project 8: Slack MCP Assistant

An MCP (Model Context Protocol) server that connects Claude Desktop to your Slack workspace, enabling intelligent message summaries and insights.

## What It Does

This MCP server lets Claude:
- 📊 Summarize channel activity ("What happened in #engineering this week?")
- 🏖️ Catch you up after vacation ("What did I miss while I was away?")
- 🔍 Search across channels ("Find all discussions about the API redesign")
- 👔 Create executive summaries ("Key decisions made across all channels")
- 📈 Analyze team sentiment ("How is the team feeling about the new project?")

## Quick Start

### 1. Set Up Slack App

1. Go to [api.slack.com/apps](https://api.slack.com/apps)
2. Click "Create New App" → "From scratch"
3. Name it "Slack MCP Assistant" and select your workspace
4. Go to "OAuth & Permissions" and add these Bot Token Scopes:
   - `channels:history` - Read public channel messages
   - `channels:read` - List public channels
   - `users:read` - Get user info for better message formatting
   - `chat:write` - (Optional) For future features
5. Install the app to your workspace
6. Copy the "Bot User OAuth Token" (starts with `xoxb-`)

### 2. Install the MCP Server

```bash
# Clone the repo
git clone https://github.com/yourusername/slack-mcp-assistant.git
cd slack-mcp-assistant

# Install dependencies
npm install

# Set up environment
cp .env.example .env
# Edit .env and add your Slack bot token
```

### 3. Configure Claude Desktop

Add to your Claude Desktop config (`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac):

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

### 4. Restart Claude Desktop

Restart Claude Desktop to load the MCP server.

## Usage Examples

### Vacation Catchup
> "What did I miss in the #general and #engineering channels while I was on vacation last week?"

### Executive Summary
> "Give me a summary of all important decisions and discussions across all channels from the past 3 days"

### Team Sentiment
> "What's the overall mood in the #product channel? Any concerns or blockers?"

### Search for Context
> "Find all messages about the database migration project"

### Daily Standup Prep
> "What did my team discuss yesterday in #dev-team?"

## Available Tools

The MCP server provides these tools to Claude:

- **`get_channel_messages`** - Retrieve messages from a specific channel
- **`list_channels`** - List all available channels
- **`search_messages`** - Search for messages across the workspace


## Privacy & Security

- All data stays local - no external servers
- Only accesses channels the bot is invited to
- Respects Slack workspace permissions
- Never stores messages permanently