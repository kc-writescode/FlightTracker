"use client";

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import SearchInput from '@/components/SearchInput';
import FlightCard from '@/components/FlightCard';
import JourneyMap from '@/components/JourneyMap';
import Countdown from '@/components/Countdown';
import MagnifierImage from '@/components/MagnifierImage';
import { Flight } from '@/types/flight';

export default function Home() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const [currentLeg, setCurrentLeg] = useState(0);

  useEffect(() => {
    // Load the specific journey flights on mount
    const loadJourney = async () => {
      setIsLoading(true);
      try {
        const [f1, f2, f3] = await Promise.all([
          fetch('/api/flights?flightNumber=BA1849&date=2026-01-10').then(r => r.json()),
          fetch('/api/flights?flightNumber=BA1515&date=2026-01-10').then(r => r.json()),
          fetch('/api/flights?flightNumber=BA277&date=2026-01-11').then(r => r.json())
        ]);

        // Flatten array of arrays and set
        const allFlights = [...f1, ...f2, ...f3];
        setFlights(allFlights);

        // Calculate current leg based on time
        // Leg 0: Start (Cincy) - Before BA1849 departs
        // Leg 1: JFK - After BA1849 arrives, before BA1515 departs
        // Leg 2: LHR - After BA1515 arrives, before BA277 departs
        // Leg 3: HYD - After BA277 arrives

        if (allFlights.length >= 3) {
          const now = new Date();
          const flight1Arr = new Date(allFlights[0].arrival.time).getTime();
          const flight2Arr = new Date(allFlights[1].arrival.time).getTime();
          const flight3Arr = new Date(allFlights[2].arrival.time).getTime();

          if (now.getTime() > flight3Arr) {
            setCurrentLeg(3);
          } else if (now.getTime() > flight2Arr) {
            setCurrentLeg(2);
          } else if (now.getTime() > flight1Arr) {
            setCurrentLeg(1);
          } else {
            setCurrentLeg(0);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoading(false);
      }
    };
    loadJourney();
  }, []);

  const handleSearch = async (term: string, date?: string) => {
    setIsLoading(true);
    setHasSearched(true);
    try {
      const query = new URLSearchParams({ flightNumber: term });
      if (date) query.set('date', date);

      const res = await fetch(`/api/flights?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setFlights(data);
      } else {
        setFlights([]);
      }
    } catch (error) {
      console.error('Failed to fetch flights', error);
      setFlights([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className={styles.main}>
      <div className={styles.backgroundGlow} />

      <h1 className={styles.title}>
        <span>Welcome Home Akka ❤️ - KC</span>
      </h1>


      <JourneyMap currentLeg={currentLeg} />

      <SearchInput onSearch={handleSearch} isLoading={isLoading} />

      <div className={styles.results}>
        {flights.map((flight) => (
          <FlightCard key={flight.flightNumber + flight.departure.time} flight={flight} />
        ))}

        {hasSearched && (
          <button
            onClick={() => window.location.reload()}
            className={styles.resetButton}
          >
            ← Back to Full Journey
          </button>
        )}

        {hasSearched && !isLoading && flights.length === 0 && (
          <div className={styles.emptyState}>
            <p>No flights found for search. Please check the flight number and departure date.</p>
          </div>
        )}
      </div>

      <Countdown />

      <div className={styles.conceptImage}>
        <MagnifierImage
          src="/background.jpg"
          alt="Vardhu Returns India Concept"
        />
      </div>

      <div className={styles.messageSection}>
        <p>So proud of you, Akka! ❤️</p>
        <p>Have a safe journey. We are all waiting for you back in India!</p>
      </div>

      <footer className={styles.footer}>
        <p>Project by <span className={styles.credit}>KC-Codes</span></p>
      </footer>
    </main>
  );
}
