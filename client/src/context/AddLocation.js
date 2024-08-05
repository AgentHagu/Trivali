import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

export default function AddLocation({ show, handleClose, addLocation }) {
    const [location, setLocation] = useState('')

    const handleSubmit = (event) => {
        event.preventDefault()
        addLocation(location)
        setLocation('')
        handleClose()
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Add Location</Modal.Title>
            </Modal.Header>
            <Form onSubmit={handleSubmit}>
                <Modal.Body>
                    <Form.Group controlId="formLocation">
                        <Form.Label>Location</Form.Label>
                        <Form.Control
                            type="text"
                            placeholder="Enter location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            required
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Close
                    </Button>
                    <Button variant="primary" type="submit">
                        Add Location
                    </Button>
                </Modal.Footer>
            </Form>
        </Modal>
    );
}
