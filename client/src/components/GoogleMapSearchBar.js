import { useState, useRef, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { useLoadScriptContext } from '../context/LoadScriptProvider';

export default function GoogleMapSearchBar({ onPlaceSelected, locationValue }) {
    const autocompleteRef = useRef(null);
    const inputRef = useRef(null);
    const { isLoaded } = useLoadScriptContext();
    const [inputValue, setInputValue] = useState(locationValue || '');

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = locationValue || '';
        }

        setInputValue(locationValue || '');
    }, [locationValue]);

    const handlePlaceChanged = () => {
        const place = autocompleteRef.current.getPlace();
        if (place && place.name) {
            setInputValue(place.name);
            if (inputRef.current) {
                inputRef.current.value = place.name;
            }
            onPlaceSelected(place);
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value
        setInputValue(value)

        if (inputRef.current) {
            inputRef.current.value = value;
        }

        onPlaceSelected({ name: value });
    };

    if (!isLoaded) {
        return null;
    }

    return <div className="h-100 w-100">
        <Autocomplete
            onLoad={(autocomplete) => {
                autocompleteRef.current = autocomplete
                autocomplete.setFields(['name', 'geometry.location'])
            }}
            onPlaceChanged={handlePlaceChanged}>
            <input
                type="text"
                placeholder="Search for a place"
                ref={inputRef}
                value={inputValue}
                onChange={handleInputChange}
                className="border-0 h-100 p-2"
                style={{
                    width: '300px',
                }}
            />
        </Autocomplete>
    </div>;
};