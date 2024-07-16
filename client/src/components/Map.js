import { GoogleMap, Marker } from '@react-google-maps/api';
import { useLoadScriptContext } from '../context/LoadScriptProvider';
import { useEffect, useState } from 'react';

const containerStyle = {
    width: '100%',
    height: '500px'
};

const center = {
    lat: 1.29485,
    lng: 103.77367
};

export default function Map({ projectId, data, socket }) {
    const { isLoaded } = useLoadScriptContext();
    const [rows, setRows] = useState(data.itinerary.rows)

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

    if (!isLoaded) {
        return <div>Loading Maps...</div>;
    }

    return <div className="container py-3 px-3">
        <div className="row mb-3 px-3">
            <div className="col-2 p-0">
                <div className="form-check form-switch">
                    View Routes
                    <input className="form-check-input" type="checkbox" role="switch" />
                </div>
            </div>

            <div className="col">
                Filters:
            </div>
        </div>

        <div className="row px-3">
            <div className="col-9 p-0 border border-2 border-black h-100">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={13}
                >
                    {rows.map((row, dayIndex) => (
                        row.activities.map((activity, index) => {
                            if (activity.location.geometry) {
                                const location = activity.location.geometry.location
                                return <Marker key={`marker-${dayIndex}-${index}`} position={{ lat: location.lat, lng: location.lng }} />;
                            } else {
                                return null;
                            }
                        })
                    ))}
                </GoogleMap>
            </div>

            <div className="col overflow-auto" style={{ height: '500px' }}>
                {rows.map((row, dayIndex) => (
                    <table className="table table-bordered table-fit" key={row.id}>
                        <thead className="table-dark">
                            <tr>
                                <th scope="col" colSpan={2} className="col-1">Day {dayIndex + 1}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {row.activities.map((activity, index) => (
                                <tr key={activity.id} day={dayIndex}>
                                    <td className="fit align-middle">
                                        {/* TODO: Time start? Or range? */}
                                        {activity.time.start}
                                    </td>

                                    <td>
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