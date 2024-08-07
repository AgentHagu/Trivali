import { Button, ButtonToolbar, OverlayTrigger, Tooltip } from "react-bootstrap";
import GoogleMapSearchBar from "../components/GoogleMapSearchBar";
import TextEditor from "../components/TextEditor";
import useUserData from "../hooks/useUserData";

export default function Test() {
    const user = useUserData()
    console.log(user)

    return (
        <TextEditor page="hi" number="1"/>
    );
}