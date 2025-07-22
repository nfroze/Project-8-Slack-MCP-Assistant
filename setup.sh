#!/bin/bash

echo "🤖 Setting up Slack MCP Assistant..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cp .env.example .env
    echo "⚠️  Please edit .env and add your Slack Bot Token"
else
    echo "✅ .env file already exists"
fi

# Get the full path for Claude config
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env and add your Slack Bot Token"
echo "2. Add this to your Claude Desktop config:"
echo ""
echo "{"
echo "  \"mcpServers\": {"
echo "    \"slack-assistant\": {"
echo "      \"command\": \"node\","
echo "      \"args\": [\"$SCRIPT_DIR/src/index.js\"]"
echo "    }"
echo "  }"
echo "}"
echo ""
echo "3. Restart Claude Desktop"
echo ""
echo "Happy summarizing! 🚀"