import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import type { Timestamp } from 'firebase/firestore';
import { useCountdown } from '@/hooks/useCountdown';
import { TIMER_DURATION_SECONDS } from '@/types/index';

interface CountdownTimerProps {
  timerStart: Timestamp | undefined;
  isMaster: boolean;
  onExpire: () => void;
}

function CountdownTimer({ timerStart, isMaster, onExpire }: CountdownTimerProps) {
  const { secondsRemaining, isExpired } = useCountdown(
    timerStart,
    TIMER_DURATION_SECONDS,
  );

  const hasCalledExpire = useRef(false);

  useEffect(() => {
    // Only the master triggers endStory to avoid duplicate Firestore writes
    if (isExpired && isMaster && !hasCalledExpire.current) {
      hasCalledExpire.current = true;
      onExpire();
    }
  }, [isExpired, isMaster, onExpire]);

  // Reset when timerStart changes (new story started)
  useEffect(() => {
    hasCalledExpire.current = false;
  }, [timerStart]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  const isLow = secondsRemaining <= 30 && secondsRemaining > 0;

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 2,
      }}
    >
      <Typography
        variant="h2"
        component="span"
        sx={{
          fontFamily: 'monospace',
          fontWeight: 700,
          color: isExpired
            ? 'error.main'
            : isLow
              ? 'error.main'
              : 'text.primary',
          transition: 'color 0.3s ease',
        }}
      >
        {display}
      </Typography>
    </Box>
  );
}

export default CountdownTimer;
