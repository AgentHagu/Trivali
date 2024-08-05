import { useCallback, useEffect, useState } from 'react'
import Quill from "quill"
import QuillCursors from 'quill-cursors';
import "quill/dist/quill.snow.css"

import { io } from "socket.io-client"
import { useParams } from "react-router-dom"

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

Quill.register('modules/cursors', QuillCursors)

/**
 * TextEditor component for editing documents with real-time collaboration.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 */
export default function TextEditor({ page, number, projectId, placeholder, user }) {
    const { id } = useParams()
    const [socket, setSocket] = useState()
    const [quill, setQuill] = useState()

    const documentId = id + "/" + page + "/" + number

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

        socket.emit("get-document", { documentId: documentId, projectId: projectId })
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
            socket.emit("send-document-changes", delta)
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
        socket.on("receive-document-changes", handler)

        return () => {
            socket.off("receive-document-changes", handler)
        }
    }, [socket, quill])

    // Send cursor data to server and other users
    useEffect(() => {
        if (socket == null || quill == null || user == null) return

        const handler = (range, oldRange, source) => {
            // console.log("Local cursor change: ", range);
            socket.emit("send-cursor-changes", { id, user, color: "orange", range })
        }

        quill.on("selection-change", handler)

        return () => {
            quill.off("selection-change", handler)
        }
    }, [socket, quill])

    useEffect(() => {
        if (socket == null || quill == null) return

        socket.on("receive-cursor-changes", ({id, user, color, range}) => {
            const cursors = quill.getModule("cursors")
            cursors.createCursor(id, user.username, color)
            cursors.moveCursor(id, range)
            cursors.toggleFlag(id, true)
        })
    })

    // Initialize Quill editor
    const wrapperRef = useCallback(wrapper => {
        if (wrapper == null) return

        wrapper.innerHTML = "";
        const editor = document.createElement('div')
        wrapper.append(editor)

        const q = new Quill(editor,
            {
                theme: "snow",
                modules: {
                    toolbar: false,
                    history: { userOnly: true },
                    cursors: true
                },
                placeholder: placeholder
            }
        )

        q.disable()
        // q.setText("")
        setQuill(q);
    }, [])
    return <>
        <div className="w-100 h-100" ref={wrapperRef}></div>
    </>
}
