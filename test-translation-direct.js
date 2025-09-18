// Test the OpenAI translation function directly
const { translateText } = require('./src/lib/translation.ts');

async function testTranslation() {
  try {
    console.log('Testing OpenAI translation directly...');
    console.log('OPENAI_API_KEY configured:', !!process.env.OPENAI_API_KEY);
    
    // Test English to other languages
    console.log('\n--- Testing English Text ---');
    const englishResult = await translateText('Hello, this is a test message');
    console.log('English result:', englishResult);
    
    // Test Spanish to other languages
    console.log('\n--- Testing Spanish Text ---');
    const spanishResult = await translateText('Hola, este es un mensaje de prueba');
    console.log('Spanish result:', spanishResult);
    
    // Test Turkish to other languages
    console.log('\n--- Testing Turkish Text ---');
    const turkishResult = await translateText('Merhaba, bu bir test mesajıdır');
    console.log('Turkish result:', turkishResult);
    
  } catch (error) {
    console.error('Translation test failed:', error);
  }
}

testTranslation();