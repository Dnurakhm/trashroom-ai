import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";
import { generateGameRound } from "./gemini.js";

const app = express();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

let gameState = {
  topic: null,
  roles: [],
  players: [],
};

app.post("/api/start", async (req, res) => {
  const { players } = req.body; // список имён или id игроков
  const round = await generateGameRound(players.length);
  gameState.topic = round.topic;
  gameState.roles = round.roles;
  gameState.players = players.map((name, i) => ({
    name,
    role: round.roles[i]
  }));

  res.json(gameState);
});

app.get("/api/game", (req, res) => {
  res.json(gameState);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
