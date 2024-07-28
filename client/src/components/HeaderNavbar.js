import { useNavigate } from "react-router-dom";
import useUserData from "../hooks/useUserData"
import { useState } from "react";
import { OverlayTrigger, Tooltip } from "react-bootstrap";

const SERVER_URL = process.env.REACT_APP_API_URL;

/**
 * HeaderNavbar component provides web-app navigation bar.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 */
export default function HeaderNavbar() {
    const { user, loading } = useUserData();
    const navigate = useNavigate()
    const [showCopiedTooltip, setShowCopiedTooltip] = useState(false)

    /**
     * Handles user logout by sending a DELETE request to the server.
     *
     * @param {React.MouseEvent<HTMLAnchorElement, MouseEvent>} event - The click event.
     * @returns {Promise<void>} A promise that resolves when the logout process is complete.
     */
    const handleLogout = async (event) => {
        event.preventDefault();

        const response = await fetch(`${SERVER_URL}/logout`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include'
        })

        if (response.ok) {
            navigate('/')
        } else {
            navigate('/')
        }
    };

    async function copyToClipboard(event) {
        const uid = event.target.closest("h6").textContent

        try {
            await navigator.clipboard.writeText(uid)
            setShowCopiedTooltip(true)
            setTimeout(() => setShowCopiedTooltip(false), 1000)
        } catch (err) {
            console.log(err)
            setShowCopiedTooltip(false)
        }
    }

    const tooltip = (
        <Tooltip id="button-tooltip">
            Copied!
        </Tooltip>
    )

    return <header className="sticky-top mb-2">
        <div className="navbar navbar-expand-sm navbar-dark bg-dark">
            <div className="container d-flex justify-content-between">
                {/* TODO: clean up code here for the loading and user conditionals */}

                {
                    loading
                        ? <></>
                        : user
                            ? <>
                                <a className="navbar-brand d-flex align-items-center" href="/home" title="Go to home page">
                                    {/* add logo here */}
                                    <strong>Trivali</strong>
                                </a>
                            </>
                            : <>
                                <a className="navbar-brand d-flex align-items-center" href="/welcome" title="Go to welcome page">
                                    {/* add logo here */}
                                    <strong>Trivali</strong>
                                </a>
                            </>

                }

                <ul className="navbar-nav">
                    {
                        // If still loading, leave blank
                        // Else if user is logged in, show the logout button
                        // Else, show login and sign up buttons
                        loading
                            ? <></>
                            : user
                                ?
                                <li className="nav=item">
                                    <div className="dropdown">
                                        <button
                                            className="btn p-0 border-0 bg-transparent"
                                            type="button"
                                            data-bs-toggle="dropdown"
                                            data-bs-auto-close="outside">
                                            <i
                                                className="bi bi-person-circle text-light"
                                                style={{ fontSize: "2rem", cursor: "pointer" }}
                                            />
                                        </button>

                                        <div
                                            className="dropdown-menu dropdown-menu-end"
                                            style={{ width: "250px" }}
                                        >
                                            <div className="container">
                                                <h4>Hi, {user.username}</h4>
                                                <h6 className="d-flex align-items-center">
                                                    UID: {user._id}
                                                    <OverlayTrigger
                                                        placement="top"
                                                        show={showCopiedTooltip}
                                                        overlay={tooltip}
                                                    >
                                                        <button
                                                            onClick={copyToClipboard}
                                                            className="btn py-0 text-primary"
                                                            title="Copy to clipboard"
                                                        >
                                                            <i className="bi bi-copy" />
                                                        </button>
                                                    </OverlayTrigger>
                                                </h6>
                                                <h6>Email: {user.email}</h6>
                                            </div>
                                            <a className="dropdown-item d-flex align-items-center" onClick={handleLogout} href={`${SERVER_URL}/logout`}>
                                                <i className="bi bi-box-arrow-right me-2"></i>
                                                Logout
                                            </a>
                                        </div>
                                    </div>
                                </li>

                                // <li className="nav-item">
                                //     <a className="nav-link" onClick={handleLogout} href={`${SERVER_URL}/logout`}>Logout</a>
                                // </li>
                                : <>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/login">Login</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link" href="/register">Sign up</a>
                                    </li>
                                </>
                    }
                </ul>

            </div>
        </div>
    </header>
}