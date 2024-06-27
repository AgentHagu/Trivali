import React, { useCallback, useEffect, useState } from "react";

// Components
import TextEditor from "./TextEditor";

// Context Menu
import { Menu, Item, Separator, Submenu, useContextMenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';

// Toast Notifications
import { toast } from "react-toastify";

function Table({ projectId, data, socket }) {
    const MENU_ID = 'Itinerary Menu';
    const [rows, setRows] = useState(data)

    useEffect(() => {
        if (socket == null) return

        socket.once("load-itinerary", itinerary => {
            setRows(itinerary.rows)
        })

        socket.emit("get-itinerary", projectId)
    }, [socket, projectId])

    const createActivity = useCallback(() => {
        const id = Date.now()
        return { id: id, time: { start: "00:00", end: "00:00" }, details: { page: "itinerary", number: id } }
    }, [])

    const createDay = useCallback(() => {
        return { id: Date.now(), activities: [createActivity()] }
    }, [createActivity])

    function deleteActivity(activity) {
        socket.emit("delete-itinerary-activity", activity.details.page + "/" + activity.details.number)
    }

    function deleteDay(day) {
        day.activities.forEach(activity => {
            deleteActivity(activity)
        });
    }

    const { show } = useContextMenu({
        id: MENU_ID,
    });

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

    // Menu Click Logic
    // TODO: Add "above" and "below" options for Add Day and Activity
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
    }, [rows, createActivity, createDay])

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

    return <>
        <table className="table table-bordered m-0 table-fit">
            <thead className="table-dark">
                <tr>
                    <th scope="col" className="col-1">Day</th>
                    <th scope="col" className="col">Time</th>
                    <th scope="col" className="col">Activity</th>
                </tr>
            </thead>
            <tbody onContextMenu={handleContextMenu}>
                {/* Create the itinerary table */}
                {rows.map((row, dayIndex) => (
                    row.activities.map((activity, index) => (
                        <tr key={activity.id} day={dayIndex}>
                            {/* Only render the Day for the first activity, have it span the other activities */}
                            {index === 0 && (<th className="text-center align-middle fs-5" scope="row" rowSpan={row.activities.length}>{dayIndex + 1}</th>)}

                            <td className="fit align-middle">
                                <input className="border" type="time" id="start" value={activity.time.start} onChange={timeHandler} /> - <input className="border" type="time" id="end" value={activity.time.end} onChange={timeHandler} />
                            </td>

                            <td className="p-0">
                                <TextEditor page={activity.details.page} number={activity.details.number} />
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

export default function Itinerary({ projectId, data, socket }) {
    return <Table projectId={projectId} data={data.rows} socket={socket} />
}