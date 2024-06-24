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

const SERVER_URL = process.env.REACT_APP_API_URL;

function SearchBar({ socket, currUser, addedUsersList, setAddedUsersList }) {
    function userToSimpleUser(user) {
        const simpleUser = {
            _id: user._id,
            username: user.username,
            email: user.email
        }

        return simpleUser
    }

    function searchHandler(e) {
        e.preventDefault()
        const userSearch = e.target[0].value

        socket.emit("search-user", userSearch)
    }

    useEffect(() => {
        const handleUserFound = user => {
            if (user == null) {
                //TODO: Add toast or something for this message
                console.log("NO USER FOUND")
                return
            }

            if (user._id === currUser._id) {
                //TODO: Add toast or something for this message
                console.log("ITS YOU")
                return
            }

            const isUserInArray = addedUsersList.some(addedUser =>
                addedUser._id === user._id
            )

            if (!isUserInArray) {
                console.log("USER HASNT BEEN ADDED")
                const newList = [...addedUsersList, user]
                setAddedUsersList(newList)
                socket.emit("add-user", userToSimpleUser(user))
            } else {
                console.log("User is already added")
            }
        }

        socket.on("found-user", handleUserFound)

        return () => {
            socket.off("found-user", handleUserFound)
        }
    }, [socket, addedUsersList, currUser, setAddedUsersList])

    function removeUserHandler(simpleUser) {
        const newList = addedUsersList.filter(addedUser => addedUser._id !== simpleUser._id)
        setAddedUsersList(newList)
        socket.emit("remove-user", simpleUser)
    }

    return <>
        <label htmlFor="addUsers" className="form-label">Add Users to Project</label>

        <form className="mb-3 d-flex" onSubmit={searchHandler}>
            <input type="search" className="form-control me-2" id="addUsers" placeholder="Search with ID or Email" />
            <button className="btn btn-outline-primary" type="submit"><i className="bi bi-search" /></button>
        </form>

        {
            addedUsersList.length > 0
                ? <>
                    <label className="form-label">Added Users</label>
                    <ul className="list-group">
                        {addedUsersList.map(user => (
                            //TODO: Add unique key for list item
                            <li className="list-group-item d-flex justify-content-between align-items-center" key={user._id}>
                                <span>
                                    {user.username} (Email: {user.email})
                                </span>
                                {
                                    user._id !== currUser._id
                                        ? <button className="btn ms-auto p-0" onClick={() => removeUserHandler(user)}><i className="bi bi-person-fill-dash" /></button>
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

    // Load document from server on component mount
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
                    //position: toast.POSITION.TOP_CENTER,
                    autoClose: 3000
                })
                navigate('/home')
                return
            }

            if (!loading && !project.userList.some(addedUser =>
                addedUser._id === user._id)) {
                toast.error("You don't have access to this project. Redirecting to home page...", {
                    //position: toast.POSITION.TOP_CENTER,
                    autoClose: 3000
                })
                navigate('/home')
            }

            setContent(<About data={project.about} />)
            setAddedUsersList(project.userList)
        })

        if (!loading && user) {
            socket.emit("get-project", projectIdRef.current)
        }
    }, [socket, loading, user, navigate])

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

    const switchContent = (newContent) => () => {
        setContent(newContent)
    }

    if (project == null) {
        if (loading) {
            return <>
                <HeaderNavbar />
                <div className="container mt-3">
                    <h1>Loading User...</h1>
                </div>

            </>
        }

        if (projectLoading) {
            return <>
                <HeaderNavbar />
                <div className="container mt-3">
                    <h1>Loading Project...</h1>
                </div>
            </>
        }

        return
    }

    return (
        <>
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
                                    Manage Users
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
                            <SearchBar socket={socket} currUser={user} addedUsersList={addedUsersList} setAddedUsersList={setAddedUsersList} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}