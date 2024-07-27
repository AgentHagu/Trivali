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
    );

    useEffect(() => {
        if (!loading) {
            const loadedContent = <>
                <OverlayTrigger placement="top" overlay={tooltip}>
                    <button
                        className="btn btn-primary rounded-circle position-fixed bottom-0 end-0 mb-5 me-5 d-flex align-items-center justify-content-center"
                        style={{ width: "80px", height: "80px" }}
                        data-bs-toggle="modal"
                        data-bs-target="#createProjectModal"
                        title="Create project"
                    >
                        <i className="bi bi-plus-circle" style={{ fontSize: "3rem" }}></i>
                    </button>
                </OverlayTrigger>

                <div className="row fs-4 mb-2 mt-4">
                    <div className="col">
                        <div className="ps-3">
                            Project Name
                        </div>
                    </div>

                    <div className="col">
                        Owned by
                    </div>
                </div>
                <ul className="list-group fs-5">
                    {
                        user.projectList.length > 0
                            ? user.projectList.map(simpleProject => (
                                // <li className="list-group-item d-flex justify-content-between align-items-center" key={simpleProject._id}>
                                <a href={`../projects/${simpleProject._id}`} className="list-group-item list-group-item-action" key={simpleProject._id}>
                                    <div className="row">
                                        <div className="col text-truncate">
                                            {simpleProject.name || "Untitled Project"}
                                            {simpleProject.isShared && <i className="bi bi-people-fill ms-3" title="Shared Project"></i>}
                                        </div>
                                        <div className="col">
                                            {simpleProject.owner === user.username
                                                ? "me"
                                                : simpleProject.owner}
                                        </div>
                                    </div>
                                </a>
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