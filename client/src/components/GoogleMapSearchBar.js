import { useState, useRef, useEffect } from 'react';
import { Autocomplete } from '@react-google-maps/api';
import { useLoadScriptContext } from '../context/LoadScriptProvider';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';

export default function GoogleMapSearchBar({ onPlaceSelected, locationValue }) {
    const autocompleteRef = useRef(null);
    const inputRef = useRef(null);
    const { isLoaded } = useLoadScriptContext();
    const [inputValue, setInputValue] = useState(locationValue.name || '');
    const [isValid, setIsValid] = useState(true)

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.value = locationValue.name || '';
        }

        if (!locationValue.geometry && locationValue.name !== "") {
            setIsValid(false)
        }

        setInputValue(locationValue.name || '');
    }, [locationValue]);

    const handlePlaceChanged = () => {
        const place = autocompleteRef.current.getPlace();
        if (place && place.name) {
            setIsValid(true)
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
        setIsValid(false)
        if (value === "") {
            setIsValid(true)
        }

        if (inputRef.current) {
            inputRef.current.value = value;
        }

        onPlaceSelected({ name: value });
    };

    if (!isLoaded) {
        return null;
    }

    const tooltip = (
        <Tooltip id="tooltip" className="text-info">
            <strong>Unrecognized location!</strong> Use autocomplete suggestions
        </Tooltip>
    );


    return (
        <Autocomplete
            onLoad={(autocomplete) => {
                autocompleteRef.current = autocomplete
                autocomplete.setFields(['name', 'geometry.location'])
            }}
            onPlaceChanged={handlePlaceChanged}
            className='h-100'
        >
            <div className="position-relative h-100">
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

                {isValid
                    ? null
                    : <OverlayTrigger placement="top" overlay={tooltip}>
                        <i
                            className="bi bi-info-circle-fill position-absolute text-warning p-1"
                            style={{ top: '50%', right: '10px', transform: 'translateY(-50%)', backgroundColor: "white" }}
                        />
                    </OverlayTrigger>}
            </div>
        </Autocomplete>
    )
};