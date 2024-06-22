// React and Hooks
import { useCallback, useEffect, useState } from "react";

// Components
import HeaderNavbar from "../components/HeaderNavbar";

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
    const { user, loading } = useUserData();
    const [content, setContent] = useState(<h1>Loading Home Page content...</h1>)
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

    const submitHandler = useCallback((e) => {
        e.preventDefault()
        const projectName = e.target[0].value
        const projectId = uuidV4()
        socket.emit("create-project", { projectId: projectId, projectName: projectName, userId: user._id })

        socket.on("new-project-created", () => {
            navigate(`/projects/${projectId}`)
        })
    }, [navigate, socket, user])

    useEffect(() => {
        if (!loading) {

            // Move to outside function
            const loadedContent = <>
                <div className="row">
                    <div className="col">
                        <h1>Welcome {user.username}</h1> <br />
                        <h2>User ID: {user._id}</h2>
                        <h2>Email: {user.email}</h2> <br />
                    </div>

                    <div className="col">
                        <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createProjectModal">
                            <h3>Create Project</h3>
                        </button>
                    </div>
                </div>

                <hr />
                <h1>Your Projects:</h1>

                {/* Create Project Modal Form */}
                <div className="modal fade" id="createProjectModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
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
                                        <input type="text" className="form-control" id="projectName" />
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="addUsers" className="form-label">Add Users to Project</label>
                                        <input type="search" className="form-control" id="addUsers" placeholder="Search for users here" />
                                    </div>
                                </form>
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
    }, [loading, user, submitHandler])


    return <>
        <HeaderNavbar />
        <div className="container">
            {content}
        </div>
    </>
}