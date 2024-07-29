import { Button, ButtonToolbar, OverlayTrigger, Tooltip } from "react-bootstrap";
import GoogleMapSearchBar from "../components/GoogleMapSearchBar";
import TextEditor from "../components/TextEditor";

export default function Test() {
    const handlePlaceSelected = (place) => {
        console.log('Selected place:', place);
    };
    const tooltip = (
        <Tooltip id="tooltip">
            <strong>Holy guacamole!</strong> Check this info.
        </Tooltip>
    );

    return (
        <TextEditor page="hi" number="1"/>
    );
}