async function run() {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  const generateModels = data.models.filter(m => m.supportedGenerationMethods.includes('generateContent'));
  console.log(generateModels.map(m => m.name));
}
run();
