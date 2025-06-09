// File: netlify/functions/generateAIPrompt.js
// Lokasi: di dalam folder /netlify/functions/

// Mengimpor 'fetch' yang diperlukan untuk lingkungan server-side Node.js
const fetch = require('node-fetch');

// Handler utama untuk fungsi serverless
exports.handler = async function(event, context) {
  // Hanya izinkan permintaan dengan metode POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    // Mengambil API key dari environment variable di Netlify (ini cara yang aman)
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
        throw new Error("API Key Gemini belum diatur di Netlify.");
    }

    // Mengambil data yang dikirim dari browser
    const requestBody = JSON.parse(event.body);
    
    // Membangun prompt akhir untuk dikirim ke Gemini
    const finalPrompt = `Based on the user's base idea and their selected template options, create a detailed and vivid image generation prompt. The user's base idea is: "${requestBody.baseIdea}". The user has also selected the following structural elements, which you should elaborate on and integrate naturally into a single, cohesive prompt in ENGLISH:\n\n${requestBody.constructedOutputTemplate}\n\nCombine everything into one powerful and effective final prompt.`;
    
    // === PERUBAHAN UTAMA DI SINI ===
    // Mengganti nama model menjadi 'gemini-2.0-flash' sesuai permintaan
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;
    
    const payload = {
      contents: [{
        parts: [{
          text: finalPrompt
        }]
      }]
    };
    
    // Melakukan fetch ke API Gemini dari sisi server Netlify
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    // Jika respons dari Gemini tidak OK, kirim pesan error
    if (!response.ok) {
        const errorData = await response.json();
        console.error("Error dari Gemini API:", errorData);
        // Mengambil pesan error yang lebih spesifik jika tersedia
        const errorMessage = errorData.error?.message || 'Unknown Gemini API error';
        throw new Error(`Gemini API error: ${errorMessage}`);
    }

    const data = await response.json();
    
    // Menambahkan pengecekan untuk memastikan respons memiliki format yang diharapkan
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0].text) {
        console.error("Struktur respons dari Gemini tidak valid:", data);
        throw new Error("Menerima respons tidak valid dari Gemini API.");
    }

    const generatedText = data.candidates[0].content.parts[0].text;
    
    // Mengirim kembali hasil yang sukses ke browser
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // Izinkan akses dari semua domain
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ generatedPrompt: generatedText })
    };

  } catch (error) {
    console.error('Error di dalam Netlify function:', error);
    // Mengirim kembali pesan error jika terjadi masalah di dalam fungsi
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};
