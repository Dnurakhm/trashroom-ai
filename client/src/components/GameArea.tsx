// client/src/components/GameArea.tsx (или .jsx)
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Timer from './Timer';
import { FiSend, FiThumbsUp, FiLoader, FiUsers, FiMessageSquare, FiAward, FiRefreshCw, FiCopy } from 'react-icons/fi'; // FiCopy можно оставить или убрать, если не используется
import { toast } from 'sonner';
// УБИРАЕМ ИМПОРТ QR-КОДА: import QRCode from "react-qr-code";

const GameArea = ({ roomId, playerName, initialGameData, apiClient, refreshRoomData }) => {
  const [gameData, setGameData] = useState(initialGameData);
  const [answer, setAnswer] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [hasVoted, setHasVoted] = useState(false);

  const pollingIntervalRef = useRef(null);

  const playerRole = gameData?.players?.find(p => p.name === playerName)?.role || gameData?.role || "Неизвестная роль";
  const gameTopic = gameData?.topic || "Тема не определена";
  const gameDuration = gameData?.duration || gameData?.roundDuration || 60;

  // УБИРАЕМ publicVoteUrl и copyPublicLink, если они не нужны без QR
  // const publicVoteUrl = roomId ? `${window.location.origin}/vote/${roomId}` : '';
  // const copyPublicLink = () => { /* ... */ };


  useEffect(() => {
    setGameData(initialGameData);
    if (initialGameData.state === "started" || initialGameData.state === "answering") {
      setHasSubmitted(false);
      setHasVoted(false);
      setAnswer('');
    }
  }, [initialGameData]);

  const fetchCurrentRoomState = useCallback(async () => {
    if (!roomId || !apiClient) return;
    try {
      const latestRoomData = await apiClient.fetchRoomState(roomId);
      
      if (gameData.state === "waiting" && (latestRoomData.state === "started" || latestRoomData.state === "answering")) {
        toast.info("🎉 Игра началась!");
      }
      setGameData(latestRoomData);

      if ((gameData.state === "started" || gameData.state === "answering") && latestRoomData.state === "voting") {
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        toast.info("🗳️ Голосование началось!");
      }
    } catch (error) {
      console.error("GameArea: Error fetching room state:", error);
    }
  }, [roomId, apiClient, gameData.state]);

  useEffect(() => {
    if (roomId && apiClient && (gameData.state === "started" || gameData.state === "answering" || gameData.state === "waiting")) {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = setInterval(fetchCurrentRoomState, 3000);
    } else {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    }
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [roomId, apiClient, gameData.state, fetchCurrentRoomState]);

  const handleTimeUp = useCallback(() => {
    // ... (остается как было)
    if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    toast.info("⏰ Время вышло!");
    fetchCurrentRoomState(); 
    if(!hasSubmitted){
        setHasSubmitted(true); 
    }
  }, [fetchCurrentRoomState, hasSubmitted]);

  const handleSubmitAnswer = async (e) => {
    // ... (остается как было)
    e.preventDefault();
    if (!answer.trim()) {
      toast.error("Напиши хоть что-нибудь, гений мысли!");
      return;
    }
    setIsLoading(true);
    try {
      const updatedRoomData = await apiClient.submitResponse({ roomId, playerName, text: answer });
      setGameData(updatedRoomData);
      setHasSubmitted(true);
      toast.success("Ответ принят! Ждем остальных...");
    } catch (error) {
      console.error("Submit answer error:", error);
      toast.error(`Не удалось отправить ответ: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVote = async (votedFor) => {
    // ... (остается как было)
    if (hasVoted) {
        toast.warn("Ты уже голосовал, читер! 😉");
        return;
    }
    setIsLoading(true);
    try {
      const updatedRoom = await apiClient.submitVote({ roomId, votedFor });
      setHasVoted(true);
      setGameData(updatedRoom);
      toast.success(`Голос за ${votedFor} учтен!`);
    } catch (error) {
      console.error("Vote error:", error);
      toast.error(`Ошибка голосования: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (gameData.state === 'waiting' || !gameData.state) {
    // ... (JSX для состояния ожидания остается как было)
    return (
      <div className="w-full max-w-2xl bg-dark-card p-6 sm:p-8 rounded-xl shadow-xl text-center space-y-4">
        <FiUsers size={48} className="mx-auto text-brand-secondary animate-bounce" />
        <h2 className="text-2xl font-semibold">Ожидание игроков...</h2>
        <p className="text-subtle-text">Комната: <span className="font-bold text-brand-primary">{roomId}</span></p>
        <p className="text-subtle-text">Тема комнаты: <span className="font-bold text-brand-secondary">{gameData?.theme || initialGameData?.theme || 'Не указана'}</span></p>
        <p className="text-subtle-text">Игроков: {gameData?.players?.length || 0} из {gameData?.maxPlayers || initialGameData?.maxPlayers || 'N/A'}</p>
        <p className="text-subtle-text">Скоро начнется трэш! Приготовься...</p>
        <div className="flex items-center justify-center gap-2 pt-4">
            <FiLoader className="animate-spin text-brand-primary" size={32}/>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl bg-dark-card p-6 sm:p-8 rounded-xl shadow-2xl space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold text-brand-accent animate-wiggle">🎭 Твоя роль: {playerRole}</h2>
        <p className="text-lg sm:text-xl text-brand-secondary">💥 Тема: {gameTopic}</p>
      </div>

      {(gameData.state === 'started' || gameData.state === 'answering') && !hasSubmitted && (
        <>
          <Timer initialSeconds={gameDuration} onTimeUp={handleTimeUp} />
          <form onSubmit={handleSubmitAnswer} className="w-full flex flex-col items-center space-y-3"> {/* Изменил space-y, если нужно меньше */}
            <textarea
              id="answer"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Твой гениальный (или не очень) трэш-ответ здесь..."
              rows="4"
              className="w-full max-w-lg bg-dark-input text-light-text placeholder-subtle-text p-3 rounded-lg border-2 border-transparent focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none resize-none block"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="w-full max-w-lg flex items-center justify-center gap-x-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <FiLoader className="animate-spin h-5 w-5" />
              ) : (
                <FiSend className="h-5 w-5" />
              )}
              <span>Отправить свой шедевр</span>
            </button>
          </form>
        </>
      )}

      {(gameData.state === 'started' || gameData.state === 'answering') && hasSubmitted && (
        // ... (JSX для состояния "ответ отправлен" остается как было)
        <div className="text-center p-6 bg-dark-input rounded-lg">
            <FiMessageSquare size={40} className="mx-auto text-green-400 mb-3"/>
            <p className="text-xl font-semibold text-green-400">Твой ответ отправлен!</p>
            <p className="text-subtle-text">Ожидаем других игроков... <FiLoader className="inline animate-spin ml-2" /></p>
        </div>
      )}

      {gameData.state === 'voting' && (
        <div className="space-y-4">
          <h3 className="text-2xl font-semibold text-center text-brand-primary flex items-center justify-center gap-2">
            <FiAward /> Голосуй за лучший трэш!
          </h3>
          
          {/* УБИРАЕМ БЛОК С QR-КОДОМ И ССЫЛКОЙ */}
          
          <ul className="space-y-3 max-h-80 overflow-y-auto pr-2">
            {gameData.responses?.map((resp, index) => (
              <li key={index} className="p-4 bg-dark-input rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <strong className="text-brand-accent">{resp.name === playerName ? `Ты (${playerRole}) ✨` : resp.name}:</strong>
                    <p className="text-light-text ml-2 whitespace-pre-wrap">{resp.text}</p>
                  </div>
                  {resp.name !== playerName && !hasVoted && (
                    <button
                      onClick={() => handleVote(resp.name)}
                      disabled={isLoading}
                      className="ml-4 flex-shrink-0 bg-brand-secondary hover:bg-blue-400 text-dark-bg font-semibold py-2 px-3 rounded-md text-sm transition-transform transform hover:scale-110 disabled:opacity-50"
                    >
                       <FiThumbsUp className="inline mr-1"/> Голос!
                    </button>
                  )}
                </div>
                {(gameData.votes && gameData.votes[resp.name] !== undefined) && (
                    <p className="text-xs text-green-400 mt-1">🔥 Голосов: {gameData.votes[resp.name]}</p>
                )}
              </li>
            ))}
          </ul>
          {hasVoted && (
            <p className="text-center text-green-400 font-semibold p-3 bg-dark-input rounded-lg">
                ✅ Твой голос учтен! Ожидаем результатов...
            </p>
          )}
           <button
              onClick={() => fetchCurrentRoomState()}
              disabled={isLoading}
              className="mt-4 w-full flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              <FiRefreshCw className={isLoading ? "animate-spin" : ""} /> Обновить состояние
            </button>
        </div>
      )}
    </div>
  );
};

export default GameArea;