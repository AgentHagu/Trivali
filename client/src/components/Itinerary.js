import React, { useCallback, useEffect, useState } from "react";
// index.js or App.js
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';


// Components
import TextEditor from "./TextEditor";
import GoogleMapSearchBar from "../components/GoogleMapSearchBar"

// Context Menu
import { Menu, Item, Separator, useContextMenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';

// Toast Notifications
import { toast } from "react-toastify";
import MarkdownPreview from '@uiw/react-markdown-preview';
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const SERVER_URL = process.env.REACT_APP_API_URL;

function supportsFirefox() {
    return window.navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
}

/**
 * Table component to display and manage itinerary data.
 * 
 * @param {object} props - Component props.
 * @param {string} props.projectId - ID of the project.
 * @param {object} props.data - Initial data for the table.
 * @param {object} props.socket - Socket.io instance for real-time updates.
 * @returns {JSX.Element} Table component displaying itinerary data.
 */
function Table({ projectId, data, socket, user }) {
    const MENU_ID = 'Itinerary Menu';
    const [rows, setRows] = useState(data)

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
        setRows(data);
    }, [data]);

    /**
     * Creates a new activity object.
     * 
     * @returns {object} New activity object with default values.
     */
    const createActivity = useCallback(() => {
        const id = Date.now()
        return { id: id, time: { start: "00:00", end: "00:00" }, location: { name: "" }, details: { page: "itinerary", number: id } }
    }, [])

    /**
     * Creates a new day object with an initial activity.
     * 
     * @returns {object} New day object with an empty activities array.
     */
    const createDay = useCallback(() => {
        return { id: Date.now(), activities: [createActivity()] }
    }, [createActivity])

    /**
     * Deletes an activity from the itinerary.
     * 
     * @param {object} activity - Activity object to delete.
     */
    const deleteActivity = useCallback(activity => {
        if (activity) {
            socket.emit("delete-itinerary-activity", activity.details.page + "/" + activity.details.number)
        }
    }, [socket])

    /**
     * Deletes a day from the itinerary.
     * 
     * @param {object} day - Day object to delete.
     */
    const deleteDay = useCallback(day => {
        day.activities.forEach(activity => {
            deleteActivity(activity)
        });
    }, [deleteActivity])

    const { show } = useContextMenu({
        id: MENU_ID,
    });

    /**
     * Handles the context menu event to display options based on clicked element.
     * 
     * @param {object} event - Context menu event object.
     */
    function handleContextMenu(event) {
        // Gets the element that was right-clicked
        let element = event.target;

        // Changes to the closest appropriate parent element
        // Here, we change to the closest table data / header element
        element = element.closest('td, th');

        show({
            event,
            props: {
                element: element
            }
        })
    }

    /**
     * Updates the itinerary based on the menu item clicked.
     * 
     * @param {object} param0 - Update parameters (id, currRowIndex, currDayIndex).
     * @returns {array} Updated rows array reflecting the itinerary changes.
     */
    const itineraryUpdate = useCallback(({ id, currRowIndex, currDayIndex }) => {
        let newRows;

        switch (id) {
            // Add an activity row to the current day
            case "addActivity": {
                const day = rows[currDayIndex]
                const activities = day.activities;

                // Relative row index to the Day rather than to the Table
                let relativeRowIndex = currRowIndex
                for (let i = 0; i < currDayIndex; i++) {
                    relativeRowIndex -= rows[i].activities.length
                }

                const newActivities = [
                    ...activities.slice(0, relativeRowIndex + 1),
                    createActivity(),
                    ...activities.slice(relativeRowIndex + 1)
                ]

                const newDay = day
                newDay.activities = newActivities

                newRows = [
                    ...rows.slice(0, currDayIndex),
                    newDay,
                    ...rows.slice(currDayIndex + 1)
                ]

                break
            }

            // Delete current activity row
            // TODO: Warn the user when deleting the last activity row of a day (i.e. only one activity left)
            case "delActivity": {
                const day = rows[currDayIndex]
                const activities = day.activities

                // Relative row index to the Day rather than to the Table
                let relativeRowIndex = currRowIndex;
                for (let i = 0; i < currDayIndex; i++) {
                    relativeRowIndex -= rows[i].activities.length
                }

                const newActivities = [
                    ...activities.slice(0, relativeRowIndex),
                    ...activities.slice(relativeRowIndex + 1)
                ]
                // If deleting the last activity, its the same as deleting the day
                if (newActivities.length === 0) {
                    return itineraryUpdate({ id: "delDay", currRowIndex, currDayIndex });
                }

                const newDay = day
                newDay.activities = newActivities

                newRows = [
                    ...rows.slice(0, currDayIndex),
                    newDay,
                    ...rows.slice(currDayIndex + 1)
                ]

                const deletedActivity = activities[relativeRowIndex]
                //TODO: pass in the deletedActivity and have the function settle the page and number part
                deleteActivity(deletedActivity)

                break
            }

            // Add a Day table row to the itinerary
            case "addDay": {
                newRows = [
                    ...rows.slice(0, currDayIndex + 1),
                    createDay(),
                    ...rows.slice(currDayIndex + 1)
                ]

                break
            }

            // Delete current activity row
            // TODO: Warn the user when deleting a day ("All activities for this day will be lost")
            case "delDay": {
                newRows = [
                    ...rows.slice(0, currDayIndex),
                    ...rows.slice(currDayIndex + 1)
                ]

                // TODO: Make warning prettier with snackbar
                if (newRows.length === 0) {
                    toast.error("Must have at least 1 day!", {
                        position: "top-center",
                        autoClose: 3000
                    })
                    newRows = rows
                }

                deleteDay(rows[currDayIndex])

                break
            }

            default:
                break
        }

        return newRows
    }, [rows, createActivity, deleteActivity, createDay, deleteDay])

    /**
     * Handles menu item click event.
     * 
     * @param {object} param0 - Click event parameters (id, event, props).
     */
    function handleItemClick({ id, event, props }) {
        //if (props == null) return

        // The referenced table data or header
        const element = props.element
        const currRowIndex = element.closest('tr').rowIndex - 1
        const currDayIndex = parseInt(element.closest('tr').getAttribute('day'), 10)

        const newRows = itineraryUpdate({ id, currRowIndex, currDayIndex })
        socket.emit("send-itinerary-changes", newRows)
        setRows(prevRows => {
            socket.emit("save-itinerary", newRows)
            return newRows
        })
    }

    /**
     * Handles time change event for activity start/end times.
     * 
     * @param {object} event - Time change event object.
     */
    function timeHandler(event) {
        // The referenced table data or header
        const element = event.target
        const currRowIndex = element.closest('tr').rowIndex - 1
        const currDayIndex = parseInt(element.closest('tr').getAttribute('day'), 10)

        let relativeRowIndex = currRowIndex
        for (let i = 0; i < currDayIndex; i++) {
            relativeRowIndex -= rows[i].activities.length
        }

        const timeId = event.target.id
        const newTime = event.target.value

        socket.emit("send-time-changes", { id: timeId, newTime: newTime, day: currDayIndex, activity: relativeRowIndex })

        const newRows = [...rows]
        newRows[currDayIndex].activities[relativeRowIndex].time[timeId] = newTime

        setRows(prevRows => {
            socket.emit("save-itinerary", newRows)
            return newRows
        })
    }

    const locationHandler = (place, dayIndex, activityIndex) => {
        const newRows = [...rows];
        newRows[dayIndex].activities[activityIndex].location = place;

        setRows(newRows);
        socket.emit('send-location-changes', {
            place: place,
            day: dayIndex,
            activity: activityIndex
        });

        socket.emit('save-itinerary', newRows);
    };

    useEffect(() => {
        if (socket == null) return

        const handler = newRows => {
            setRows(newRows)
        }

        socket.on("receive-itinerary-changes", handler)

        return () => {
            socket.off("receive-itinerary-changes", handler)
        }
    }, [socket, itineraryUpdate])

    useEffect(() => {
        if (socket == null) return

        const handler = timeChange => {
            const newRows = [...rows]
            newRows[timeChange.day].activities[timeChange.activity].time[timeChange.id] = timeChange.newTime
            setRows(newRows)
        }

        socket.on("receive-time-changes", handler)

        return () => {
            socket.off("receive-time-changes", handler)
        }
    }, [socket, rows])

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

    return <>
        <table className="table table-bordered m-0 table-fit">
            <thead className="table-dark">
                <tr className="fs-5">
                    <th scope="col" className="col-1">Day</th>
                    <th scope="col" className="col">Time</th>
                    <th scope="col" className="col">Location</th>
                    <th scope="col" className="col">Activity</th>
                </tr>
            </thead>
            <tbody onContextMenu={handleContextMenu}>
                {/* Create the itinerary table */}
                {rows.map((row, dayIndex) => (
                    row.activities.map((activity, index) => (
                        <tr key={activity.id} day={dayIndex} style={{ height: "1px" }}>
                            {/* Only render the Day for the first activity, have it span the other activities */}
                            {index === 0 && (<th className="text-center align-middle fs-5" scope="row" rowSpan={row.activities.length}>{dayIndex + 1}</th>)}

                            <td className="fit align-middle px-2" style={supportsFirefox() ? { height: "100%" } : { height: "inherit" }}>
                                <input
                                    className="border"
                                    type="time"
                                    id="start"
                                    value={activity.time.start}
                                    onChange={timeHandler} />
                                &nbsp; - &nbsp;
                                <input
                                    className="border"
                                    type="time"
                                    id="end"
                                    value={activity.time.end}
                                    onChange={timeHandler} />
                            </td>

                            <td className="col-2 align-middle p-0" style={supportsFirefox() ? { height: "100%" } : { height: "inherit" }}>
                                <GoogleMapSearchBar
                                    onPlaceSelected={(place) => locationHandler(place, dayIndex, index)}
                                    locationValue={activity.location}
                                />
                            </td>

                            <td className="p-0" style={{ maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                <TextEditor page={activity.details.page} number={activity.details.number} projectId={projectId} user={user} />
                            </td>
                        </tr>)
                    )))}
            </tbody>
        </table>

        {/* Context Menu */}
        <Menu id={MENU_ID}>
            <Item id="addActivity" onClick={handleItemClick}>Add Activity</Item>
            <Item id="delActivity" onClick={handleItemClick}>Delete Activity</Item>
            <Separator />
            <Item id="addDay" onClick={handleItemClick}>Add Day</Item>
            <Item id="delDay" onClick={handleItemClick}>Delete Day</Item>
        </Menu>
    </>
}

export default function Itinerary({ projectId, data, socket, user }) {
    const [itineraryData, setItineraryData] = useState(data)
    const [generateItineraryStatus, setGenerateItineraryStatus] = useState(null)
    const [generateItineraryResponse, setGenerateItineraryResponse] = useState()
    const [replaceItineraryStatus, setReplaceItineraryStatus] = useState(null)
    const [showCopiedTooltip, setShowCopiedTooltip] = useState(false)

    /**
     * Handles the form submission for generating an itinerary.
     * 
     * Sends a POST request to the server with the user's prompt to generate an itinerary.
     * Updates the status and response state based on the server's response.
     * 
     * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
     * @returns {Promise<void>} - A promise that resolves when the function completes.
     */
    async function generateItineraryHandler(event) {
        event.preventDefault()
        const prompt = event.target[0].value

        setGenerateItineraryStatus("LOADING")

        try {
            const response = await fetch(`${SERVER_URL}/openAi-generate-itinerary`, {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ prompt: prompt })
            })

            const data = await response.json()
            setGenerateItineraryStatus("DONE")
            setGenerateItineraryResponse(data.itinerary)
        } catch (error) {
            console.log("Error fetching itinerary: ", error)
        }
    }

    /**
     * Handles the form submission for replacing the current itinerary.
     * 
     * Prompts the user for confirmation before sending a POST request to replace
     * the current itinerary with the newly generated one. Updates the status and
     * sends the new itinerary data to the server.
     * 
     * @param {React.FormEvent<HTMLFormElement>} event - The form submission event.
     * @returns {Promise<void>} - A promise that resolves when the function completes.
     */
    async function replaceItineraryHandler(event) {
        event.preventDefault()

        if (window.confirm("WARNING: Replacing itinerary will replace ALL existing itinerary data! Are you really sure?")) {
            setReplaceItineraryStatus("LOADING")

            try {
                const response = await fetch(`${SERVER_URL}/openAi-generate-itinerary-json`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ prompt: generateItineraryResponse })
                })

                const data = await response.json()
                const newItinerary = JSON.parse(data.itinerary)
                setReplaceItineraryStatus(null)

                if (newItinerary !== null && newItinerary.rows !== null) {
                    setItineraryData(newItinerary)
                    socket.emit("save-itinerary", newItinerary.rows)
                }

            } catch (error) {
                console.log("Error fetching itinerary: ", error)
            }
        }
    }

    /**
     * Copies the generated itinerary response to the clipboard.
     * 
     * Displays a tooltip indicating success if the copy operation is successful.
     * 
     * @returns {Promise<void>} - A promise that resolves when the function completes.
     */
    async function copyToClipboard() {
        try {
            await navigator.clipboard.writeText(generateItineraryResponse)
            setShowCopiedTooltip(true)
            setTimeout(() => setShowCopiedTooltip(false), 1000)
        } catch (err) {
            console.log(err)
            setShowCopiedTooltip(false)
        }

    }

    /**
     * Renders a tooltip indicating that the text has been copied.
     * 
     * @param {Object} props - The props for the tooltip.
     * @returns {React.ReactElement} - The rendered tooltip component.
     */
    const renderTooltip = (props) => (
        <Tooltip id="button-tooltip" {...props}>
            Copied!
        </Tooltip>
    )

    return <>
        <button
            className="btn position-fixed bottom-0 end-0 mb-5 me-5 d-flex align-items-center justify-content-center"
            style={{
                width: "60px",
                height: "60px",
                borderRadius: "15px",
                backgroundColor: "#10a37f",
                zIndex: 1000
            }}
            data-bs-toggle="modal"
            data-bs-target="#openAI"
            title="Create project"
        >
            <svg
                width="40px"
                height="40px"
                viewBox="0 0 24 24"
                role="img"
                xmlns="http://www.w3.org/2000/svg"
                fill="white"
            >
                <title>OpenAI Helper</title>
                <path d="M22.2819 9.8211a5.9847 5.9847 0 0 0-.5157-4.9108 6.0462 6.0462 0 0 0-6.5098-2.9A6.0651 
                6.0651 0 0 0 4.9807 4.1818a5.9847 5.9847 0 0 0-3.9977 2.9 6.0462 6.0462 0 0 0 .7427 7.0966 5.98 
                5.98 0 0 0 .511 4.9107 6.051 6.051 0 0 0 6.5146 2.9001A5.9847 5.9847 0 0 0 13.2599 24a6.0557 
                6.0557 0 0 0 5.7718-4.2058 5.9894 5.9894 0 0 0 3.9977-2.9001 6.0557 6.0557 0 0 0-.7475-7.0729zm-9.022 
                12.6081a4.4755 4.4755 0 0 1-2.8764-1.0408l.1419-.0804 4.7783-2.7582a.7948.7948 0 0 0 .3927-.6813v-6.7369l2.02 
                1.1686a.071.071 0 0 1 .038.052v5.5826a4.504 4.504 0 0 1-4.4945 4.4944zm-9.6607-4.1254a4.4708 
                4.4708 0 0 1-.5346-3.0137l.142.0852 4.783 2.7582a.7712.7712 0 0 0 .7806 0l5.8428-3.3685v2.3324a.0804.0804 
                0 0 1-.0332.0615L9.74 19.9502a4.4992 4.4992 0 0 1-6.1408-1.6464zM2.3408 7.8956a4.485 4.485 0 0 1 
                2.3655-1.9728V11.6a.7664.7664 0 0 0 .3879.6765l5.8144 3.3543-2.0201 1.1685a.0757.0757 0 0 1-.071 
                0l-4.8303-2.7865A4.504 4.504 0 0 1 2.3408 7.872zm16.5963 3.8558L13.1038 8.364 15.1192 7.2a.0757.0757 
                0 0 1 .071 0l4.8303 2.7913a4.4944 4.4944 0 0 1-.6765 8.1042v-5.6772a.79.79 0 0 
                0-.407-.667zm2.0107-3.0231l-.142-.0852-4.7735-2.7818a.7759.7759 0 0 0-.7854 0L9.409 9.2297V6.8974a.0662.0662 
                0 0 1 .0284-.0615l4.8303-2.7866a4.4992 4.4992 0 0 1 6.6802 4.66zM8.3065 12.863l-2.02-1.1638a.0804.0804 
                0 0 1-.038-.0567V6.0742a4.4992 4.4992 0 0 1 7.3757-3.4537l-.142.0805L8.704 5.459a.7948.7948 0 0 
                0-.3927.6813zm1.0976-2.3654l2.602-1.4998 2.6069 1.4998v2.9994l-2.5974 1.4997-2.6067-1.4997Z" />
            </svg>
        </button>

        {
            !replaceItineraryStatus
                ? <Table projectId={projectId} data={itineraryData.rows} socket={socket} user={user} />
                : <div className="py-5 text-center border-top border-black border-2">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                </div>
        }

        <div className="modal fade" id="openAI" data-bs-keyboard="false" tabIndex="-1" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">OpenAI Help</h5>

                        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <div className="modal-body">
                        Struggling to create an itinerary? Ask OpenAI for some help!
                        <hr />
                        <form onSubmit={generateItineraryHandler}>
                            <div className="mb-3">
                                <label htmlFor="itineraryRequirements" className="form-label">Itinerary Requirements</label>
                                <textarea className="form-control" id="itineraryRequirements" rows="3" placeholder="Describe your desired itinerary" />
                            </div>
                            <div className="d-flex justify-content-end">
                                <button type="submit" className="btn btn-primary">Generate Itinerary</button>
                            </div>
                        </form>

                        <hr />
                        OpenAI response: <br />
                        {
                            generateItineraryStatus === null
                                ? "No prompt given yet"
                                : generateItineraryStatus === "LOADING"
                                    ? <div className="text-center">
                                        <div className="spinner-border" role="status">
                                            <span className="visually-hidden">Loading...</span>
                                        </div>
                                    </div>
                                    : <>
                                        <MarkdownPreview
                                            source={generateItineraryResponse}
                                            className="p-2 my-2 text-dark bg-light border border-secondary rounded"
                                            style={{
                                                maxHeight: '350px',
                                                overflowY: 'auto'
                                            }}
                                        />

                                        {
                                            generateItineraryResponse.includes("Invalid or improper prompt for itinerary creation:")
                                                ? null
                                                : <>
                                                    <div className="d-flex justify-content-end">
                                                        <OverlayTrigger
                                                            placement="top"
                                                            show={showCopiedTooltip}
                                                            overlay={renderTooltip}
                                                        >
                                                            <button
                                                                onClick={copyToClipboard}
                                                                className="btn btn-secondary border border-secondary"
                                                                title="Copy to clipboard"
                                                            >
                                                                <i className="bi bi-copy" />
                                                            </button>
                                                        </OverlayTrigger>
                                                        <button
                                                            onClick={replaceItineraryHandler}
                                                            className="btn btn-primary ms-1"
                                                            data-bs-dismiss="modal"
                                                        >
                                                            Replace Itinerary
                                                        </button>
                                                    </div>
                                                </>
                                        }
                                    </>
                        }
                    </div>

                    {/* <div className="modal-footer">
                        RESPONSE
                    </div> */}
                </div>
            </div>
        </div>
    </>
}