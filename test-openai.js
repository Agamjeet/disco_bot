import OpenAI from 'openai';
import fs from 'fs';
import path from 'path';

// Get the absolute path to .env file
const envPath = path.resolve(process.cwd(), '.env');

console.log('\nReading .env file directly:');
console.log('.env file path:', envPath);

// Read API key directly from .env file
const envContent = fs.readFileSync(envPath, 'utf8');
const apiKey = envContent.split('OPENAI_API_KEY=')[1].trim();

console.log('\nAPI Key from .env file:');
console.log(apiKey);

// Create OpenAI instance with the key from .env
const openai = new OpenAI({
    apiKey: apiKey
});

async function testOpenAI() {
    try {
        console.log('\nTesting OpenAI API connection...');
        
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant."
                },
                {
                    role: "user",
                    content: "Say 'Hello, API is working!' if you can read this."
                }
            ],
            max_tokens: 50
        });

        console.log('\nAPI Response:', completion.choices[0].message.content);
        console.log('\nAPI Test Successful! ✅');
    } catch (error) {
        console.error('\nAPI Test Failed! ❌');
        console.error('Error details:', {
            message: error.message,
            type: error.type,
            code: error.code
        });
    }
}

testOpenAI(); 