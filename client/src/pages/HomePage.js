import { useCallback, useEffect, useState } from "react";
import HeaderNavbar from "../components/HeaderNavbar";
import useUserData from "../hooks/useUserData";
import { v4 as uuidV4 } from "uuid"
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

    const createProjectHandler = useCallback(() => {
        const projectId = uuidV4()
        socket.emit("create-project", { projectId: projectId, userId: user._id })

        // socket.on("new-project-created", () => {
        //     navigate(`/projects/${projectId}`)
        // })
        navigate(`/projects/${projectId}`)
    }, [navigate, socket, user])

    useEffect(() => {
        if (!loading) {
            const loadedContent = <>
                <h1>Welcome {user.username}</h1> <br />
                <h2>User ID: {user._id}</h2>
                <h2>Email: {user.email}</h2> <br/>
                <button type="button" className="btn btn-primary" onClick={createProjectHandler}>Create Project</button>
            </>
            setContent(loadedContent)
        }
    }, [loading, createProjectHandler, user])


    return <>
        <HeaderNavbar />
        <div className="container">
            {content}
        </div>
    </>
}