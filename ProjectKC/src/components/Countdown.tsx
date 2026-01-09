"use client";

import { useState, useEffect } from 'react';
import styles from './Countdown.module.css';

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

    useEffect(() => {
        setIsMounted(true);
        const target = new Date(TARGET_DATE).getTime();

        const timer = setInterval(() => {
            const now = new Date().getTime();
            const difference = target - now;

            if (difference <= 0) {
                setIsArrived(true);
                clearInterval(timer);
            } else {
                setTimeLeft({
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60)
                });
            }
        }, 1000);

        return () => clearInterval(timer);
    }, []);

    if (!isMounted) return null;

    if (isArrived) {
        return (
            <div className={styles.container}>
                <div className={styles.welcomeWrapper}>
                    <div className={styles.welcomeTitle}>Welcome Home, Vardhu! ❤️🏡</div>
                    <p className={styles.welcomeSubtitle}>We are so incredibly happy to have you back in India.</p>
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
