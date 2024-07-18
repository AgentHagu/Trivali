import { Button, ButtonToolbar, OverlayTrigger, Tooltip } from "react-bootstrap";
import GoogleMapSearchBar from "../components/GoogleMapSearchBar";

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
        <div className="App">
            <OverlayTrigger placement="right" overlay={tooltip}>
                <i
                    className="bi bi-info-circle-fill position-absolute"
                    style={{ pointerEvents: 'none' }}
                    data-toggle="tooltip"
                    data-placement="top"
                    title="TEST"
                />

            </OverlayTrigger>

            <OverlayTrigger placement="right" overlay={tooltip}>
                <div>Test</div>
            </OverlayTrigger>

            {/* <OverlayTrigger placement="top" overlay={tooltip}>
                    <Button bsStyle="default">Holy guacamole!</Button>
                </OverlayTrigger>

                <OverlayTrigger placement="bottom" overlay={tooltip}>
                    <Button bsStyle="default">Holy guacamole!</Button>
                </OverlayTrigger>

                <OverlayTrigger placement="right" overlay={tooltip}>
                    <Button bsStyle="default">Holy guacamole!</Button>
                </OverlayTrigger> */}
        </div>
    );
}