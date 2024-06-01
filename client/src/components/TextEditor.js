import { useCallback, useEffect, useState } from 'react'
import Quill from "quill"
import "quill/dist/quill.snow.css"
import { io } from "socket.io-client"
import { useParams, useNavigate } from "react-router-dom"
import HeaderNavbar from './HeaderNavbar'

const SERVER_URL = process.env.REACT_APP_API_URL;

const SAVE_INTERVAL_MS = 2000
const TOOLBAR_OPTIONS = [
    [{ header: [1, 2, 3, 4, 5, 6, false] }],
    [{ font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    ["bold", "italic", "underline"],
    [{ color: [] }, { background: [] }],
    [{ script: "sub" }, { script: "super" }],
    [{ align: [] }],
    ["image", "blockquote"],
    ["clean"],
]

/**
 * TextEditor component for editing documents with real-time collaboration.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 */
export default function TextEditor() {
    const { id, page } = useParams()
    const [socket, setSocket] = useState()
    const [quill, setQuill] = useState()
    const navigate = useNavigate()

    const documentId = id + "/" + page
    const acceptablePages = ["details", "itinerary", "expenses", "map", "weather"]

    // Redirect if the page parameter is not possible
    useEffect(() => {
        if (!acceptablePages.includes(page)) {
            navigate(`/documents/${id}/details`)
        }
    }, [page])

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
        if (socket == null || quill == null) return

        socket.once("load-document", document => {
            quill.setContents(document);
            quill.enable();
        })

        socket.emit("get-document", documentId)
    }, [socket, quill, documentId])

    // Save document to server at regular intervals
    useEffect(() => {
        if (socket == null || quill == null) return

        const interval = setInterval(() => {
            socket.emit("save-document", quill.getContents())
        }, SAVE_INTERVAL_MS)

        return () => {
            clearInterval(interval)
        }
    }, [socket, quill])

    // Send changes to server when user edits the document
    useEffect(() => {
        if (socket == null || quill == null) return

        const handler = (delta, oldDelta, source) => {
            if (source !== "user") return
            socket.emit("send-changes", delta)
        }
        quill.on("text-change", handler)

        return () => {
            quill.off("text-change", handler)
        }
    }, [socket, quill])

    // Receive changes from server and update document
    useEffect(() => {
        if (socket == null || quill == null) return

        const handler = delta => {
            quill.updateContents(delta)
        }
        socket.on("receive-changes", handler)

        return () => {
            socket.off("receive-changes", handler)
        }
    }, [socket, quill])

    // Initialize Quill editor
    const wrapperRef = useCallback(wrapper => {
        if (wrapper == null) return

        wrapper.innerHTML = "";
        const editor = document.createElement('div')
        wrapper.append(editor)

        const q = new Quill(editor, { theme: "snow", modules: { toolbar: TOOLBAR_OPTIONS, history: { userOnly: true } } })
        q.disable()
        q.setText("Loading...")
        setQuill(q);
    }, [])
    return <>
        <HeaderNavbar />
        <div className="container" ref={wrapperRef}></div>
    </>
}
