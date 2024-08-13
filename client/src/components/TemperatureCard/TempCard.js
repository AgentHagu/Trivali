import React from 'react'
import { Card, Button } from 'react-bootstrap'
//import './TempCard.css'

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
