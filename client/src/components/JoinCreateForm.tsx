import React, { useState, useEffect } from 'react';
import { FiPlusCircle, FiLogIn, FiCopy, FiLoader } from 'react-icons/fi';
import { toast } from 'sonner';

const InputField = ({ id, placeholder, type = "text", value, onChange, icon, className = "", disabled = false, min, max }) => (
  <div className={`relative ${className}`}>
    {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-subtle-text">{icon}</div>}
    <input
      id={id}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      min={min}
      max={max}
      disabled={disabled}
      className={`w-full bg-dark-input text-light-text placeholder-subtle-text p-3 ${icon ? 'pl-10' : ''} rounded-lg border-2 border-transparent focus:border-brand-primary focus:ring-1 focus:ring-brand-primary transition-all outline-none disabled:opacity-50 disabled:cursor-not-allowed`}
    />
  </div>
);

const JoinCreateForm = ({ onCreateRoom, onJoinRoom, generatedRoomId, isLoading }) => {
  const [nickname, setNickname] = useState('');
  const [theme, setTheme] = useState('');
  const [count, setCount] = useState(3);
  const [joinRoomId, setJoinRoomId] = useState('');

  useEffect(() => {
    if (generatedRoomId) {
      setJoinRoomId(generatedRoomId);
    }
  }, [generatedRoomId]);

  const handleCreate = (e) => {
    e.preventDefault();
    if (!theme.trim()) {
        toast.error("Нужно выбрать тематику для комнаты!");
        return;
    }
    onCreateRoom({ theme, maxPlayers: parseInt(count) });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!nickname.trim()) {
        toast.error("Как тебя зовут, герой?");
        return;
    }
    if (!joinRoomId.trim()) {
        toast.error("Без ID комнаты никуда!");
        return;
    }
    onJoinRoom({ roomId: joinRoomId, playerName: nickname });
  };

  const copyRoomId = () => {
    if (generatedRoomId) {
      navigator.clipboard.writeText(generatedRoomId);
      toast.success("ID комнаты скопирован! ✨");
    }
  };

  return (
    <div className="w-full max-w-md bg-dark-card p-6 sm:p-8 rounded-xl shadow-2xl space-y-6 transform transition-all duration-500 hover:shadow-neon-primary">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center text-brand-secondary">Создать тусу 👇</h2>
        <form onSubmit={handleCreate} className="space-y-4">
          <InputField id="theme" placeholder="Тематика (IT, Мемы, Аниме...)" value={theme} onChange={(e) => setTheme(e.target.value)} disabled={isLoading}/>
          <InputField id="count" type="number" placeholder="Макс. игроков (2-10)" value={count} onChange={(e) => setCount(Math.max(2, Math.min(10, parseInt(e.target.value) || 2)))} min="2" max="10" disabled={isLoading}/>
          <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-brand-primary hover:bg-brand-primary-hover text-white font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? <FiLoader className="animate-spin"/> : <FiPlusCircle />} Создать комнату
          </button>
        </form>
      </div>

      <div className="border-t border-gray-700 my-6"></div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-center text-brand-secondary">Залететь на движ 👇</h2>
        <form onSubmit={handleJoin} className="space-y-4">
          <InputField id="nickname" placeholder="Твой никнейм 🤖" value={nickname} onChange={(e) => setNickname(e.target.value)} disabled={isLoading}/>
          <div className="relative">
            <InputField id="joinRoomId" placeholder="ID комнаты" value={joinRoomId} onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())} disabled={isLoading}/>
            {generatedRoomId && joinRoomId === generatedRoomId && (
              <button type="button" onClick={copyRoomId} title="Копировать ID" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-subtle-text hover:text-brand-primary transition-colors" disabled={isLoading}>
                <FiCopy size={20}/>
              </button>
            )}
          </div>
          <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 bg-brand-secondary hover:bg-blue-400 text-dark-bg font-bold py-3 px-4 rounded-lg transition-transform transform hover:scale-105 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed">
            {isLoading ? <FiLoader className="animate-spin"/> : <FiLogIn />} Присоединиться
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinCreateForm;