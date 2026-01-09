import { NextResponse } from 'next/server';
import { Flight } from '@/types/flight';

const API_KEY = '271a8e1f1ec1216ec3c8df94548ef647';
const BASE_URL = 'http://api.aviationstack.com/v1/flights';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const flightNumber = searchParams.get('flightNumber');
        const date = searchParams.get('date');

        console.log(`[API] Searching for: ${flightNumber}, Date: ${date}`);

        if (!flightNumber) {
            return NextResponse.json([]);
        }

        const flightNumberClean = flightNumber.toUpperCase().replace(/\s+/g, '').trim();

        // database/ticket fallback data
        const ticketData: Record<string, Flight[]> = {
            'BA1849': [{
                flightNumber: 'BA1849',
                airline: 'British Airways',
                status: 'On Time',
                departure: { location: 'Cincinnati (CVG)', airportCode: 'CVG', time: '2026-01-10T14:59:00', timezone: 'America/New_York', terminal: '3', gate: 'B18' },
                arrival: { location: 'New York (JFK)', airportCode: 'JFK', time: '2026-01-10T17:03:00', timezone: 'America/New_York', terminal: '8' },
                duration: '2h 4m'
            }],
            'BA1515': [{
                flightNumber: 'BA1515',
                airline: 'British Airways',
                status: 'On Time',
                departure: { location: 'New York (JFK)', airportCode: 'JFK', time: '2026-01-10T21:50:00', timezone: 'America/New_York', terminal: '8', gate: '8' },
                arrival: { location: 'London (LHR)', airportCode: 'LHR', time: '2026-01-11T09:40:00', timezone: 'Europe/London', terminal: '5' },
                duration: '6h 50m'
            }],
            'BA277': [{
                flightNumber: 'BA277',
                airline: 'British Airways',
                status: 'On Time',
                departure: { location: 'London (LHR)', airportCode: 'LHR', time: '2026-01-11T14:25:00', timezone: 'Europe/London', terminal: '5' },
                arrival: { location: 'Hyderabad (HYD)', airportCode: 'HYD', time: '2026-01-12T05:20:00', timezone: 'Asia/Kolkata' },
                duration: '9h 25m'
            }]
        };

        let realFlightData: Flight[] = [];

        // 1. Try fetching real data from API
        try {
            let apiUrl = `${BASE_URL}?access_key=${API_KEY}&flight_iata=${flightNumberClean}`;

            // Pass date to API if provided. AviationStack uses 'flight_date' (YYYY-MM-DD)
            if (date) {
                apiUrl += `&flight_date=${date}`;
            }

            const response = await fetch(apiUrl);
            const data = await response.json();

            if (data.error) {
                console.warn('AviationStack Error:', data.error);
            }

            if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                let filteredData = data.data;

                // Secondary safety check: ensure the returned data matches the requested date
                if (date) {
                    filteredData = filteredData.filter((f: any) => f.flight_date === date);
                }

                if (filteredData.length > 0) {
                    realFlightData = filteredData.map((item: any) => {
                        const departureTime = item.departure.scheduled;
                        const arrivalTime = item.arrival.scheduled;
                        let duration = 'N/A';
                        if (departureTime && arrivalTime) {
                            const start = new Date(departureTime).getTime();
                            const end = new Date(arrivalTime).getTime();
                            const diffMs = end - start;
                            if (diffMs > 0) {
                                const hours = Math.floor(diffMs / (1000 * 60 * 60));
                                const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                                duration = `${hours}h ${minutes}m`;
                            }
                        }
                        return {
                            flightNumber: item.flight.iata || item.flight.number || flightNumberClean,
                            airline: item.airline.name || 'Unknown Airline',
                            status: mapStatus(item.flight_status),
                            departure: {
                                location: item.departure.airport || item.departure.iata,
                                airportCode: item.departure.iata || 'N/A',
                                time: item.departure.scheduled,
                                timezone: item.departure.timezone || 'UTC',
                                terminal: item.departure.terminal || undefined,
                                gate: item.departure.gate || undefined,
                            },
                            arrival: {
                                location: item.arrival.airport || item.arrival.iata,
                                airportCode: item.arrival.iata || 'N/A',
                                time: item.arrival.scheduled,
                                timezone: item.arrival.timezone || 'UTC',
                                terminal: item.arrival.terminal || undefined,
                                gate: item.arrival.gate || undefined,
                            },
                            duration: duration,
                        };
                    });
                }
            }
        } catch (error) {
            console.error('Real API fetch failed:', error);
        }

        // 2. Fallback logic:
        // If real API returned data, use it.
        // If not, and it's one of our special journey flights, use the ticket data.
        if (realFlightData.length > 0) {
            console.log(`[API] Returning ${realFlightData.length} flights from Real API`);
            return NextResponse.json(realFlightData);
        }

        // fallback to ticket data if flight number matches
        if (flightNumberClean in ticketData) {
            let flights = ticketData[flightNumberClean];

            // If a date was provided, only return the mock if it matches the date
            if (date) {
                flights = flights.filter(f => f.departure.time.startsWith(date));
            }

            console.log(`[API] Returning ${flights.length} flights from Mock Ticket Data`);
            return NextResponse.json(flights);
        }

        console.log(`[API] No flights found for ${flightNumberClean}`);
        return NextResponse.json([]);
    } catch (e) {
        console.error('Search API Route Error:', e);
        return NextResponse.json([], { status: 500 });
    }
}

function mapStatus(apiStatus: string): Flight['status'] {
    // API statuses: scheduled, active, landed, cancelled, incident, diverted
    switch (apiStatus) {
        case 'scheduled': return 'On Time';
        case 'active': return 'On Time'; // 'In Air' not in our types, mapping to On Time or we should update types
        case 'landed': return 'Arrived';
        case 'cancelled': return 'Cancelled';
        case 'incident': return 'Delayed';
        case 'diverted': return 'Delayed';
        default: return 'On Time';
    }
}
