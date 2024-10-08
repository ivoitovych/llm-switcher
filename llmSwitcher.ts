import axios from 'axios';
import dotenv from 'dotenv';
import readline from 'readline';

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
  name: 'Claude 3 (Anthropic)',
  sendMessage: async (message: string) => {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) throw new Error('Anthropic API key not found.');

    try {
      const response = await axios.post(
        'https://api.anthropic.com/v1/messages',
        {
          model: 'claude-3-sonnet-20240229',
          max_tokens: 1024,
          messages: [{ role: 'user', content: message }]
        },
        {
          headers: {
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data.content[0].text;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error in API request:', error.response ? error.response.data : error.message);
      } else {
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

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function askQuestion(query: string): Promise<string> {
  return new Promise(resolve => rl.question(query, resolve));
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
    const userInput = await askQuestion('You: ');
    if (userInput.toLowerCase() === 'exit') {
      console.log('Exiting...');
      rl.close();
      break;
    }
    console.log(`You entered: ${userInput}`);

    try {
      const llmResponse = await llm.sendMessage(userInput);
      console.log(`${llm.name}: ${llmResponse}`);
    } catch (error) {
      console.error('Error:', error);
    }
  }
}

main().catch((error) => console.error('Main Error:', error));


