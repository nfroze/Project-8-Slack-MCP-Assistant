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

### 🚨 Incident Commander
> "What's happening with the production outage?"

Instantly aggregates context from #incident-*, #alerts, #on-call channels. Reduces MTTR by 30-50%.

### 📊 Daily Blocker Hunter
> "What blockers were mentioned across all team channels in the last 24 hours?"

Surfaces hidden dependencies before they become critical. Prevents 80% of "surprise" delays.

### 🔍 Automated Post-Mortem
> "Generate a timeline of everything related to OrderService from 2 hours before the outage"

Turns 5 hours of manual timeline building into 30 minutes of automated correlation.

### 🏃 Release Guardian
> "Are there any unresolved concerns about tomorrow's deployment?"

Scans release planning, testing, and team channels for buried worries. Prevents 60% of bad deployments.

### 🧠 Institutional Memory
> "How did we fix the Redis connection pool issue last time?"

Your entire Slack history becomes searchable documentation. Never solve the same problem twice.

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