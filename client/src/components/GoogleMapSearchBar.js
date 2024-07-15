import React, { useState, useRef, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { useLoadScriptContext } from '../context/LoadScriptProvider';

const AutocompleteSearch = ({ onPlaceSelected }) => {
    const [autocomplete, setAutocomplete] = useState(null);
    const inputRef = useRef(null);
    const { isLoaded } = useLoadScriptContext();

    const onLoad = (autocompleteInstance) => {
        setAutocomplete(autocompleteInstance);
    };

    const onPlaceChanged = () => {
        if (autocomplete !== null) {
            const place = autocomplete.getPlace();
            onPlaceSelected(place);
        } else {
            console.log('Autocomplete is not loaded yet!');
        }
    };

    if (!isLoaded) {
        return null;
    }

    return (
        <Autocomplete onLoad={onLoad} onPlaceChanged={onPlaceChanged}>
            <input
                type="text"
                placeholder="Search for a place"
                ref={inputRef}
                className="border-0 h-100 p-2"
                style={{
                    width: '300px',
                }}
            />
        </Autocomplete>
    );
};

export default AutocompleteSearch;
