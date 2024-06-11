import { EditorContent, useEditor } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import Collaboration from "@tiptap/extension-collaboration"
import CollaborationCursor from "@tiptap/extension-collaboration-cursor"
import { HocuspocusProvider } from '@hocuspocus/provider'

// import * as Y from "yjs"
// import { WebrtcProvider } from "y-webrtc"

// const ydoc = new Y.Doc();
// const provider = new WebrtcProvider("hello", ydoc);


// const provider = new HocuspocusProvider({
//     url: 'ws://127.0.0.1:1234',
//     name: 'example-document',
// })


// export default function Tiptap(props) {
//     const editor = useEditor({
//         content: "<p>Hello World!<p/>",
//         extensions: [
//             StarterKit.configure({
//                 history: false
//             }),
//             Collaboration.configure({
//                 document: provider.document
//             }),
//             CollaborationCursor.configure({
//                 provider: provider,
//                 user: {
//                     name: "User1",
//                     color: "#DDFD98"
//                 }
//             })
//         ]
//     })

//     return <EditorContent editor={editor} />
// }