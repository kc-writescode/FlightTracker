import styles from './JourneyMap.module.css';

interface JourneyMapProps {
    currentLeg?: number;
}

export default function JourneyMap({ currentLeg = 0 }: JourneyMapProps) {
    const stops = [
        { city: 'Cincinnati', code: 'CVG', label: 'Start', date: 'Jan 10' },
        { city: 'New York', code: 'JFK', label: 'Transit', date: 'Jan 10' },
        { city: 'London', code: 'LHR', label: 'Transit', date: 'Jan 11' },
        { city: 'Hyderabad', code: 'HYD', label: 'Home', date: 'Jan 12' },
    ];

    return (
        <div className={styles.container}>
            <h2 className={styles.title}>Vardhu's Homecoming Journey</h2>
            <div className={styles.mapVisual}>
                <div className={styles.line}></div>
                {stops.map((stop, index) => (
                    <div key={stop.code} className={styles.stop} style={{ left: `${(index / (stops.length - 1)) * 100}%` }}>
                        <div className={`${styles.dot} ${index === currentLeg ? styles.active : ''} ${index < currentLeg ? styles.completed : ''}`}>
                            {index < stops.length - 1 && <div className={styles.planeIcon}>✈</div>}
                        </div>
                        <div className={styles.label}>
                            <span className={styles.city}>{stop.city}</span>
                            <span className={styles.code}>{stop.code}</span>
                            {stop.date && <span className={styles.stopDate}>{stop.date}</span>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
