import axios from 'axios';
import dotenv from 'dotenv';
import readlineSync from 'readline-sync';

// Load environment variables
dotenv.config();

interface LLM {
  name: string;
  sendMessage: (message: string) => Promise<string>;
}

// GPT-4.0 (OpenAI)
const openAiLLM: LLM = {
  name: 'OpenAI GPT-4.0',
  sendMessage: async (message: string) => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error('OpenAI API key not found.');

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.choices[0].message.content;
  },
};

// Claude 3.5 (Anthropic)
const anthropicLLM: LLM = {
  name: 'Claude 3.5 (Anthropic)',
  sendMessage: async (message: string) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('Anthropic API key not found.');

    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/complete',
        {
          prompt: `\n\nHuman: ${message}\n\nAssistant:`,
          model: 'claude-3.5',
          max_tokens_to_sample: 300,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.completion;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Axios-specific error handling
        console.error('Error in API request:', error.response ? error.response.data : error.message);
      } else {
        // General error handling
        console.error('An unexpected error occurred:', error);
      }
      throw error;
    }
  },
};

// LLM selection based on command-line argument
function selectLLM(model: string): LLM {
  switch (model.toLowerCase()) {
    case 'gpt-4':
      return openAiLLM;
    case 'claude':
      return anthropicLLM;
    default:
      throw new Error(`Unknown model: ${model}`);
  }
}

async function main() {
  const model = process.argv[2];
  if (!model) {
    console.log('Please specify the LLM model to use (gpt-4 or claude)');
    process.exit(1);
  }

  const llm = selectLLM(model);
  console.log(`Using LLM: ${llm.name}`);

  while (true) {
    const userInput = readlineSync.question('You: ');
    if (userInput.toLowerCase() === 'exit') {
      console.log('Exiting...');
      break;
    }

    try {
      const llmResponse = await llm.sendMessage(userInput);
      console.log(`${llm.name}: ${llmResponse}`);
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

main().catch((error) => console.error('Main Error:', error));

