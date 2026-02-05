# AI Reply Maker Desktop App

A powerful desktop application that uses AI to generate professional replies to messages. Built with React, TailwindCSS, Electron, and OpenAI API.

## Features

- 🤖 AI-powered reply generation using OpenAI GPT-4o-mini
- 🎨 Beautiful, modern UI with TailwindCSS
- 💻 Cross-platform desktop app with Electron
- 📝 Multiple tone options (professional, friendly, formal, casual, etc.)
- 📏 Adjustable reply length (short, medium, long)
- 🎯 Various purposes (reply, follow-up, clarification, etc.)
- 📋 Copy to clipboard functionality
- 📚 Reply history with quick reload
- ⚡ Fast and responsive interface

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure OpenAI API Key
1. Open the `.env` file in the root directory
2. Replace `sk-your-key-here` with your actual OpenAI API key:
   ```
   VITE_OPENAI_KEY=sk-your-actual-openai-api-key-here
   ```

### 3. Run the Application
```bash
npm run electron
```

This will:
- Start the Vite development server
- Wait for the server to be ready
- Launch the Electron desktop app

## Usage

1. **Paste Context**: Enter the message you want to reply to in the "Context / Incoming Message" field
2. **Set Recipient** (optional): Specify who you're replying to
3. **Choose Settings**:
   - **Tone**: Select the appropriate tone (professional, friendly, formal, etc.)
   - **Length**: Choose reply length (short, medium, long)
   - **Purpose**: Select the purpose (reply, follow-up, clarification, etc.)
4. **Generate**: Click "Generate Reply" to create an AI-powered response
5. **Copy**: Use the clipboard button to copy the generated reply
6. **History**: View and reload previous replies from the history section

## Available Tones

- **Professional**: Business-appropriate, formal language
- **Friendly**: Warm, approachable tone
- **Formal**: Very formal, official language
- **Casual**: Relaxed, informal tone
- **Apologetic**: Sincere, apologetic tone
- **Enthusiastic**: Excited, positive tone

## Available Purposes

- **Reply**: Standard response to a message
- **Follow-up**: Following up on a previous conversation
- **Clarification**: Asking for or providing clarification
- **Confirmation**: Confirming receipt or understanding
- **Decline**: Politely declining a request
- **Thank You**: Expressing gratitude

## Building for Distribution

To create a distributable executable:

```bash
npm install electron-builder -D
npx electron-builder
```

## Project Structure

```
reply-maker/
├── src/
│   ├── ReplyMaker.jsx    # Main React component
│   ├── main.jsx          # React entry point
│   └── index.css         # TailwindCSS styles
├── electron.js           # Electron main process
├── tailwind.config.js    # TailwindCSS configuration
├── postcss.config.js     # PostCSS configuration
├── .env                  # Environment variables (API key)
└── package.json          # Dependencies and scripts
```

## Dependencies

- **React**: UI framework
- **TailwindCSS**: Styling
- **Electron**: Desktop app framework
- **OpenAI**: AI API integration
- **Vite**: Build tool and dev server
- **Concurrently**: Run multiple commands
- **Wait-on**: Wait for server to be ready

## Troubleshooting

### API Key Issues
- Make sure your OpenAI API key is correctly set in the `.env` file
- Ensure you have sufficient credits in your OpenAI account
- Check that the API key has the necessary permissions

### App Won't Start
- Make sure all dependencies are installed: `npm install`
- Check that port 5173 is available
- Try running `npm run dev` first to test the web version

### Build Issues
- Ensure you have the latest version of Node.js
- Clear node_modules and reinstall: `rm -rf node_modules && npm install`

## License

MIT License - feel free to use and modify as needed.