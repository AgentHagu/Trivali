import { useState } from "react";
import HeaderNavbar from "../components/HeaderNavbar";
import Tiptap from "../components/Tiptap";
import WelcomePage from "./WelcomePage"
import About from "../components/About";
import Expenses from "../components/Expenses";
import Itinerary from "../components/Itinerary";
import useUserData from "../hooks/useUserData";

export default function ProjectPage() {
    // const user = useUserData();
    const [content, setContent] = useState(<About />)

    const switchContent = (newContent) => () => {
        setContent(newContent)
    }

    return (
        <>
            <HeaderNavbar />
            <div class="container mt-3">
                <h1>Project [Trip name]</h1>
                <div class="row row-cols-2 mt-3">
                    <div class="btn-group btn-group-lg" role="group">
                        <button type="button" class="btn btn-outline-dark rounded-0 border-bottom-0 border-2 border-dark" onClick={switchContent(<About />)}>About</button>
                        <button type="button" class="btn btn-outline-dark rounded-0 border-bottom-0 border-2 border-dark" onClick={switchContent(<Itinerary />)}>Itinerary</button>
                        <button type="button" class="btn btn-outline-dark rounded-0 border-bottom-0 border-2 border-dark" onClick={switchContent(<Expenses />)}>Expenses</button>
                    </div>
                </div>
                <div class="border border-2 border-dark">
                    {content}
                </div>
            </div>
        </>
    )
}