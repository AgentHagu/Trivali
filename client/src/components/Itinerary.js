import React, { useState } from "react";
import { createRoot } from 'react-dom/client';
import TextEditor from "./TextEditor"

import { Menu, Item, Separator, Submenu, useContextMenu } from 'react-contexify';
import 'react-contexify/ReactContexify.css';

function Table() {
    const MENU_ID = 'Itinerary Menu';
    //TODO: Fix the ids, they need to be unique
    //TODO: Adjust DEFAULT_ACTIVITY and DEFAULT_DAY
    const DEFAULT_ACTIVITY = { id: Date.now(), time: '0700-1200', details: <TextEditor page="test" number="0" /> }
    const DEFAULT_DAY = { id: Date.now(), activities: [{ id: 5, time: '0600-0800', details: <TextEditor page="test" number="0" /> }] }
    const [rows, setRows] = useState([
        {
            id: 1, activities: [
                { id: 1, time: '0800-1000', details: <TextEditor page="itinerary" number="1.1" /> },
                { id: 2, time: '1200-1300', details: <TextEditor page="itinerary" number="1.2" /> }
            ]
        },
        {
            id: 2, activities: [
                { id: 3, time: '1000-1200', details: <TextEditor page="itinerary" number="2.1" /> },
                { id: 4, time: '1400-1600', details: <TextEditor page="itinerary" number="2.2" /> }
            ]
        },
    ])

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
    function handleItemClick({ id, event, props }) {
        // The referenced table data or header
        let element = props.element
        const currRowIndex = element.closest('tr').rowIndex - 1
        const currDayIndex = element.closest('tr').getAttribute('day')

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
                    DEFAULT_ACTIVITY,
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
                    handleItemClick({ id: "delDay", event, props });
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
                    DEFAULT_DAY,
                    ...rows.slice(currDayIndex + 1)
                ]

                setRows(newRows)
                break;
            }

            // Delete current activity row
            // TODO: Warn the user when deleting a day ("All activities for this day will be lost")
            // TODO: Prevent user from deleting day when only 1 day left
            case "delDay": {
                console.log("DELETING DAY")
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

    }

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
                {/* Create the  */}
                {rows.map((row, dayIndex) => (
                    row.activities.map((activity, index) => (
                        <tr key={activity.id} day={dayIndex}>
                            {/* Only render the Day for the first activity, have it span the other activities */}
                            {index === 0 && (<th scope="row" rowSpan={row.activities.length}>{dayIndex + 1}</th>)}
                            <td>{activity.time}</td>

                            {/* TODO: change how the number is assigned. Currently, because it follows the row
                             index, it doesnt follow an intuitive design. i.e. deleting row 2 will not replace
                             it with row 3's text editor, it just remains with row 2's content*/}
                            <td className="p-0">{activity.details}</td>
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


export default function Itinerary() {
    return <Table />
}