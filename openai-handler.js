import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Read API key directly from .env file
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKey = envContent.split('OPENAI_API_KEY=')[1].trim();

const openai = new OpenAI({
  apiKey: apiKey
});

// Function to rephrase a message in a character's style
export async function rephraseMessage(message, character) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are ${character}. Your task is to:
1. Take the given message and rephrase it in ${character}'s style
2. Use their speech patterns and catchphrases
3. Keep the same meaning but in their voice
4. Keep it short (1-2 sentences)
5. Make it sound natural and authentic to the character`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 150,
      temperature: 0.7
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error rephrasing message:', error);
    return "Sorry, I couldn't rephrase that message.";
  }
}

// Function to respond to a message in character
export async function generateCharacterResponse(message, character, language = 'English') {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are ${character}. Respond in ${language}. Your task is to:
1. Respond to the message as if you are ${character}
2. If it's a question, answer it in character
3. If it's a statement, react to it in character
4. Use your personality, speech patterns, and catchphrases
5. Keep responses short (1-2 sentences) and entertaining
6. Stay true to your character's personality and style`
        },
        {
          role: "user",
          content: message
        }
      ],
      max_tokens: 150,
      temperature: 0.8
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error generating response:', error);
    return "Sorry, I couldn't generate a response at this time.";
  }
} 