// trashroom-ai/server.js
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import {
  createRoom,
  joinRoom,
  getRoom,
  startGame,
  submitResponse,
  submitVote
} from "./rooms.js";

dotenv.config();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(bodyParser.json());

// Отдаем статические файлы собранного React-приложения
app.use(express.static(path.join(__dirname, "client", "dist")));

// --- API РОУТЫ ---
app.post("/api/create-room", (req, res) => {
  const { theme, maxPlayers } = req.body;
  console.log('[SERVER] /api/create-room received:', { theme, maxPlayers });
  const room = createRoom(theme, parseInt(maxPlayers));
  if (!room) return res.status(500).json({ error: "Ошибка создания комнаты на сервере" });
  res.json(room);
});

app.post("/api/join-room", (req, res) => {
  const { roomId, playerName } = req.body;
  const room = joinRoom(roomId, playerName);
  if (!room) {
    const existingRoom = getRoom(roomId);
    if (!existingRoom) return res.status(404).json({ error: "Комната не найдена" });
    if (existingRoom.players.length >= existingRoom.maxPlayers) return res.status(400).json({ error: "Комната переполнена" });
    return res.status(400).json({ error: "Не удалось присоединиться к комнате" });
  }
  res.json(room);
});

app.get("/api/room/:id", (req, res) => {
  const room = getRoom(req.params.id);
  if (!room) return res.status(404).json({ error: "Комната не найдена" });
  res.json(room);
});

app.post("/api/start-game", async (req, res) => {
  const { roomId } = req.body;
  try {
    const room = await startGame(roomId);
    if (!room) return res.status(400).json({ error: "Невозможно начать игру (комната не готова или не найдена)" });
    res.json(room);
  } catch (error) {
    console.error("Start game error on server:", error);
    res.status(500).json({ error: "Серверная ошибка при старте игры: " + error.message });
  }
});

app.post("/api/submit-response", (req, res) => {
  const { roomId, playerName, text } = req.body;
  const room = submitResponse(roomId, playerName, text);
  if (!room) return res.status(400).json({ error: "Ответ не принят (игра не в том состоянии или игрок уже отвечал)" });
  res.json(room);
});

app.post("/api/submit-vote", (req, res) => {
  const { roomId, votedFor } = req.body;
  const room = getRoom(roomId); 

  if (!room) {
    return res.status(404).json({ error: "Комната не найдена" });
  }

  // Голосовать можно только в состоянии 'voting'
  if (room.state !== "voting") {
    return res.status(400).json({ error: "Голосование сейчас недоступно в этой комнате." });
  }

  const updatedRoom = submitVote(roomId, votedFor);
  
  if (!updatedRoom) { 
    return res.status(400).json({ error: "Голос не принят (возможно, неверные данные)" });
  }
  res.json(updatedRoom);
});

// Для всех остальных GET запросов отдаем index.html из React сборки
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, "client", "dist", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});