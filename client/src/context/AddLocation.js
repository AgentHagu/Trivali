import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';

/**
 * AddLocation Component
 * 
 * A modal component for adding a new location. It allows users to input a location and submit it.
 * 
 * @param {Object} props - The component props.
 * @param {boolean} props.show - Determines if the modal is visible.
 * @param {Function} props.handleClose - Callback function to close the modal.
 * @param {Function} props.addLocation - Callback function to handle adding the new location.
 * 
 * @returns {JSX.Element} The rendered component.
 */
export default function AddLocation({ show, handleClose, addLocation }) {
    const [location, setLocation] = useState('')

    /**
     * Handles form submission.
     * 
     * @param {Event} event - The form submit event.
     * @returns {void}
     */
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
