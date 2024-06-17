import React, { useCallback, useEffect, useState } from "react";
import { createRoot } from 'react-dom/client';
import TextEditor from "./TextEditor"
import { Menu, Item, Separator, Submenu, useContextMenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';
import { io } from "socket.io-client";
const { stringify } = require('flatted');

function Table({ data, socket }) {
    const MENU_ID = 'Itinerary Menu';
    //TODO: Fix the ids, they need to be unique
    //TODO: Adjust DEFAULT_ACTIVITY and DEFAULT_DAY
    const [rows, setRows] = useState(data)

    // TODO: Possible issue, entries might cause integer overflow if enough new activities/days are spammed
    const [entries, setEntries] = useState(rows.reduce((total, curr) => total + curr.activities.length, 0));

    const createActivity = useCallback(() => {
        setEntries(prev => prev + 1)
        return { id: Date.now(), time: '0700-1200', details: { page: "itinerary", number: entries } }
    }, [entries])

    const createDay = useCallback(() => {
        return { id: Date.now(), activities: [createActivity()] }
    }, [createActivity])

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
        switch (id) {
            // Add an activity row to the current day
            case "addActivity": {
                const day = rows[currDayIndex]
                const activities = day.activities;

                // Relative row index to the Day rather than to the Table
                let relativeRowIndex = currRowIndex;
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

                const newRows = [
                    ...rows.slice(0, currDayIndex),
                    newDay,
                    ...rows.slice(currDayIndex + 1)
                ]

                setRows(newRows)
                break;
            }

            // Delete current activity row
            // TODO: Warn the user when deleting the last activity row of a day (i.e. only one activity left)
            case "delActivity": {
                const day = rows[currDayIndex]
                const activities = day.activities;

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
                // TODO: Add warning/confirmation here for deleting last day
                if (newActivities.length === 0) {
                    itineraryUpdate({ id: "delDay", currRowIndex, currDayIndex });
                    break;
                }

                const newDay = day
                newDay.activities = newActivities

                const newRows = [
                    ...rows.slice(0, currDayIndex),
                    newDay,
                    ...rows.slice(currDayIndex + 1)
                ]

                setRows(newRows)
                break;
            }

            // Add a Day table row to the itinerary
            case "addDay": {
                const newRows = [
                    ...rows.slice(0, currDayIndex + 1),
                    createDay(),
                    ...rows.slice(currDayIndex + 1)
                ]

                setRows(newRows)
                break;
            }

            // Delete current activity row
            // TODO: Warn the user when deleting a day ("All activities for this day will be lost")
            // TODO: Prevent user from deleting day when only 1 day left
            case "delDay": {
                const newRows = [
                    ...rows.slice(0, currDayIndex),
                    ...rows.slice(currDayIndex + 1)
                ]

                setRows(newRows)
                break;
            }

            default:
                break
        }
    }, [rows, createActivity, createDay])

    function handleItemClick({ id, event, props }) {
        //if (props == null) return
        // The referenced table data or header
        const element = props.element
        const currRowIndex = element.closest('tr').rowIndex - 1
        const currDayIndex = parseInt(element.closest('tr').getAttribute('day'), 10)

        socket.emit("send-itinerary-changes", { id, currRowIndex, currDayIndex })
        itineraryUpdate({ id, currRowIndex, currDayIndex })
    }

    useEffect(() => {
        if (socket == null) return

        socket.on("receive-itinerary-changes", itineraryUpdate)

        return () => {
            socket.off("receive-itinerary-changes", itineraryUpdate)
        }
    }, [socket, itineraryUpdate])

    return <>
        <table className="table table-bordered m-0">
            <thead className="table-dark">
                <tr>
                    <th scope="col" className="col-1">Day</th>
                    <th scope="col" className="col-2">Time</th>
                    <th scope="col">Activity</th>
                </tr>
            </thead>
            <tbody onContextMenu={handleContextMenu}>
                {/* Create the itinerary table */}
                {rows.map((row, dayIndex) => (
                    row.activities.map((activity, index) => (
                        <tr key={activity.id} day={dayIndex}>
                            {/* Only render the Day for the first activity, have it span the other activities */}
                            {index === 0 && (<th scope="row" rowSpan={row.activities.length}>{dayIndex + 1}</th>)}
                            <td>{activity.time}</td>

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

export default function Itinerary({ data, socket }) {
    return <Table data={data.rows} socket={socket} />
}