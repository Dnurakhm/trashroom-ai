import React, { useState, useEffect } from 'react';
import { FiClock } from 'react-icons/fi';

const Timer = ({ initialSeconds, onTimeUp }) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const intervalId = setInterval(() => {
      setSecondsLeft((prevSeconds) => prevSeconds - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  const progress = (initialSeconds > 0 ? (secondsLeft / initialSeconds) : 0) * 100;
  let progressColor = 'bg-green-500';
  if (progress < 50) progressColor = 'bg-yellow-500';
  if (progress < 25) progressColor = 'bg-red-500';

  return (
    <div className="my-4 p-3 bg-dark-input rounded-lg shadow">
      <div className="flex items-center justify-between mb-1 text-sm text-subtle-text">
        <div className="flex items-center gap-2">
          <FiClock className="text-brand-secondary" />
          <span>Время на подумать:</span>
        </div>
        <span className={`font-mono text-lg ${secondsLeft < 10 && secondsLeft > 0 ? 'text-red-400 animate-ping' : (secondsLeft === 0 ? 'text-red-500' : 'text-green-400')}`}>
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </span>
      </div>
      <div className="w-full bg-gray-700 rounded-full h-2.5">
        <div
          className={`${progressColor} h-2.5 rounded-full transition-all duration-500 ease-linear`}
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default Timer;