# Multi-LLM Project

This project demonstrates how to switch between multiple Large Language Models (LLMs) using TypeScript and Node.js. It supports GPT-4.0 from OpenAI and Claude 3.5 from Anthropic.

## Features

- Switch between GPT-4 and Claude 3.5 using a command-line argument
- Chat interface with a simple loop for sending messages to the selected LLM
- Environment variables for API keys

## Installation

1. Clone the repository.
2. Install the dependencies:
   ```bash
   npm install
   ```

3. Set up your environment variables in a `.env` file:
   ```bash
   OPENAI_API_KEY=your-openai-api-key
   ANTHROPIC_API_KEY=your-anthropic-api-key
   ```

## Usage

1. Build the project:
   ```bash
   npm run build
   ```

2. Run the project:
   ```bash
   npm start gpt-4
   ```

   or

   ```bash
   npm start claude
   ```

## License

This project is licensed under the MIT License.

