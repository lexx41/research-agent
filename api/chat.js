export default async function handler(req, res) {
  // 1. Разрешаем только POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Проверяем наличие ключа в переменных окружения
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) {
    return res.status(500).json({ error: 'Ошибка конфигурации сервера' });
  }

  const { messages, systemPrompt } = req.body;

  try {
    // 3. Запрос к Groq API
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
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

    // 4. Обработка ошибок API
    if (!response.ok) {
      if (response.status === 429) {
        return res.status(429).json({
          error: '⏳ Лимит запросов/токенов Groq исчерпан. Подождите пару минут или обновите ключ.'
        });
      }
      if (response.status === 401) {
        return res.status(401).json({
          error: '🔑 Недействительный API-ключ. Проверьте переменную GROQ_API_KEY в Vercel.'
        });
      }
      // Остальные ошибки Groq
      return res.status(response.status).json({
        error: data.error?.message || 'Ошибка при обращении к Groq API'
      });
    }

    // 5. Успешный ответ
    return res.status(200).json(data);

  } catch (error) {
    // Сетевые ошибки, таймауты и т.д.
    return res.status(500).json({ error: '🌐 Ошибка соединения с сервером. Попробуйте позже.' });
  }
}
