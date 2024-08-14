import React from 'react'
import { Card, Button } from 'react-bootstrap'
//import './TempCard.css'

/**
 * TemperatureCard Component
 * 
 * Displays weather information for a specific location, including temperature, weather description, and additional weather details.
 * 
 * @param {Object} props - The component props.
 * @param {Object} props.data - The weather data for the location.
 * @param {Function} props.onDelete - The callback function to handle the deletion of the location.
 * 
 * @returns {JSX.Element} The rendered component.
 */
export default function TemperatureCard({ data, onDelete }) {
    return (
        <Card className="">
            <Card.Body>
                <Card.Title>
                    <div className="top">
                        <div className="location">{data.name}</div>
                        <div className="temperature">
                            <h1>{data.main.temp}°C</h1>
                        </div>
                        <div className="description">
                            <p>{data.weather[0].description}</p>
                        </div>
                    </div>
                    <div className="bottom">
                        <div className="feels">Feels like: {data.main.feels_like}°C</div>
                        <div className="humidity">Humidity: {data.main.humidity}%</div>
                        <div className="wind">Wind speed: {data.wind.speed} m/s</div>
                    </div>
                    <Button variant="danger" onClick={onDelete} className="mt-3">
                        Delete
                    </Button>
                </Card.Title>
            </Card.Body>
        </Card>
    );
}
