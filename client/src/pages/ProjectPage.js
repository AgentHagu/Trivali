import { useEffect, useRef, useState } from "react";
import HeaderNavbar from "../components/HeaderNavbar";
import WelcomePage from "./WelcomePage"
import About from "../components/About";
import Expenses from "../components/Expenses";
import Itinerary from "../components/Itinerary";
import useUserData from "../hooks/useUserData";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

const SERVER_URL = process.env.REACT_APP_API_URL;

export default function ProjectPage() {
    const { id } = useParams()
    const projectIdRef = useRef(id)
    const [content, setContent] = useState(<h1>Loading...</h1>)
    const [socket, setSocket] = useState()
    const [project, setProject] = useState()

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
            setProject(project)
            setContent(<About data={project.about} />)
        })

        socket.emit("get-project", projectIdRef.current)
    }, [socket, projectIdRef])

    const switchContent = (newContent) => () => {
        setContent(newContent)
    }

    if (project == null) {
        return <>
            <h1>LOADING</h1>
        </>
    }

    return (
        <>
            <HeaderNavbar />
            <div className="container mt-3">
                <h1>Project {project.name}</h1>
                <div className="row row-cols-2 mt-3">
                    <div className="btn-group btn-group-lg" role="group">
                        <button type="button" className="btn btn-outline-dark rounded-0 border-bottom-0 border-2 border-dark" onClick={switchContent(<About data={project.about} socket={socket}/>)}>About</button>
                        <button type="button" className="btn btn-outline-dark rounded-0 border-bottom-0 border-2 border-dark" onClick={switchContent(<Itinerary data={project.itinerary} socket={socket}/>)}>Itinerary</button>
                        <button type="button" className="btn btn-outline-dark rounded-0 border-bottom-0 border-2 border-dark" onClick={switchContent(<Expenses data={project.expenses} socket={socket}/>)}>Expenses</button>
                    </div>
                </div>
                <div className="border border-2 border-dark">
                    {content}
                </div>
            </div>
        </>
    )
}