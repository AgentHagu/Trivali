import { GoogleMap, Marker } from '@react-google-maps/api';
import { useLoadScriptContext } from '../context/LoadScriptProvider';

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

    const rows = data.itinerary.rows;

    if (!isLoaded) {
        return <div>Loading Maps...</div>;
    }

    return <div className="container py-3 px-3">
        <div className="row mb-3">
            <div className="col">
                <button>View Routes</button>
            </div>
        </div>

        <div className="row px-3">
            <div className="col-9 p-0 border border-2 border-black h-100">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={13}
                >
                    {/* <Marker position={center} />
                    <Marker position={{ lat: -3, lng: -38 }} /> */}
                </GoogleMap>
            </div>

            <div className="col" style={{ height: '500px', overflowY: 'auto' }}>
                {rows.map((row, index) => (
                    <table className="table table-bordered table-fit" key={row.id}>
                        <thead className="table-dark">
                            <tr>
                                <th scope="col" colSpan={2} className="col-1">Day {index + 1}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {row.activities.map((activity, dayIndex) => (
                                <tr key={activity.id} day={dayIndex}>
                                    <td className="fit align-middle">
                                        {/* TODO: Time start? Or range? */}
                                        {activity.time.start}
                                    </td>

                                    <td>
                                        Location
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