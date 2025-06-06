// File: api/generateAIPrompt.js
// Ini adalah backend proxy Anda yang berjalan di Vercel

export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { baseIdea, constructedOutputTemplate } = request.body;

        if (!baseIdea || !constructedOutputTemplate) {
            return response.status(400).json({ error: 'Ide dasar dan template harus disertakan.' });
        }

        // Ambil API Key dari Environment Variable yang sudah Anda atur di Vercel
        const apiKey = process.env.GOOGLE_API_KEY;

        if (!apiKey) {
            return response.status(500).json({ error: 'Konfigurasi server error: API Key tidak ditemukan.' });
        }

        const promptForApi = `
            You are a world-class prompt engineer for AI image generators. Your task is to take a user's 'Base Idea' and expand it into a detailed, structured prompt in ENGLISH.

            Core Instructions:
            1.  Analyze Base Idea: Deeply analyze the core concepts in: "${baseIdea}".
            2.  Follow Template Strictly: Your entire response MUST strictly follow the structure provided in the 'Output Structure Template'.
            3.  Expand and Detail in ENGLISH: For each line in the template, fill the corresponding [PLACEHOLDER] with vivid and specific details based on the user's idea and the context of the placeholder's label.
            4.  Language: The entire final output must be in ENGLISH.
            5.  Format: Your response should ONLY be the filled-in template. Do not include any preambles or explanations.

            Output Structure Template to Follow:
            ---
            ${constructedOutputTemplate.trim()}
            ---

            Structured Prompt Output (English only):
        `;

        const payload = {
            contents: [{
                parts: [{ text: promptForApi }]
            }]
        };

        const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

        const apiResponse = await fetch(googleApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!apiResponse.ok) {
            const errorData = await apiResponse.json();
            console.error('Error dari Google API:', errorData);
            return response.status(apiResponse.status).json({ error: `Gagal menghubungi Google AI: ${errorData.error?.message || 'Unknown error'}` });
        }

        const result = await apiResponse.json();

        let generatedText = "Tidak ada respons teks dari AI.";
        if (result.candidates && result.candidates.length > 0 &&
            result.candidates[0].content && result.candidates[0].content.parts &&
            result.candidates[0].content.parts.length > 0) {
            generatedText = result.candidates[0].content.parts[0].text;
        }

        // Kirim kembali hasil ke klien
        response.status(200).json({ generatedPrompt: generatedText });

    } catch (error) {
        console.error("Error di Vercel Function:", error);
        response.status(500).json({ error: error.message || "Terjadi kesalahan internal pada server." });
    }
}
