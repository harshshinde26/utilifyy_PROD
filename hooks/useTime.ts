

import { useState, useRef, useCallback, useEffect } from 'react';

export const useStopwatch = () => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [laps, setLaps] = useState<number[]>([]);
    // FIX: The `useRef` hook requires an initial value when a generic type is specified. Initialized with `null` and updated the type accordingly.
    const animationFrameRef = useRef<number | null>(null);
    const startTimeRef = useRef<number>(0);

    const animate = useCallback(() => {
        setTime(performance.now() - startTimeRef.current);
        animationFrameRef.current = requestAnimationFrame(animate);
    }, []);

    const start = useCallback(() => {
        if (!isRunning) {
            setIsRunning(true);
            startTimeRef.current = performance.now() - time;
            animationFrameRef.current = requestAnimationFrame(animate);
        }
    }, [isRunning, time, animate]);

    const stop = useCallback(() => {
        if (isRunning && animationFrameRef.current) {
            setIsRunning(false);
            cancelAnimationFrame(animationFrameRef.current);
        }
    }, [isRunning]);

    const reset = useCallback(() => {
        setIsRunning(false);
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
        }
        setTime(0);
        setLaps([]);
    }, []);

    const lap = useCallback(() => {
        if (isRunning) {
            setLaps(prevLaps => [...prevLaps, time]);
        }
    }, [isRunning, time]);

    useEffect(() => {
        return () => {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return { time, isRunning, laps, start, stop, reset, lap };
};

export const useTimer = (initialSeconds: number) => {
    const [timeLeft, setTimeLeft] = useState(initialSeconds);
    const [isRunning, setIsRunning] = useState(false);
    // FIX: Replaced `NodeJS.Timeout` with `ReturnType<typeof setInterval>` which is the correct type for browser environments.
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const start = useCallback(() => {
        if (!isRunning && timeLeft > 0) {
            setIsRunning(true);
        }
    }, [isRunning, timeLeft]);

    const pause = useCallback(() => {
        setIsRunning(false);
    }, []);

    const reset = useCallback(() => {
        setIsRunning(false);
        setTimeLeft(initialSeconds);
    }, [initialSeconds]);

    useEffect(() => {
        setTimeLeft(initialSeconds);
    }, [initialSeconds]);

    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        setIsRunning(false);
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    return { timeLeft, isRunning, start, pause, reset };
};