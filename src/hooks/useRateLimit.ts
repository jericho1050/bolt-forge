import { useState, useCallback, useRef } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs: number;
}

interface RateLimitState {
  attempts: number;
  isBlocked: boolean;
  remainingTime: number;
  canAttempt: boolean;
}

export function useRateLimit(config: RateLimitConfig) {
  const [state, setState] = useState<RateLimitState>({
    attempts: 0,
    isBlocked: false,
    remainingTime: 0,
    canAttempt: true,
  });

  const attemptsRef = useRef<number[]>([]);
  const blockTimeoutRef = useRef<NodeJS.Timeout>();
  const countdownRef = useRef<NodeJS.Timeout>();

  const updateRemainingTime = useCallback((endTime: number) => {
    const updateTime = () => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((endTime - now) / 1000));
      
      setState(prev => ({ ...prev, remainingTime: remaining }));
      
      if (remaining > 0) {
        countdownRef.current = setTimeout(updateTime, 1000);
      }
    };
    
    updateTime();
  }, []);

  const recordAttempt = useCallback(() => {
    const now = Date.now();
    
    // Remove attempts outside the window
    attemptsRef.current = attemptsRef.current.filter(
      time => now - time < config.windowMs
    );
    
    // Add current attempt
    attemptsRef.current.push(now);
    
    const currentAttempts = attemptsRef.current.length;
    
    if (currentAttempts >= config.maxAttempts) {
      // Block user
      const blockEndTime = now + config.blockDurationMs;
      
      setState({
        attempts: currentAttempts,
        isBlocked: true,
        remainingTime: Math.ceil(config.blockDurationMs / 1000),
        canAttempt: false,
      });
      
      updateRemainingTime(blockEndTime);
      
      // Clear block after duration
      if (blockTimeoutRef.current) {
        clearTimeout(blockTimeoutRef.current);
      }
      
      blockTimeoutRef.current = setTimeout(() => {
        attemptsRef.current = [];
        setState({
          attempts: 0,
          isBlocked: false,
          remainingTime: 0,
          canAttempt: true,
        });
        
        if (countdownRef.current) {
          clearTimeout(countdownRef.current);
        }
      }, config.blockDurationMs);
    } else {
      setState(prev => ({
        ...prev,
        attempts: currentAttempts,
        canAttempt: true,
      }));
    }
    
    return currentAttempts < config.maxAttempts;
  }, [config, updateRemainingTime]);

  const reset = useCallback(() => {
    attemptsRef.current = [];
    
    if (blockTimeoutRef.current) {
      clearTimeout(blockTimeoutRef.current);
    }
    
    if (countdownRef.current) {
      clearTimeout(countdownRef.current);
    }
    
    setState({
      attempts: 0,
      isBlocked: false,
      remainingTime: 0,
      canAttempt: true,
    });
  }, []);

  return {
    ...state,
    recordAttempt,
    reset,
    attemptsRemaining: Math.max(0, config.maxAttempts - state.attempts),
  };
}