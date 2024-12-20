import { useCallback, useEffect, useState } from 'react'
import Quill from "quill"
import QuillCursors from 'quill-cursors';
import "quill/dist/quill.snow.css"

import { io } from "socket.io-client"
import { useParams } from "react-router-dom"

const SERVER_URL = process.env.REACT_APP_API_URL;

const SAVE_INTERVAL_MS = 1000
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

        const handleBeforeUnload = () => {
            s.emit("send-delete-cursor", id + user._id)
        }

        window.addEventListener("beforeunload", handleBeforeUnload)

        return () => {
            s.emit("send-delete-cursor", id + user._id)
            s.disconnect()
            window.removeEventListener("beforeunload", handleBeforeUnload)
        }
    }, [id, user])

    // Load document from server on component mount
    useEffect(() => {
        if (socket == null || quill == null) return

        socket.once("load-document", document => {
            quill.setContents(document);
            quill.enable();
        })

        socket.emit("get-document", { documentId: documentId, projectId: projectId })
    }, [socket, quill, documentId, projectId])

    // Save document to server at regular intervals
    useEffect(() => {
        if (socket == null || quill == null) return

        const interval = setInterval(() => {
            socket.emit("save-document", quill.getContents())
            socket.emit("get-cursors", { senderId: socket.id, toggleFlag: false })
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
        const cursors = quill.getModule("cursors")

        // Whenever text editor selection changes, emit events to update
        const changeHandler = (range, oldRange, source) => {
            socket.emit("send-cursor-changes", { id: id + user._id, user, range })
        }

        // Whenever receive cursor updates, redraw the cursor
        const receiveHandler = ({ id, user, range }) => {
            cursors.createCursor(id, user.username, user.color)
            cursors.moveCursor(id, range)
            // cursors.toggleFlag(id, true)

            // setTimeout(() => {
            //     cursors.toggleFlag(id, false)
            // }, 2000)
        }

        quill.on("selection-change", changeHandler)
        socket.on("receive-cursor-changes", receiveHandler)

        return () => {
            quill.off("selection-change", changeHandler)
            socket.off("receive-cursor-changes", receiveHandler)
        }
    }, [socket, quill, user, id])

    useEffect(() => {
        if (socket == null || quill == null) return
        const cursors = quill.getModule("cursors")

        // When first connect, ask for other cursors
        const connectHandler = () => {
            socket.emit("get-cursors", { senderId: socket.id, toggleFlag: true })
        }

        socket.on("connect", connectHandler)

        // When first receive the other cursors data, draw them with a flag
        const receiveHandler = ({ cursor, toggleFlag }) => {
            cursors.createCursor(cursor.id, cursor.name, cursor.color)
            cursors.moveCursor(cursor.id, cursor.range)

            if (toggleFlag) {
                cursors.toggleFlag(cursor.id, true)

                setTimeout(() => {
                    cursors.toggleFlag(cursor.id, false)
                }, 2000)
            }
        }

        // When asked for my own cursor data, send to senderId
        const sendHandler = ({ senderId, toggleFlag }) => {
            const range = quill.getSelection()

            if (range) {
                const cursor = { id: id + user._id, name: user.username, color: user.color, range: range }
                socket.emit("send-cursor-data", { cursor, senderId, toggleFlag })
            }
        }

        // When asked to delete other cursor, delete based on id
        const deleteHandler = id => {
            cursors.removeCursor(id)
        }

        socket.on("receive-cursor", receiveHandler)
        socket.on("send-cursor", sendHandler)

        // TODO: Check if this works with 3 accounts
        socket.on("delete-cursor", deleteHandler)

        return () => {
            socket.off("connect", connectHandler)
            socket.off("receive-cursor", receiveHandler)
            socket.off("send-cursor", sendHandler)
            socket.off("delete-cursor", deleteHandler)
        }
    }, [socket, quill, id, user])

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
                    cursors: {
                        hideDelayMs: 2000,
                    }
                },
                placeholder: placeholder
            }
        )

        q.disable()
        // q.setText("")
        setQuill(q);
    }, [placeholder])
    return <>
        <div className="w-100 h-100" ref={wrapperRef}></div>
    </>
}
