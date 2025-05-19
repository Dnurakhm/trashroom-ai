import { nanoid } from "nanoid";
import { generateGameRound } from "./gemini.js";

const rooms = {};

export function createRoom(theme, maxPlayers) {
  const id = nanoid(6).toUpperCase();
  rooms[id] = {
    id,
    theme,
    maxPlayers,
    players: [],
    state: "waiting",
    topic: null,
    roles: [],
    responses: [],
    votes: {}
  };
  return rooms[id];
}

export function joinRoom(id, playerName) {
  const room = rooms[id];
  if (!room || room.state !== "waiting") return null;

  const alreadyInRoom = room.players.find(p => p.name === playerName);
  if (alreadyInRoom) return room;

  if (room.players.length >= room.maxPlayers) return null;

  room.players.push({ name: playerName, ready: false });

  if (room.players.length === room.maxPlayers) {
    room.state = "ready";
  }

  return room;
}

export function getRoom(id) {
  return rooms[id] || null;
}

export async function startGame(id) {
  const room = rooms[id];
  if (!room || room.state !== "ready") return null;

  const round = await generateGameRound(room.theme, room.maxPlayers);
  room.topic = round.topic;
  room.roles = round.roles;
  room.responses = [];
  room.votes = {};
  room.state = "started";

  room.players.forEach((player, index) => {
    player.role = round.roles[index];
    player.ready = false;
  });

  return room;
}

export function submitResponse(roomId, playerName, text) {
  const room = rooms[roomId];
  if (!room || room.state !== "started") return null;

  const alreadySubmitted = room.responses.find(r => r.name === playerName);
  if (alreadySubmitted) return null;

  room.responses.push({ name: playerName, text });

  if (room.responses.length === room.players.length) {
    room.state = "voting";
  }

  return room;
}

export function submitVote(roomId, votedFor) {
  const room = rooms[roomId];
  if (!room || room.state !== "voting") return null;

  if (!room.votes[votedFor]) {
    room.votes[votedFor] = 0;
  }
  room.votes[votedFor]++;

  return room;
}
