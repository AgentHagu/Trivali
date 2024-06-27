// React and 
import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

// Components
import HeaderNavbar from "../components/HeaderNavbar";
import About from "../components/About";
import Expenses from "../components/Expenses";
import Itinerary from "../components/Itinerary";

// Custom Hooks
import useUserData from "../hooks/useUserData";

// Libraries
import { io } from "socket.io-client";
import { toast } from "react-toastify";
import { BudgetsProvider } from "../context/BudgetsContext";

const SERVER_URL = process.env.REACT_APP_API_URL;

/**
 * SearchBar component for adding users to a project.
 * Handles user search, validation, and addition/removal.
 *
 * @param {Object} props - Component props.
 * @param {SocketIO.Socket} props.socket - Socket instance for real-time communication.
 * @param {Object} props.currUser - Current user object.
 * @param {Array} props.addedUsersList - List of users already added to the project.
 * @param {Function} props.setAddedUsersList - Function to update the addedUsersList state.
 * @returns {JSX.Element} - SearchBar component JSX.
 */
function SearchBar({ socket, currUser, addedUsersList, setAddedUsersList }) {
    const [userValidity, setUserValidity] = useState(true)
    const [invalidMessage, setInvalidMessage] = useState("")

    /**
     * Converts a full user object to a simplified user object for storage.
     * @param {Object} user - Full user object.
     * @returns {Object} Simplified user object containing _id, username, and email.
     */
    function userToSimpleUser(user) {
        const simpleUser = {
            _id: user._id,
            username: user.username,
            email: user.email
        }

        return simpleUser
    }

    /**
     * Handles the search form submission.
     * Emits a 'search-user' event to the server with the search query.
     * @param {Event} e - Form submit event.
     */
    function searchHandler(e) {
        e.preventDefault()
        const userSearch = e.target[0].value

        socket.emit("search-user", userSearch)
    }

    useEffect(() => {
        /**
         * Handles the 'found-user' event from the server.
         * Validates the found user and updates the addedUsersList state if valid.
         * @param {Object} user - Found user object or null if not found.
         */
        const handleUserFound = user => {
            if (user == null) {
                setUserValidity(false)
                setInvalidMessage("No such user found")
                return
            }

            if (user._id === currUser._id) {
                setUserValidity(false)
                setInvalidMessage("You have already been added")
                return
            }

            const isUserInArray = addedUsersList.some(addedUser =>
                addedUser._id === user._id
            )

            if (!isUserInArray) {
                setUserValidity(true)
                setInvalidMessage("")
                const newList = [...addedUsersList, user]
                setAddedUsersList(newList)
                socket.emit("add-user", userToSimpleUser(user))

            } else {
                setUserValidity(false)
                setInvalidMessage("User has already been added")
            }
        }

        socket.on("found-user", handleUserFound)

        return () => {
            socket.off("found-user", handleUserFound)
        }
    }, [socket, addedUsersList, currUser, setAddedUsersList])

    /**
     * Removes a user from the addedUsersList state and emits a 'remove-user' event to the server.
     * @param {Object} simpleUser - Simplified user object to be removed.
     */
    function removeUserHandler(simpleUser) {
        const newList = addedUsersList.filter(addedUser => addedUser._id !== simpleUser._id)
        setAddedUsersList(newList)
        socket.emit("remove-user", simpleUser)
    }

    return <>
        <form className="mb-3" onSubmit={searchHandler}>
            <label htmlFor="addUsers" className="form-label">Add Users to Project</label>
            <div className="input-group has-validation">
                <input
                    type="search"
                    className={`form-control me-2 
                        ${userValidity ? '' : 'is-invalid'}`}
                    id="addUsers"
                    placeholder="Search with ID or Email"
                />
                <button className="btn btn-outline-primary" type="submit">
                    <i className="bi bi-search" />
                </button>
                <div className="invalid-feedback">
                    {invalidMessage}
                </div>
            </div>
        </form>

        {addedUsersList.length > 0
            ? <>
                <label className="form-label">Added Users</label>
                <ul className="list-group">
                    {addedUsersList.map(user => (
                        <li className="list-group-item d-flex justify-content-between align-items-center" key={user._id}>
                            <span>
                                {user.username} (Email: {user.email})
                            </span>
                            {
                                user._id !== currUser._id
                                    ? <button
                                        className="btn ms-auto p-0"
                                        onClick={() => removeUserHandler(user)}
                                    >
                                        <i className="bi bi-person-fill-dash" />
                                    </button>
                                    : <>Owner</>
                            }
                        </li>
                    ))}
                </ul>
            </>
            : <>
                <label className="form-label">No added Users</label>
            </>
        }

    </>
}


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
    const [content, setContent] = useState(<h1>Loading...</h1>)
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

        socket.once("load-project", project => {
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
            setContent(<About data={project.about} />)
            setAddedUsersList(project.userList)
        })

        if (!loading && user) {
            socket.emit("get-project", projectIdRef.current)
        }
    }, [socket, loading, user, navigate])

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

    // useEffect(() => {
    //     if (socket == null) return

    //     socket.on("kick-user", simpleUser => {
    //         // console.log("TRYING TO KICK USER -----")
    //         // console.log("USER TO KICK: ", simpleUser._id)
    //         // console.log("CURRENT USER: ", user._id)
    //         // if (simpleUser._id === user._id) {
    //         //     console.log("HEY")
    //         //     toast.error("You don't have access to this project. Redirecting to home page...", {
    //         //         //position: toast.POSITION.TOP_CENTER,
    //         //         autoClose: 3000
    //         //     })
    //         //     navigate('/home')
    //         // }

    //         toast.error("You don't have access to this project. Redirecting to home page...", {
    //             //position: toast.POSITION.TOP_CENTER,
    //             autoClose: 3000
    //         })
    //         navigate('/home')
    //     })
    // }, [loading, navigate, project, socket, user])

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
                                    <button type="button" className="btn btn-primary ms-auto fs-4" data-bs-toggle="modal" data-bs-target="#manageUsersModal">
                                        Manage Project
                                    </button>
                                </div>
                                : <></>
                        }

                    </div>

                    <div className="row row-cols-2 mt-3">
                        <div className="btn-group btn-group-lg" role="group">
                            <button
                                className="btn btn-outline-dark rounded-0 border-bottom-0 border-2 border-dark"
                                onClick={switchContent(<About projectId={projectIdRef.current} data={project.about} socket={socket} />)} >
                                About
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
                        </div>
                    </div>

                    <div className="border border-2 border-dark bg-white">
                        {content}
                    </div>
                </div>

                {/* Create Project Modal Form */}
                <div className="modal fade" id="manageUsersModal" data-bs-keyboard="false" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Manage Users</h5>
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
        </>
    )
}