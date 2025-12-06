import React, { useState, useEffect } from 'react';

interface CountdownProps {
  expiresAt: Date | string;
}

const Countdown: React.FC<CountdownProps> = ({ expiresAt }) => {
  const calculateTimeLeft = () => {
    const difference = new Date(expiresAt).getTime() - new Date().getTime();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft);

  useEffect(() => {
    const timer = setTimeout(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearTimeout(timer);
  });

  const timerComponents: JSX.Element[] = [];

  Object.keys(timeLeft).forEach((interval) => {
    if (!timeLeft[interval as keyof typeof timeLeft]) {
      return;
    }

    timerComponents.push(
      <span key={interval}>
        {timeLeft[interval as keyof typeof timeLeft]}
        {interval.charAt(0)}{' '}
      </span>
    );
  });

  return (
    <div className="text-xs text-center text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-full px-3 py-1">
      Time Left: {timerComponents.length ? timerComponents : <span>Expired</span>}
    </div>
  );
};

export default Countdown;
