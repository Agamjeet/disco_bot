# Discord Bot with OpenAI Integration

A Discord bot that uses the Discord Interactions API and OpenAI's API to provide interactive features and AI-powered responses.

## Features

- Slash commands support
- OpenAI integration for AI-powered responses
- Interactive components (buttons, modals, etc.)
- Express server for handling Discord interactions

## Prerequisites

- Node.js 18.x or higher
- A Discord account
- An OpenAI API key
- ngrok (for local development)

## Setup Instructions

### 1. Create a Discord Application

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Go to the "Bot" section and click "Add Bot"
4. Under the "Privileged Gateway Intents" section, enable:
   - MESSAGE CONTENT INTENT
5. Save your changes
6. Go to "OAuth2" → "URL Generator"
7. Select the following scopes:
   - `bot`
   - `applications.commands`
8. Select the following bot permissions:
   - Send Messages
   - Use Slash Commands
9. Copy the generated URL and use it to invite the bot to your server

### 2. Get Your Credentials

You'll need to collect the following credentials:

1. From Discord Developer Portal:
   - Application ID (APP_ID)
   - Bot Token (DISCORD_TOKEN)
   - Public Key (PUBLIC_KEY)

2. From OpenAI:
   - API Key (OPENAI_API_KEY)

### 3. Project Setup

1. Clone the repository:
```bash
git clone <your-repo-url>
cd discord-example-app
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following content:
```env
APP_ID=your_discord_app_id
DISCORD_TOKEN=your_discord_bot_token
PUBLIC_KEY=your_discord_public_key
OPENAI_API_KEY=your_openai_api_key
```

### 4. Register Slash Commands

Run the following command to register the bot's slash commands with Discord:
```bash
npm run register
```

### 5. Set Up Local Development

1. Install ngrok if you haven't already:
   - Download from [ngrok.com](https://ngrok.com)
   - Follow their installation instructions

2. Start ngrok to create a tunnel:
```bash
ngrok http 3000
```

3. Copy the HTTPS URL provided by ngrok (e.g., `https://1234-someurl.ngrok.io`)

4. Go to your Discord Application settings
5. Navigate to "General Information"
6. Set the "Interactions Endpoint URL" to your ngrok URL + `/interactions`
   (e.g., `https://1234-someurl.ngrok.io/interactions`)
7. Save the changes

### 6. Run the Bot

Start the bot in development mode with auto-reload:
```bash
npm run dev
```

Or start it in production mode:
```bash
npm start
```

## Available Commands

The bot includes several slash commands. You can view all available commands by typing `/` in your Discord server.

## Project Structure

```
├── app.js              # Main application entry point
├── commands.js         # Slash command definitions
├── openai-handler.js   # OpenAI integration
├── utils.js           # Utility functions
├── package.json       # Project dependencies
└── .env              # Environment variables (create this)
```

## Troubleshooting

1. **Bot not responding to commands**
   - Ensure the bot has the correct permissions in your server
   - Verify that the slash commands were registered successfully
   - Check if the interactions endpoint URL is correctly set

2. **OpenAI integration not working**
   - Verify your OpenAI API key is correct
   - Check if you have sufficient credits in your OpenAI account
   - Ensure the API key has the necessary permissions

3. **Local development issues**
   - Make sure ngrok is running and the URL is up to date
   - Verify all environment variables are set correctly
   - Check the console for any error messages

## Contributing

Feel free to submit issues and enhancement requests!

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
