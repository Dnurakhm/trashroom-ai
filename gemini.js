export async function generateGameRound(theme = "общая", playerCount = 4) {
  const prompt = `
Ты AI-хост трэш-игры. Сгенерируй ТОЛЬКО JSON. Никаких пояснений, markdown или форматирования. Пример:

{
  "topic": "Кто токсичнее: дизайнер или тестировщик?",
  "roles": ["Тестировщик на удалёнке", "Дизайнер из Telegram", ...]
}

Тема: ${theme}
Ролей: ${playerCount}
`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // ✅ Вставим отладочный вывод
  console.log("🟡 PROMPT отправлен в Gemini:\n", prompt);
  console.log("🟢 ОТВЕТ от Gemini:\n", text);

  try {
    const match = text.match(/\{[\s\S]*?\}/);
    return JSON.parse(match[0]);
  } catch (err) {
    console.error("🔴 Ошибка парсинга Gemini ответа:", err);
    return {
      topic: "Ошибка генерации темы",
      roles: Array(playerCount).fill("Безумный участник")
    };
  }
}
