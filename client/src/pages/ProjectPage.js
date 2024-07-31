// React and 
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Components
import HeaderNavbar from "../components/HeaderNavbar";
import SearchBar from "../components/SearchBar";
import About from "../components/About";
import Expenses from "../components/Expenses";
import Itinerary from "../components/Itinerary";
import Map from "../components/Map";
import Weather from "../components/Weather";

// Custom Hooks
import useUserData from "../hooks/useUserData";

// Libraries
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { BudgetsProvider } from "../context/BudgetsContext";
import LoadScriptProvider from "../context/LoadScriptProvider";

const SERVER_URL = process.env.REACT_APP_API_URL;

/**
 * Main component for managing a project, including its details and related functionalities.
 * Manages project loading, socket connections, user permissions, and dynamic content rendering.
 *
 * @returns {JSX.Element} - ProjectPage component JSX.
 */
export default function ProjectPage() {
    const { user, loading } = useUserData()
    const { id } = useParams()
    const projectIdRef = useRef(id)
    const [content, setContent] = useState(<div className="container mt-3 d-flex justify-content-center align-items-center vh-100">
        <div className="text-center">
            <div className="spinner-border" role="status">
                <span className="visually-hidden">Loading...</span>
            </div>
        </div>
    </div>)
    const [socket, setSocket] = useState()
    const [project, setProject] = useState()
    const [projectLoading, setProjectLoading] = useState(true)
    const navigate = useNavigate()
    const [addedUsersList, setAddedUsersList] = useState([])

    // Establish socket connection with server
    useEffect(() => {
        const s = io(`${SERVER_URL}`)
        setSocket(s)

        return () => {
            s.disconnect()
        }
    }, [])

    // Load project data from the server and handle initial setup
    useEffect(() => {
        if (socket == null || loading) return

        socket.on("load-project", project => {
            // Regardless of outcome, setProject and setProjectLoading
            setProject(project)
            setProjectLoading(false)

            // if project is null, i.e. it doesn't exist, go to home page
            // Otherwise, it exists and we can refer to its properties
            if (project == null) {
                toast.error("No such project exists! Redirecting to home page...", {
                    position: "top-center",
                    autoClose: 3000
                })
                navigate('/home')
                return
            }

            // Check user's permission to access the project
            if (!loading && !project.userList.some(addedUser =>
                addedUser._id === user._id)) {
                toast.error("You don't have access to this project. Redirecting to home page...", {
                    position: "top-center",
                    autoClose: 3000
                })
                navigate('/home')
            }

            // Set initial content based on project data
            setContent(<About projectId={projectIdRef.current} data={project.about} socket={socket} />)
            setAddedUsersList(project.userList)
        })

        // Request for project
        if (!loading && user) {
            socket.emit("get-project", projectIdRef.current)
        }
    }, [socket, loading, user, navigate])

    useEffect(() => {
        if (socket == null || loading) return

        socket.on("update-project", updatedProject => {
            setProject(updatedProject)

            // Check user's permission to access the project, user may have been kicked
            if (!loading && !updatedProject.userList.some(addedUser =>
                addedUser._id === user._id)) {
                toast.error("You were kicked and no longer have access to this project. Redirecting to home page...", {
                    position: "top-center",
                    autoClose: 5000
                })
                navigate('/home')
            }
        })
    }, [socket, loading, user, navigate])

    useEffect(() => {
        if (socket == null || loading) return

        socket.on("project-deleted", () => {
            toast.error("Project was deleted by owner. Redirecting to home page...", {
                position: "top-center",
                autoClose: 3000
            })
            navigate('/home')
        })
    }, [socket, loading, navigate])

    /**
     * Handles changes to the project name and emits the change to the server.
     * @param {Event} event - Input change event.
     */
    function changeNameHandler(event) {
        socket.emit("change-project-name", event.target.value)
    }

    /**
     * Deletes the project after confirming with the user.
     */
    function deleteProjectHandler(event) {
        if (window.confirm("Are you sure you want to delete your project? All progress will be lost")) {
            socket.emit("delete-project")
            navigate('/home')
        }
    }

    /**
     * Switches the displayed content based on user selection.
     * @param {JSX.Element} newContent - New content to display.
     */
    const switchContent = (newContent) => () => {
        setContent(newContent)
    }

    // Render loading indicator while fetching project data
    if (project == null) {
        if (loading) {
            return <>
                <HeaderNavbar />
                <div className="container mt-3 d-flex justify-content-center align-items-center vh-100">
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </>
        }

        if (projectLoading) {
            return <>
                <HeaderNavbar />
                <div className="container mt-3 d-flex justify-content-center align-items-center vh-100">
                    <div className="text-center">
                        <div className="spinner-border" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                    </div>
                </div>
            </>
        }

        return
    }

    // Render the main project page once project data is loaded
    return (
        <>
            <LoadScriptProvider>
                <BudgetsProvider>
                    <HeaderNavbar />
                    <div className="container mt-3">
                        <div className="row">
                            <div className="col">
                                {
                                    !project.name
                                        ? <h1>Untitled Project</h1>
                                        : <h1>{project.name}</h1>
                                }
                            </div>

                            {/* Only render the manage user button for the owner */}
                            {/* TODO: Have it exist for the admins as well */}
                            {
                                project.owner._id === user._id
                                    ? <div className="col d-flex">
                                        <button
                                            className="btn btn-secondary ms-auto d-flex align-items-center justify-content-center"
                                            style={{ width: "60px", height: "60px", borderRadius: "15px" }}
                                            data-bs-toggle="modal"
                                            data-bs-target="#manageUsersModal"
                                            title="Manage project"
                                        >
                                            <i className="bi bi-gear-fill"
                                                style={{ fontSize: "2rem", lineHeight: "1" }}
                                            />
                                        </button>
                                    </div>
                                    : <></>
                            }

                        </div>

                        <div className="row row-cols-1 mt-3">
                            <div className="btn-group btn-group-lg" role="group">
                                <button
                                    className="btn btn-outline-dark rounded-0 border-bottom-0 border-2 border-dark"
                                    onClick={switchContent(<About projectId={projectIdRef.current} data={project.about} socket={socket} />)} >
                                    Planning
                                </button>

                                <button
                                    className="btn btn-outline-dark rounded-0 border-bottom-0 border-2 border-dark"
                                    onClick={switchContent(<Itinerary projectId={projectIdRef.current} data={project.itinerary} socket={socket} />)} >
                                    Itinerary
                                </button>

                                <button
                                    className="btn btn-outline-dark rounded-0 border-bottom-0 border-2 border-dark"
                                    onClick={switchContent(<Expenses projectId={projectIdRef.current} data={project.expenses} socket={socket} />)} >
                                    Expenses
                                </button>

                                <button
                                    className="btn btn-outline-dark rounded-0 border-bottom-0 border-2 border-dark"
                                    onClick={switchContent(<Map projectId={projectIdRef.current} data={project} socket={socket} />)} >
                                    Map
                                </button>

                                <button
                                    className="btn btn-outline-dark rounded-0 border-bottom-0 border-2 border-dark"
                                    onClick={switchContent(<Weather projectId={projectIdRef.current} data={project} socket={socket} />)} >
                                    Weather
                                </button>
                            </div>
                        </div>

                        <div className="border border-2 border-dark bg-white mb-5">
                            {content}
                        </div>
                    </div>

                    {/* Create Project Modal Form */}
                    <div className="modal fade" id="manageUsersModal" data-bs-keyboard="false" tabIndex="-1" aria-hidden="true">
                        <div className="modal-dialog modal-dialog-centered">
                            <div className="modal-content">
                                <div className="modal-header">
                                    <h5 className="modal-title">Manage Users</h5>
                                    <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                                </div>

                                <div className="modal-body">
                                    <form id="createProjectForm">
                                        <div className="mb-3">
                                            <label htmlFor="projectName" className="form-label">Project Name</label>
                                            <input type="text" className="form-control" id="projectName" placeholder="Enter a name for your project" value={project.name} onChange={(e) => setProject({ ...project, name: e.target.value })} onBlur={changeNameHandler} />
                                        </div>
                                    </form>

                                    <SearchBar socket={socket} currUser={user} addedUsersList={addedUsersList} setAddedUsersList={setAddedUsersList} />
                                </div>

                                <div className="modal-footer">
                                    <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={deleteProjectHandler}>Delete Project</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </BudgetsProvider>
            </LoadScriptProvider>
        </>
    )
}