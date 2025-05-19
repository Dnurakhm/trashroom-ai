import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateGameRound(playerCount = 4) {
  const prompt = `
Ты — ведущий юмористической трэш-игры. Твоя задача:
1. Сгенерировать провокационную тему для дискуссии.
2. Назначить каждому игроку забавную или трэшовую роль (например: "Уволенный программист", "Токсичный маркетолог", "Инфлюенсер-неудачник").

Ответь строго в формате:
{
  "topic": "тема",
  "roles": ["роль1", "роль2", "роль3", "роль4"]
}
Количество ролей = ${playerCount}.
`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch (err) {
    return {
      topic: "Ошибка генерации темы",
      roles: Array(playerCount).fill("Игрок без роли")
    };
  }
}
