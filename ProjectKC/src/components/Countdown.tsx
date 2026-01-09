"use client";

import { useState, useEffect, useCallback } from 'react';
import styles from './Countdown.module.css';
import confetti from 'canvas-confetti';

const TARGET_DATE = "2026-01-12T05:20:00+05:30"; // Jan 12, 5:20 AM IST

export default function Countdown() {
    const [timeLeft, setTimeLeft] = useState({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0
    });
    const [isArrived, setIsArrived] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    const fireConfetti = useCallback(() => {
        const duration = 5 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

        const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

        const interval: any = setInterval(function () {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            // since particles fall down, start a bit higher than random
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
            confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        }, 250);
    }, []);

    useEffect(() => {
        setIsMounted(true);
        const target = new Date(TARGET_DATE).getTime();

        const checkArrival = () => {
            const now = new Date().getTime();
            if (target - now <= 0) {
                setIsArrived(true);
                fireConfetti();
                return true;
            }
            return false;
        };

        // Check immediately on mount (handles refresh after arrival)
        if (checkArrival()) return;

        // Otherwise set up a timer to check every second
        const timer = setInterval(() => {
            if (checkArrival()) {
                clearInterval(timer);
            } else {
                const now = new Date().getTime();
                const difference = target - now;
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [fireConfetti]);

    if (!isMounted) return null;

    if (isArrived) {
        return (
            <div className={styles.container}>
                <div className={styles.welcomeWrapper}>
                    <div className={styles.welcomeTitle}>Welcome Home, Vardhu! ❤️🏡</div>
                    <p className={styles.welcomeSubtitle}>The Star is Back with a Bang!<br />Waiting to meet you at the airport, see you soon Akka!</p>
                    <div className={styles.celebration}>✨🇮🇳✈️🏠✨</div>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.title}>Landing in India (IST)</div>
            <div className={styles.targetTime}>Jan 12, 2026 • 05:20 AM</div>

            <div className={styles.timer}>
                <div className={styles.segment}>
                    <span className={styles.value}>{timeLeft.days}</span>
                    <span className={styles.label}>Days</span>
                </div>
                <div className={styles.divider}>:</div>
                <div className={styles.segment}>
                    <span className={styles.value}>{timeLeft.hours.toString().padStart(2, '0')}</span>
                    <span className={styles.label}>Hours</span>
                </div>
                <div className={styles.divider}>:</div>
                <div className={styles.segment}>
                    <span className={styles.value}>{timeLeft.minutes.toString().padStart(2, '0')}</span>
                    <span className={styles.label}>Minutes</span>
                </div>
                <div className={styles.divider}>:</div>
                <div className={styles.segment}>
                    <span className={styles.value}>{timeLeft.seconds.toString().padStart(2, '0')}</span>
                    <span className={styles.label}>Seconds</span>
                </div>
            </div>
        </div>
    );
}
