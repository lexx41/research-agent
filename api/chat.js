// =============================================
// БЭКЕНД — Vercel Serverless Function
// Этот файл выполняется на сервере Vercel,
// а не в браузере. Ключ Groq хранится здесь
// в переменной окружения GROQ_API_KEY —
// пользователь его никогда не видит.
// =============================================

export default async function handler(req, res) {
  // Разрешаем запросы только методом POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Читаем ключ из переменной окружения Vercel
  // (настраивается в Dashboard → Settings → Environment Variables)
  const GROQ_API_KEY = process.env.GROQ_API_KEY;

  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }

  try {
    // Получаем messages и systemPrompt от браузера
    const { messages, systemPrompt } = req.body;

    // Делаем запрос к Groq API от имени сервера
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        max_tokens: 2000,
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ]
      })
    });

    const data = await response.json();

    // Возвращаем ответ браузеру
    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
}
