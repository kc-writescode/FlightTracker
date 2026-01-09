"use client";

import { useState } from 'react';
import styles from './SearchInput.module.css';

interface SearchInputProps {
    onSearch: (term: string, date?: string) => void;
    isLoading?: boolean;
}

export default function SearchInput({ onSearch, isLoading }: SearchInputProps) {
    const [flightNumber, setFlightNumber] = useState('');
    const [date, setDate] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (flightNumber.trim()) {
            // Pass both flight number and date as a combined string or object?
            // The prop expects a string. Let's change the prop interface first? 
            // Or just pass flightNumber for now and handle date differently?
            // Actually, the plan said "Update the onSearch callback to pass both". 
            // But the interface currently takes `term: string`. 
            // I'll overload the term to be "flightNumber::date" or change the interface.
            // Changing the interface is cleaner, but requires updating the parent immediately.
            // Let's stick to the current string interface for simplicity if strict typing isn't super modified:
            // "FLIGHT|DATE" -> parent parses it.
            // OR better: change the props interface now.

            // Let's keep it simple and change the parent to accept two args?
            // Parent is page.tsx.
            // SearchInput is defined here.

            // I'll update the interface to accept date but to maintain compatibility/ease,
            // I'll update the onSearch signature.
            onSearch(flightNumber.trim(), date);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.inputWrapper}>
                <input
                    type="text"
                    className={styles.input}
                    placeholder="Flight No. (e.g. BA1849)"
                    value={flightNumber}
                    onChange={(e) => setFlightNumber(e.target.value)}
                    disabled={isLoading}
                />
                <div className={styles.divider} />
                <input
                    type="date"
                    className={styles.dateInput}
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    disabled={isLoading}
                />
                <button type="submit" className={styles.searchIcon} disabled={isLoading}>
                    {isLoading ? (
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="animate-spin"
                            style={{ animation: 'spin 1s linear infinite' }}
                        >
                            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                        </svg>
                    ) : (
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    )}
                </button>
            </form>
            <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
