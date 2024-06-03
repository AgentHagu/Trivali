import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Collaboration from "@tiptap/extension-collaboration"
import CollaborationCursor from "@tiptap/extension-collaboration-cursor"
import * as Y from "yjs"
import { WebrtcProvider } from "y-webrtc"

const ydoc = new Y.Doc();
const provider = new WebrtcProvider("tiptap-test", ydoc);

export default function Tiptap() {
    const editor = useEditor({
        content: "<p>Hello World!<p/>",
        extensions: [StarterKit, Collaboration.configure({
            document: ydoc
        }),
        CollaborationCursor.configure({
            provider: provider,
            user: {
                name: "User1",
                color: "#DDFD98"
            }
        })
    ]
    })

    return <EditorContent editor={editor} />
}