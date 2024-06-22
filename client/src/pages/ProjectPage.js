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

export default function ProjectPage() {
    const { user, loading } = useUserData()
    const { id } = useParams()
    const projectIdRef = useRef(id)
    const [content, setContent] = useState(<h1>Loading...</h1>)
    const [socket, setSocket] = useState()
    const [project, setProject] = useState()
    const [projectLoading, setProjectLoading] = useState(true)
    const navigate = useNavigate()

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
        if (socket == null) return

        socket.once("load-project", project => {
            // Regardless of outcome, setProject and setProjectLoading
            setProject(project)
            setProjectLoading(false)

            // if project is null, i.e. it doesn't exist, go to home page
            if (project == null) {
                toast.error("No such project exists! Redirecting to home page...", {
                    //position: toast.POSITION.TOP_CENTER,
                    autoClose: 3000
                })
                navigate('/home')
                return
            }

            // TODO: Navigate to home page, add toast "Not authorized to view this project"
            if (!loading && !project.userList.includes(user._id)) {
                toast.error("You don't have access to this project. Redirecting to home page...", {
                    //position: toast.POSITION.TOP_CENTER,
                    autoClose: 3000
                })
                navigate('/home')
            }

            setContent(<About data={project.about} />)
        })

        if (!loading && user) {
            socket.emit("get-project", projectIdRef.current)
        }
    }, [socket, projectIdRef, loading, user, navigate])

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
                {
                    !project.name 
                    ? <h1>Untitled Project</h1>
                    : <h1>{project.name}</h1>
                }
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
        </>
    )
}