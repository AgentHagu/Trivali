import React, { useState, useEffect } from 'react'
import Container from 'react-bootstrap/Container'
import { Button, Stack } from 'react-bootstrap'
import TemperatureCard from './TemperatureCard/TempCard'
import AddLocation from '../context/AddLocation'
import axios from 'axios'
import { useApiKeys } from '../context/ApiKeysContext'

/**
 * Weather Component
 * 
 * Displays weather information for a list of locations. Allows users to add and delete locations and updates weather data at regular intervals.
 * 
 * @param {Object} props - The component props.
 * @param {string} props.projectId - The ID of the project (not used in this component).
 * @param {Object} props.data - Additional data related to the project (not used in this component).
 * @param {Object} props.socket - The socket instance (not used in this component).
 * 
 * @returns {JSX.Element} The rendered component.
 */
export default function Weather({ projectId, data, socket }) {
    const [showModal, setShowModal] = useState(false);
    const [locations, setLocations] = useState([]);
    const { openWeatherApiKey } = useApiKeys()

    useEffect(() => {
        // Load locations from localStorage
        const savedLocations = JSON.parse(localStorage.getItem('locations')) || [];
        setLocations(savedLocations);
    }, []);

    useEffect(() => {
        // Set up interval to fetch weather updates every 60 seconds
        const interval = setInterval(() => {
            updateWeather();
        }, 6000);

        // Clear interval on component unmount
        return () => clearInterval(interval);
    }, [locations]);

    const handleShowModal = () => setShowModal(true);
    const handleCloseModal = () => setShowModal(false);

    /**
     * Adds a new location and fetches weather data for it.
     * 
     * @param {string} location - The location to add.
     * @returns {Promise<void>}
     */
    const addLocation = async (location) => {
        try {
            const apiKey = openWeatherApiKey;
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

    /**
     * Deletes a location from the list.
     * 
     * @param {number} index - The index of the location to delete.
     * @returns {void}
     */
    const deleteLocation = (index) => {
        const newLocations = locations.filter((_, i) => i !== index);
        setLocations(newLocations);
        localStorage.setItem('locations', JSON.stringify(newLocations));
    };

    /**
     * Updates weather data for all locations.
     * 
     * @returns {Promise<void>}
     */
    const updateWeather = async () => {
        try {
            const apiKey = openWeatherApiKey;
            const updatedLocations = await Promise.all(locations.map(async (loc) => {
                const url = `https://api.openweathermap.org/data/2.5/weather?q=${loc.location}&appid=${apiKey}&units=metric`;
                const response = await axios.get(url);
                return { location: loc.location, data: response.data };
            }));
            setLocations(updatedLocations);
            localStorage.setItem('locations', JSON.stringify(updatedLocations));
        } catch (error) {
            console.error('Error updating weather data:', error);
        }
    };

    return (
        <Container className="mt-2 mb-3">
            <Stack direction="horizontal" gap="2" className="mb-2">
                <h1 className="me-auto">Weather</h1>
                <Button variant="primary fs-5" className="ms-auto" onClick={handleShowModal}>
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