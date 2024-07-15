import React, { useState, useRef, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { useLoadScriptContext } from '../context/LoadScriptProvider';

export default function GoogleMapSearchBar({ onPlaceSelected, locationValue }) {
    const autocompleteRef = useRef(null);
    const { isLoaded } = useLoadScriptContext();

    useEffect(() => {
        if (autocompleteRef.current) {
            autocompleteRef.current.value = locationValue || '';
        }
    }, [locationValue]);

    const handlePlaceChanged = () => {
        const place = autocompleteRef.current.getPlace();
        onPlaceSelected(place);
    };

    if (!isLoaded) {
        return null;
    }

    return <div className="h-100 w-100">
        <Autocomplete
            onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)}
            onPlaceChanged={handlePlaceChanged}>
            <input
                type="text"
                placeholder="Search for a place"
                ref={autocompleteRef}
                className="border-0 h-100 p-2"
                style={{
                    width: '300px',
                }}
            />
        </Autocomplete>
    </div>;
};