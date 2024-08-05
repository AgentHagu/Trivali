// React and Hooks
import { useCallback, useEffect, useState } from "react";

// Components
import HeaderNavbar from "../components/HeaderNavbar";
import SearchBar from "../components/SearchBar";

// Custom Hooks
import useUserData from "../hooks/useUserData";

// External Libraries
import { v4 as uuidV4 } from "uuid";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const SERVER_URL = process.env.REACT_APP_API_URL;

/**
 * HomePage component to display the home page content.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 */
export default function HomePage() {
    const { user, loading } = useUserData()
    const [addedUsersList, setAddedUsersList] = useState([])
    const [content, setContent] = useState(
        <div className="container mt-3 d-flex justify-content-center align-items-center vh-100">
            <div className="text-center">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    )
    const navigate = useNavigate()
    const [socket, setSocket] = useState()

    // Establish socket connection with server
    useEffect(() => {
        const s = io(`${SERVER_URL}`)
        setSocket(s)

        return () => {
            s.disconnect()
        }
    }, [])

    // Handle form submission to create a new project
    const submitHandler = useCallback((e) => {
        e.preventDefault()
        const projectName = e.target[0].value
        const projectId = uuidV4()

        if (socket) {
            socket.emit("create-project", {
                projectId: projectId,
                projectName: projectName,
                userId: user._id,
                userList: addedUsersList
            })

            socket.once("new-project-created", () => {
                navigate(`/projects/${projectId}`)
            })
        }
    }, [addedUsersList, navigate, socket, user])

    useEffect(() => {
        if (!loading) {
            setAddedUsersList([user])
        }
    }, [loading, user])

    const tooltip = (
        <Tooltip id="tooltip" className="text-info">
            <strong>Create Project</strong>
        </Tooltip>
    )

    function formatDate(date) {
        const currentDate = new Date()
        const inputDate = new Date(date)

        // Check if the date is within the same day as now
        if (
            currentDate.getFullYear() === inputDate.getFullYear() &&
            currentDate.getMonth() === inputDate.getMonth() &&
            currentDate.getDate() === inputDate.getDate()
        ) {
            // Return the time in the format "HH:MM AM/PM"
            return inputDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: 'numeric',
                hour12: true
            })
        }

        // Otherwise, return the formatted date
        const options = { day: 'numeric', month: 'short', year: 'numeric' }
        return inputDate.toLocaleDateString('en-US', options)
    }

    useEffect(() => {
        if (!loading) {
            const loadedContent = <>
                <OverlayTrigger placement="top" overlay={tooltip}>
                    <button
                        className="btn btn-primary position-fixed bottom-0 end-0 mb-5 me-5 d-flex align-items-center justify-content-center"
                        style={{
                            width: "60px",
                            height: "60px",
                            borderRadius: "15px",
                            zIndex: 1000
                        }}
                        data-bs-toggle="modal"
                        data-bs-target="#createProjectModal"
                        title="Create project"
                    >
                        <i className="bi bi-plus"
                            style={{ fontSize: "4rem", lineHeight: "1" }}
                        />
                    </button>
                </OverlayTrigger>
                <ul className="list-group fs-5">
                    <div className="list-group-item bg-transparent border-0 pb-0">
                        <div className="row fs-4">
                            <div className="col-6">
                                Project Name
                            </div>

                            <div className="col">
                                Owned by
                            </div>

                            <div className="col">
                                Last updated
                            </div>

                            <div className="col">
                                Date created
                            </div>

                            <div className="col-auto">
                                {/* Add a button here */}
                                <button
                                    className="btn"
                                    style={{ visibility: "hidden" }}
                                >
                                    <i className="bi bi-three-dots-vertical"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {
                        user.projectList.length > 0
                            ? user.projectList.map(simpleProject => (
                                <a
                                    href={`../projects/${simpleProject._id}`}
                                    className="list-group-item list-group-item-action mt-2 border border-2 rounded"
                                    key={simpleProject._id}
                                >
                                    <div className="row align-items-center">
                                        <div className="col-6 text-truncate">
                                            {simpleProject.name || "Untitled Project"}
                                            {simpleProject.isShared && <i className="bi bi-people-fill ms-3" title="Shared Project"></i>}
                                        </div>

                                        <div className="col">
                                            {simpleProject.owner === user.username
                                                ? "me"
                                                : simpleProject.owner}
                                        </div>

                                        <div className="col">
                                            {formatDate(simpleProject.lastUpdated)}
                                        </div>

                                        <div className="col">
                                            {simpleProject.dateCreated}
                                        </div>

                                        <div className="col-auto">
                                            <div className="dropdown">
                                                <button
                                                    className="btn rounded-circle"
                                                    type="button"
                                                    id="moreOptionsButton"
                                                    data-bs-toggle="dropdown"
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        e.stopPropagation()
                                                        // Add your button click handler logic here
                                                    }}
                                                >
                                                    <i className="bi bi-three-dots-vertical"></i>
                                                </button>

                                                <div className="dropdown-menu">
                                                    {/* <button
                                                        className="dropdown-item"
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#renameProjectModal"
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            e.stopPropagation()
                                                            // Add your button click handler logic here
                                                        }}
                                                    >
                                                        Rename
                                                    </button> */}

                                                    <button
                                                        className="dropdown-item"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            window.open(`../projects/${simpleProject._id}`, '_blank', 'noreferrer');
                                                        }}
                                                    >
                                                        Open in new tab
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            ))
                            : <h3>You currently have no projects.</h3>
                    }
                </ul>

                {/* Rename Project Modal Form */}
                {/* <div className="modal fade" id="renameProjectModal" data-bs-keyboard="false" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Rename Project</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                            </div>

                            <div className="modal-body">
                                <form id="createProjectForm">
                                    <div className="mb-3">
                                        <label htmlFor="projectName" className="form-label">Project Name</label>
                                        <input type="text" className="form-control" id="projectName" placeholder="Enter a name for your project" value={"test"} onBlur={changeNameHandler} />
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div> */}

                {/* Create Project Modal Form */}
                <div className="modal fade" id="createProjectModal" data-bs-keyboard="false" tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Create a new Project</h5>
                                <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                            </div>

                            <div className="modal-body">
                                <form id="createProjectForm" onSubmit={submitHandler}>
                                    <div className="mb-3">
                                        <label htmlFor="projectName" className="form-label">Project Name</label>
                                        <input type="text" className="form-control" id="projectName" placeholder="Enter a name for your project" />
                                    </div>
                                </form>

                                <SearchBar socket={socket} currUser={user} addedUsersList={addedUsersList} setAddedUsersList={setAddedUsersList} />
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" form="createProjectForm" className="btn btn-primary" data-bs-dismiss="modal">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            </>
            setContent(loadedContent)
        }
    }, [loading, user, socket, submitHandler, addedUsersList])


    return <>
        <HeaderNavbar />
        <div className="container">
            {content}
        </div>
    </>
}