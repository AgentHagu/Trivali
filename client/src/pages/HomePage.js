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
        socket.emit("create-project", {
            projectId: projectId,
            projectName: projectName,
            userId: user._id,
            userList: addedUsersList
        })

        socket.on("new-project-created", () => {
            navigate(`/projects/${projectId}`)
        })
    }, [addedUsersList, navigate, socket, user])

    useEffect(() => {
        if (!loading) {
            setAddedUsersList([user])
        }
    }, [loading, user])

    useEffect(() => {
        if (!loading) {
            const loadedContent = <>
                <div className="row">
                    <div className="col">
                        <h1>Welcome, {user.username}</h1>
                        <h2>User ID: {user._id}</h2>
                        <h2>Email: {user.email}</h2>
                    </div>

                    <div className="col d-flex flex-column justify-content-end align-items-end">
                        <button type="button" className="btn btn-primary fs-1" data-bs-toggle="modal" data-bs-target="#createProjectModal">
                            Create Project
                        </button>
                    </div>
                </div>

                <hr />
                <h1 className="pb-2">Your Projects:</h1>
                <ul className="list-group">
                    <div className="row">
                        {
                            user.projectList.length > 0
                                ? user.projectList.map(simpleProject => (
                                    <li className="list-group-item d-flex justify-content-between align-items-center" key={simpleProject._id}>
                                        <a href={`../projects/${simpleProject._id}`} className="fs-4">
                                            <span>
                                                {
                                                    simpleProject.name
                                                        ? <>{simpleProject.name}</>
                                                        : <>Untitled Project</>
                                                }
                                            </span>
                                        </a>
                                    </li>
                                    // <a href={`../projects/${simpleProject._id}`} className="fs-4 col-md-4 d-block text-decoration-none">
                                    //     <div className="card h-100 mb-4 shadow-sm">
                                    //         <div className="card-header">{simpleProject.name}</div>
                                    //         <img className="card-img-top" src="https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg"
                                    //             alt="Feature" style={{ height: "225px", width: "100%", display: "block" }} />
                                    //         <div className="card-body">
                                    //             <p className="card-text fs-6">
                                    //                 lorem
                                    //             </p>
                                    //         </div>
                                    //     </div>
                                    // </a>
                                ))
                                : <h3>You currently have no projects.</h3>
                        }
                    </div>
                </ul>

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
    }, [loading, user, submitHandler, socket, addedUsersList])


    return <>
        <HeaderNavbar />
        <div className="container">
            {content}
        </div>
    </>
}