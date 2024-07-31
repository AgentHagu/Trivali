import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import { Button, Stack } from 'react-bootstrap';
import TemperatureCard from './TemperatureCard/TempCard';
import AddLocation from '../context/AddLocation';
import axios from 'axios';

export default function Weather({ projectId, data, socket }) {
    const [showModal, setShowModal] = useState(false);
    const [locations, setLocations] = useState([]);

    useEffect(() => {
        // Load locations from localStorage
        const savedLocations = JSON.parse(localStorage.getItem('locations')) || [];
        setLocations(savedLocations);
    }, []);

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    const addLocation = async (location) => {
        try {
            const apiKey = '0e4dfa47c1617d033bf2bce752b7b729';
            const url = `https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`;
            const response = await axios.get(url);
            const data = response.data;
            const newLocations = [...locations, { location, data }];
            setLocations(newLocations);
            localStorage.setItem('locations', JSON.stringify(newLocations));
        } catch (error) {
            console.error('Error fetching weather data:', error);
        }
    };

    const deleteLocation = (index) => {
        const newLocations = locations.filter((_, i) => i !== index);
        setLocations(newLocations);
        localStorage.setItem('locations', JSON.stringify(newLocations));
    };

    return (
        <Container className="my-4">
            <Stack direction="horizontal" gap="2" className="mb-4">
                <h1 className="me-auto">Weather</h1>
                <Button variant="primary" className="ms-auto" onClick={handleShowModal}>
                    Add Location
                </Button>
            </Stack>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: '1rem',
                    alignItems: 'flex-start',
                }}
            >
                {locations.map((loc, index) => (
                    <TemperatureCard
                        key={index}
                        data={loc.data}
                        onDelete={() => deleteLocation(index)}
                    />
                ))}
            </div>
            <AddLocation show={showModal} handleClose={handleCloseModal} addLocation={addLocation} />
        </Container>
    );
}
