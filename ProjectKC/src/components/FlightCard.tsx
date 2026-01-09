import styles from './FlightCard.module.css';
import { Flight } from '../types/flight';

interface FlightCardProps {
    flight: Flight;
}

export default function FlightCard({ flight }: FlightCardProps) {
    const formatTime = (isoString: string) => {
        try {
            // Assume isoString is "YYYY-MM-DDTHH:mm:SS" and represents Local Time at Airport.
            // We just want to extract "HH:mm".
            const timePart = isoString.split('T')[1];
            if (!timePart) return isoString;
            const [hours, minutes] = timePart.split(':');
            const date = new Date();
            date.setHours(parseInt(hours), parseInt(minutes));
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) {
            return isoString;
        }
    };

    const formatDate = (isoString: string) => {
        try {
            // Extract YYYY-MM-DD and format it
            // Using "new Date(isoString)" might convert to local timezone if the string doesn't have offset.
            // If the string is straight "2026-01-10T14:59:00", new Date() treats it as local browser time.
            // We want to treat it as "2026-01-10".
            const datePart = isoString.split('T')[0];
            const [year, month, day] = datePart.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return date.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
            });
        } catch (e) {
            return isoString;
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.airlineInfo}>
                    <div className={styles.airline}>{flight.airline}</div>
                    <div className={styles.flightNumber}>{flight.flightNumber}</div>
                </div>
                <div className={styles.status} data-status={flight.status}>
                    {flight.status}
                </div>
            </div>

            <div className={styles.route}>
                <div className={styles.location}>
                    <div className={styles.code}>{flight.departure.airportCode}</div>
                    <div className={styles.city}>{flight.departure.location}</div>
                    <div className={styles.time} suppressHydrationWarning>
                        {formatTime(flight.departure.time, flight.departure.timezone)}
                    </div>
                    {flight.departure.terminal && (
                        <div className={styles.terminal}>Term {flight.departure.terminal}{flight.departure.gate ? `, Gate ${flight.departure.gate}` : ''}</div>
                    )}
                    <div className={styles.date} suppressHydrationWarning>
                        {formatDate(flight.departure.time, flight.departure.timezone)}
                    </div>
                </div>

                <div className={styles.path}>
                    <div className={styles.duration}>{flight.duration}</div>
                    <div className={styles.visualPath}>
                        <div className={styles.planeIcon}>✈</div>
                    </div>
                </div>

                <div className={`${styles.location} ${styles.arrival}`}>
                    <div className={styles.code}>{flight.arrival.airportCode}</div>
                    <div className={styles.city}>{flight.arrival.location}</div>
                    <div className={styles.time} suppressHydrationWarning>
                        {formatTime(flight.arrival.time, flight.arrival.timezone)}
                    </div>
                    {flight.arrival.terminal && (
                        <div className={styles.terminal}>Term {flight.arrival.terminal}</div>
                    )}
                    <div className={styles.date} suppressHydrationWarning>
                        {formatDate(flight.arrival.time, flight.arrival.timezone)}
                    </div>
                </div>
            </div>
        </div>
    );
}
