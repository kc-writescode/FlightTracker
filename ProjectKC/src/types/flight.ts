export interface Flight {
    flightNumber: string;
    airline: string;
    status: 'On Time' | 'Delayed' | 'Cancelled' | 'Arrived';
    departure: {
        location: string;
        airportCode: string;
        time: string; // ISO string
        timezone: string;
        terminal?: string;
        gate?: string;
    };
    arrival: {
        location: string;
        airportCode: string;
        time: string; // ISO string
        timezone: string;
        terminal?: string;
        gate?: string;
    };
    duration: string;
}
