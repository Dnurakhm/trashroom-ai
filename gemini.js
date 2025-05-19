import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateGameRound(theme = "общая", playerCount = 4) {
  const prompt = `
Ты AI-хост трэш-игры. Генерируй тему и роли в стиле трэш-корпоративной баттл-комнаты.
Тема должна быть в жанре: ${theme}
Сгенерируй JSON:
{
  "topic": "Одна провокационная тема",
  "roles": ["роль 1", "роль 2", ..., до ${playerCount}]
}
`;

  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  try {
    return JSON.parse(text);
  } catch (err) {
    return {
      topic: "Ошибка генерации темы",
      roles: Array(playerCount).fill("Безумный участник")
    };
  }
}
