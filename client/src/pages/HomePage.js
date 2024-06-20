import { useEffect, useRef, useState } from "react";
import HeaderNavbar from "../components/HeaderNavbar";
import useUserData from "../hooks/useUserData";
import { v4 as uuidV4 } from "uuid"
import { Navigate, useNavigate } from "react-router-dom";
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
    const [content, setContent] = useState(<h1>Loading...</h1>)
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

    function createProjectHandler() {
        const projectId = uuidV4()
        socket.emit("create-project", { projectId: projectId, userId: user._id } )
        navigate(`/projects/${projectId}`)
    }

    useEffect(() => {
        const loadedContent = <>
            <h1>Welcome</h1>
            <button type="button" class="btn btn-primary" onClick={createProjectHandler}>Create Project</button>
        </>

        if (!loading) {
            setContent(loadedContent)
        }
    }, [loading])


    return <>
        <HeaderNavbar />
        <div className="container">
            {content}
        </div>
    </>
}