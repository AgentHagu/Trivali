import { GoogleMap, Marker } from '@react-google-maps/api';
import { useLoadScriptContext } from '../context/LoadScriptProvider';
import { useEffect, useRef, useState } from 'react';

const containerStyle = {
    width: '100%',
    height: '500px'
};

export default function Map({ projectId, data, socket }) {
    const { isLoaded } = useLoadScriptContext();
    const [rows, setRows] = useState(data.itinerary.rows)
    const [selected, setSelected] = useState(Array(rows.length).fill(null));
    const mapRef = useRef(null);

    useEffect(() => {
        if (socket == null) return;

        const loadItinerary = itinerary => {
            setRows(itinerary.rows);
        };

        socket.on('load-itinerary', loadItinerary);

        socket.emit('get-itinerary', projectId);

        return () => {
            socket.off('load-itinerary', loadItinerary);
        };
    }, [socket, projectId]);

    useEffect(() => {
        const handler = (placeChange) => {
            const newRows = [...rows];
            newRows[placeChange.day].activities[placeChange.activity].location = placeChange.place;
            setRows(newRows);
        };

        socket.on('receive-location-changes', handler);

        return () => {
            socket.off('receive-location-changes', handler);
        };
    }, [socket, rows]);

    useEffect(() => {
        if (!isLoaded || !mapRef.current) return;

        const bounds = new window.google.maps.LatLngBounds();

        selected.forEach(rowIndex => {
            if (rowIndex === null) {
                return;
            }

            rows[rowIndex].activities.forEach(activity => {
                const location = activity.location.geometry?.location;
                if (location) {
                    bounds.extend(new window.google.maps.LatLng(location.lat, location.lng));
                }
            });
        });

        if (!bounds.isEmpty()) {
            mapRef.current.fitBounds(bounds, { padding: 50 });

            // Adjust zoom if it's too close
            const listener = window.google.maps.event.addListenerOnce(mapRef.current, 'bounds_changed', () => {
                const currentZoom = mapRef.current.getZoom();
                if (currentZoom > 15) {
                    mapRef.current.setZoom(15);
                }
                window.google.maps.event.removeListener(listener);
            })
        } else {
            // No location markers selected, show the whole world
            mapRef.current.setCenter({ lat: 0, lng: 0 });
            mapRef.current.setZoom(1);
        }

    }, [isLoaded, rows, selected]);

    if (!isLoaded) {
        return <div>Loading Maps...</div>;
    }

    function viewHandler(event) {
        const dayIndex = parseInt(event.target.closest("table").getAttribute("day"))

        if (selected[dayIndex] !== null) {
            const updatedSelected = [...selected]
            updatedSelected[dayIndex] = null
            setSelected(updatedSelected)
        } else {
            const updatedSelected = [...selected]
            updatedSelected[dayIndex] = dayIndex
            setSelected(updatedSelected)
        }
    }

    // TODO: Add custom markers with custom symbols and stuff
    const customMarker = {
        // path: window.google.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        // fillColor: "#FF0000",
        // fillOpacity: 1,
        // scale: 7,
        // strokeWeight: 2,
        // strokeColor: "#FFFFFF",
    };

    return <div className="container py-3 px-3">
        <div className="row mb-2 px-3">
            <div className="col-2 ps-0  d-flex align-items-center">
                <div className="form-check form-switch d-flex align-items-center ps-1">
                    <h5 className="mb-0" style={{ userSelect: "none" }}>
                        View routes
                    </h5>
                    <h5 className="mb-0 ps-2">
                        <input className="form-check-input ms-2" type="checkbox" role="switch" />
                    </h5>
                </div>
            </div>

            {/* TODO: its off center/aligned */}
            <div className="col">
                <div className=" d-flex align-items-center">
                    <h5 className="mb-0 pe-3">
                        Travel modes:
                    </h5>

                    <input type="checkbox" className="btn-check" id="travel-mode-driving" autoComplete="off" />
                    <label className="btn btn-outline-primary me-2" htmlFor="travel-mode-driving"><i className="bi bi-car-front-fill" /></label>
                    
                    <input type="checkbox" className="btn-check" id="travel-mode-transit" autoComplete="off" />
                    <label className="btn btn-outline-primary me-2" htmlFor="travel-mode-transit"><i className="bi bi-train-front-fill" /></label>

                    <input type="checkbox" className="btn-check" id="travel-mode-walking" autoComplete="off" />
                    <label className="btn btn-outline-primary me-2" htmlFor="travel-mode-walking"><i className="bi bi-person-walking" /></label>
                </div>
            </div>
        </div>

        <div className="row px-3">
            <div className="col-9 p-0 border border-2 border-black h-100">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    onLoad={map => (mapRef.current = map)}
                >
                    {selected.map(rowIndex => {
                        if (rowIndex === null) {
                            return null
                        }

                        return rows[rowIndex].activities.map((activity, index) => {
                            const location = activity.location.geometry?.location
                            if (location) {
                                return (
                                    <Marker
                                        icon={customMarker}
                                        key={`marker-${rowIndex}-${index}`}
                                        position={{ lat: location.lat, lng: location.lng }}
                                    />
                                )
                            }

                            return null
                        })
                    })}
                </GoogleMap>
            </div>

            <div className="col overflow-auto" style={{ height: '500px' }}>
                {rows.map((row, dayIndex) => (
                    <table
                        className={`table table-bordered table-fit
                            ${selected.includes(dayIndex)
                                ? 'border-success'
                                : 'border-secondary'}`}
                        style={{ cursor: "pointer", userSelect: "none" }}
                        key={row.id}
                        day={dayIndex}
                        onClick={viewHandler}
                    >
                        <thead
                            className={`border-2 ${selected.includes(dayIndex)
                                ? 'table-success border-success'
                                : 'table-secondary border-secondary'}`}
                        >
                            <tr>
                                <th
                                    scope="col"
                                    colSpan={2}
                                    className="col-1"
                                >
                                    Click to toggle Day {dayIndex + 1} markers
                                </th>
                            </tr>
                        </thead>

                        <tbody className='border-2'>
                            {row.activities.map((activity, index) => (
                                <tr key={activity.id} day={dayIndex}>
                                    <td className="fit text-center align-middle">
                                        {/* TODO: Time start? Or range? */}
                                        {activity.time.start}
                                    </td>

                                    <td style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                        {(activity.location.name) ? activity.location.name : "No location specified"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ))}
            </div>
        </div>
    </div>
}