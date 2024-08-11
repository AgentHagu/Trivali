import { DirectionsRenderer, GoogleMap, Marker } from '@react-google-maps/api';
import { useLoadScriptContext } from '../context/LoadScriptProvider';
import { useEffect, useRef, useState } from 'react';
import { OverlayTrigger, Tooltip } from 'react-bootstrap';

const containerStyle = {
    width: '100%',
    height: '500px'
};

/**
 * Map component that displays a Google Map with markers and routes based on the provided itinerary data.
 *
 * This component fetches itinerary data from a socket connection and displays markers and routes on a Google Map.
 * It allows users to toggle the visibility of routes and select different travel modes (DRIVING, TRANSIT, WALKING).
 *
 * @param {Object} props - The component props.
 * @param {string} props.projectId - The ID of the project to fetch the itinerary for.
 * @param {Object} props.data - The initial data for the itinerary.
 * @param {Object} props.socket - The socket connection used to fetch and receive itinerary data.
 * @returns {React.ReactElement} The rendered `Map` component.
 */
export default function Map({ projectId, data, socket }) {
    const { isLoaded } = useLoadScriptContext();
    const [rows, setRows] = useState(data.itinerary.rows)
    const [selected, setSelected] = useState(Array(rows.length).fill(null));
    const [routes, setRoutes] = useState([])
    const [showRoutes, setShowRoutes] = useState(false)
    const [travelMode, setTravelMode] = useState("TRANSIT")
    const mapRef = useRef(null);

    const drivingPolylineOptions = {
        strokeColor: '#ffa000',
        strokeOpacity: 1,
        strokeWeight: 10,
    }

    const transitPolylineOptions = {
        strokeColor: '#55dd33',
        strokeOpacity: 1,
        strokeWeight: 10,

    };

    const walkingPolylineOptions = {
        strokeColor: '#00FF00',
        strokeOpacity: 0,
        strokeWeight: 0,
        icons: [
            {
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    fillColor: '#0f53ff',
                    fillOpacity: 1,
                    scale: 4,
                    strokeWeight: 1,
                    strokeColor: '#0f53ff'
                },
                offset: '100%',
                repeat: '12px'
            }
        ]
    }

    // Tooltip for no routes found
    const tooltip = (
        <Tooltip id="tooltip" className="text-info">
            <strong>No routes found!</strong> Possible disconnections in itinerary
        </Tooltip>
    );

    // Dynamically load itinerary to display on Map tab
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

    // Dynamically update locations on Map tab from itinerary changes
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

    // Automatically set bounds and center for map given markers and routes
    useEffect(() => {
        if (!isLoaded || !mapRef.current) return;

        const bounds = new window.google.maps.LatLngBounds();

        // Include selected pins
        selected.forEach(rowIndex => {
            if (rowIndex === null) return;

            rows[rowIndex].activities.forEach(activity => {
                const location = activity.location.geometry?.location;
                if (location) {
                    bounds.extend(new window.google.maps.LatLng(location.lat, location.lng));
                }
            });
        });

        // Include start and end points of each route
        routes.forEach(route => {
            route.routes[0].legs.forEach(leg => {
                bounds.extend(leg.start_location);
                bounds.extend(leg.end_location);
                // Optionally extend bounds for intermediate steps if needed
                leg.steps.forEach(step => {
                    bounds.extend(step.start_location);
                    bounds.extend(step.end_location);
                });
            });
        });

        if (!bounds.isEmpty()) {
            mapRef.current.fitBounds(bounds, { padding: 50 });

            const listener = window.google.maps.event.addListenerOnce(mapRef.current, 'bounds_changed', () => {
                const currentZoom = mapRef.current.getZoom();
                if (currentZoom > 15) {
                    mapRef.current.setZoom(15);
                }
                window.google.maps.event.removeListener(listener);
            });
        } else {
            mapRef.current.setCenter({ lat: 0, lng: 0 });
            mapRef.current.setZoom(1);
        }
    }, [isLoaded, rows, selected, routes]);


    // Request for routes from Google Maps API
    useEffect(() => {
        const directionService = new window.google.maps.DirectionsService()

        async function calculateRoutes() {
            const newRoutes = [];

            const routePromises = selected.map(async rowIndex => {
                if (rowIndex === null) return;

                const row = rows[rowIndex];
                const rowRoutes = [];

                const activityPromises = row.activities.map(async (activity, i) => {
                    if (i >= row.activities.length - 1) return;

                    const location1 = activity.location.geometry?.location;
                    const location2 = row.activities[i + 1].location.geometry?.location;

                    if (location1 && location2) {
                        const request = {
                            origin: { lat: location1.lat, lng: location1.lng },
                            destination: { lat: location2.lat, lng: location2.lng },
                            travelMode: travelMode
                        };

                        try {
                            const result = await new Promise((resolve, reject) => {
                                directionService.route(request, (result, status) => {
                                    if (status === window.google.maps.DirectionsStatus.OK) {
                                        resolve(result);
                                    } else {
                                        reject(`Error fetching directions ${status}`);
                                    }
                                });
                            });
                            rowRoutes.push(result);
                        } catch (error) {
                            console.error("Error fetching directions: ", error);
                        }
                    }
                });

                await Promise.all(activityPromises);
                newRoutes.push(...rowRoutes);
            });

            await Promise.all(routePromises);

            setRoutes(newRoutes);
        }

        calculateRoutes();
    }, [rows, selected, travelMode])

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

    function viewRoutesHandler() {
        setShowRoutes(!showRoutes);
    }

    function travelModeHandler(event) {
        const element = event.target
        setTravelMode(element.getAttribute("id"))
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
            <div className="col-3 ps-0  d-flex align-items-center">
                <div className="form-check form-switch d-flex align-items-center ps-1">
                    <h5 className="mb-0" style={{ userSelect: "none" }}>
                        View routes
                    </h5>
                    <h5 className="mb-0 ps-2 pe-3">
                        <input className="form-check-input ms-2" type="checkbox" role="switch" onChange={viewRoutesHandler} />
                    </h5>
                    {showRoutes && routes.length === 0
                        ? <OverlayTrigger placement="top" overlay={tooltip}>
                            <h5 className="mb-0" style={{ backgroundColor: "white" }}>
                                <i
                                    className="bi bi-info-circle-fill text-warning p-1"
                                />
                            </h5>
                        </OverlayTrigger>
                        : null
                    }

                </div>
            </div>

            {/* TODO: its off center/aligned */}
            <div className="col">
                <div className=" d-flex align-items-center">
                    <h5 className="mb-0 pe-3" style={{ userSelect: "none" }}>
                        Travel modes:
                    </h5>

                    <input type="radio" className="btn-check" name="travelMode" id="DRIVING" autoComplete="off" onClick={travelModeHandler} />
                    <label className="btn btn-outline-primary me-2" htmlFor="DRIVING" title="Driving"><i className="bi bi-car-front-fill" /></label>

                    <input type="radio" className="btn-check" name="travelMode" id="TRANSIT" autoComplete="off" onClick={travelModeHandler} defaultChecked />
                    <label className="btn btn-outline-primary me-2" htmlFor="TRANSIT" title="Transit"><i className="bi bi-train-front-fill" /></label>

                    <input type="radio" className="btn-check" name="travelMode" id="WALKING" autoComplete="off" onClick={travelModeHandler} />
                    <label className="btn btn-outline-primary me-2" htmlFor="WALKING" title="Walking"><i className="bi bi-person-walking" /></label>

                    {
                        travelMode === "TRANSIT" &&
                        <h6 className="mb-0 ps-3 text-secondary" style={{ userSelect: "none" }}>
                            Note: Transit data is inconsistent
                        </h6>
                    }
                </div>
            </div>
        </div>

        <div className="row px-3">
            <div className="col-9 p-0 border border-2 border-black h-100">
                <GoogleMap
                    mapContainerStyle={containerStyle}
                    onLoad={map => (mapRef.current = map)}
                >
                    {
                        showRoutes
                            ? routes.map((route, index) => {
                                return <DirectionsRenderer
                                    key={index}
                                    directions={route}
                                    options={{
                                        preserveViewport: true,
                                        polylineOptions: travelMode === 'DRIVING' ? drivingPolylineOptions :
                                            travelMode === 'WALKING' ? walkingPolylineOptions :
                                                transitPolylineOptions
                                    }}
                                />
                            })
                            : null
                    }


                    {
                        selected.map(rowIndex => {
                            if (rowIndex === null) {
                                return null
                            }

                            return rows[rowIndex].activities.map((activity, index) => {
                                const location = activity.location.geometry?.location
                                if (location) {
                                    return (
                                        <Marker
                                            // icon={customMarker}
                                            key={`marker-${rowIndex}-${index}`}
                                            position={{ lat: location.lat, lng: location.lng }}
                                        />
                                    )
                                }

                                return null
                            })
                        })
                    }

                </GoogleMap>
            </div>

            <div className="col pe-0 overflow-auto" style={{ height: '500px' }}>
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
                                    className="col-1 text-center"
                                >
                                    Click to toggle Day {dayIndex + 1} markers
                                </th>
                            </tr>
                        </thead>

                        <tbody className='border-2'>
                            {row.activities.map((activity, index) => (
                                <tr
                                    className={`${(activity.location.name)
                                        ? activity.location.geometry
                                            ? ""
                                            : "table-warning"
                                        : "table-danger"} border border-dark`}
                                    key={activity.id}
                                    day={dayIndex}
                                >
                                    <td className="fit text-center align-middle">
                                        {/* TODO: Time start? Or range? */}
                                        {activity.time.start}
                                    </td>

                                    <td style={{ maxWidth: "180px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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