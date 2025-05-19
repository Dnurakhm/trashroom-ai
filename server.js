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
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

app.post("/api/create-room", (req, res) => {
  const { theme, maxPlayers } = req.body;
  const room = createRoom(theme, parseInt(maxPlayers));
  res.json(room);
});

app.post("/api/join-room", (req, res) => {
  const { roomId, playerName } = req.body;
  const room = joinRoom(roomId, playerName);
  if (!room) {
    return res.status(400).json({ error: "Комната недоступна или переполнена" });
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
  const room = await startGame(roomId);
  if (!room) return res.status(400).json({ error: "Невозможно начать игру" });
  res.json(room);
});

app.post("/api/submit-response", (req, res) => {
  const { roomId, playerName, text } = req.body;
  const room = submitResponse(roomId, playerName, text);
  if (!room) return res.status(400).json({ error: "Ответ не принят" });
  res.json(room);
});

app.post("/api/submit-vote", (req, res) => {
  const { roomId, votedFor } = req.body;
  const room = submitVote(roomId, votedFor);
  if (!room) return res.status(400).json({ error: "Голос не принят" });
  res.json(room);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
