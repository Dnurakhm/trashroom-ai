// client/src/App.jsx (или .tsx)
import React, { useState, useCallback } from 'react';
// Убираем импорты react-router-dom
import JoinCreateForm from './components/JoinCreateForm';
import GameArea from './components/GameArea';
// Убираем импорт PublicVotePage
import { Toaster, toast } from 'sonner';

const apiClient = {
  createRoom: async ({ theme, maxPlayers }) => {
    const payload = { theme, maxPlayers: parseInt(maxPlayers) };
    console.log('[FRONTEND] apiClient.createRoom sending:', payload);
    const res = await fetch("/api/create-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  },
  joinRoom: async ({ roomId, playerName }) => {
    if (!playerName.trim()) {
      throw new Error("Никнейм не может быть пустым!");
    }
    const res = await fetch("/api/join-room", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, playerName })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: "Ошибка присоединения к комнате" }));
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  },
  startGame: async ({ roomId }) => {
    const res = await fetch("/api/start-game", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId })
    });
     if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  },
  submitResponse: async ({ roomId, playerName, text }) => {
    const res = await fetch("/api/submit-response", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, playerName, text })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  },
  fetchRoomState: async (roomId) => {
    const res = await fetch(`/api/room/${roomId}`);
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP error! status: ${res.status}` }));
        throw new Error(errorData.message || errorData.error || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  },
  submitVote: async ({ roomId, votedFor }) => {
    const res = await fetch("/api/submit-vote", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ roomId, votedFor })
    });
    if (!res.ok) {
        const errorData = await res.json().catch(() => ({ message: `HTTP error! status: ${res.status}` }));
        throw new Error(error_Data.message || errorData.error || `HTTP error! status: ${res.status}`);
    }
    return res.json();
  }
};

const App = () => { // Возвращаем логику GamePage обратно в App
    const [currentRoomId, setCurrentRoomId] = useState(null);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [gameData, setGameData] = useState(null);
    const [view, setView] = useState('join');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreateRoom = async (formData) => {
        setIsLoading(true);
        try {
          const room = await apiClient.createRoom(formData);
          setCurrentRoomId(room.id);
          toast.success(`🔥 Комната ${room.id} создана! Копируй ID и зови друзей!`);
        } catch (error) {
          console.error("Create room error:", error);
          toast.error(`Ошибка создания: ${error.message || 'Неизвестная ошибка'}`);
        } finally {
          setIsLoading(false);
        }
      };

      const handleJoinRoom = async (formData) => {
        setIsLoading(true);
        try {
          const roomData = await apiClient.joinRoom(formData);
          setCurrentRoomId(roomData.id);
          setCurrentPlayer(formData.playerName);
          setGameData(roomData);
          toast.success(`Успешно в комнате ${roomData.id}!`);

          if (roomData.state === "ready") {
            const startedGameData = await apiClient.startGame({ roomId: roomData.id });
            setGameData(startedGameData);
            toast.info("Игра начинается!");
          }
          setView('game');
        } catch (error) {
          console.error("Join room error:", error);
          toast.error(`Не удалось войти: ${error.message || 'Неизвестная ошибка'}`);
        } finally {
          setIsLoading(false);
        }
      };
      
      const refreshRoomAndPotentiallyStart = useCallback(async (roomIdToRefresh) => {
        if (!roomIdToRefresh) return;
        setIsLoading(true);
        try {
            const currentRoomState = await apiClient.fetchRoomState(roomIdToRefresh);
            if (currentRoomState.state === "ready" && gameData?.state !== "started" && gameData?.state !== "answering" && gameData?.state !== "voting") {
                const startedGameData = await apiClient.startGame({ roomId: roomIdToRefresh });
                setGameData(startedGameData);
                toast.info("Игра начинается!");
            } else {
                setGameData(currentRoomState);
            }
        } catch (error) {
            console.error("Error refreshing/starting game:", error);
            toast.error("Не удалось обновить или начать игру.");
        } finally {
            setIsLoading(false);
        }
      }, [gameData]);

    return (
        <> {/* Используем Фрагмент, BrowserRouter больше не нужен здесь */}
            <Toaster richColors position="top-center" duration={3000} />
            <div className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 space-y-8">
                <header className="text-center">
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-primary via-purple-500 to-brand-secondary animate-pulseStrong">
                    🔥 TrashRoom AI 🔥
                    </h1>
                    <p className="text-subtle-text mt-2 text-lg">Трэш-чат нового поколения</p>
                </header>

                {view === 'join' && (
                    <JoinCreateForm
                    onCreateRoom={handleCreateRoom}
                    onJoinRoom={handleJoinRoom}
                    generatedRoomId={currentRoomId}
                    isLoading={isLoading}
                    />
                )}

                {view === 'game' && gameData && (
                    <GameArea
                    roomId={currentRoomId}
                    playerName={currentPlayer}
                    initialGameData={gameData}
                    apiClient={apiClient}
                    refreshRoomData={refreshRoomAndPotentiallyStart}
                    />
                )}
            </div>
        </>
    );
};

export default App;