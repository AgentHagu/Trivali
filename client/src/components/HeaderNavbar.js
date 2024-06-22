import { useNavigate } from "react-router-dom";
import useUserData from "../hooks/useUserData"

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
            // Not sure if this shld be procedure
            navigate('/')
        }
    };

    return <header className="sticky-top mb-2">
        <div className="navbar navbar-expand-sm navbar-dark bg-dark">
            <div className="container d-flex justify-content-between">
                {/* TODO: clean up code here for the loading and user conditionals */}

                {
                    loading
                        ? <></>
                        : user
                            ? <>
                                <a className="navbar-brand d-flex align-items-center" href="/home">
                                    {/* add logo here */}
                                    <strong>Trivali</strong>
                                </a>
                            </>
                            : <>
                                <a className="navbar-brand d-flex align-items-center" href="/welcome">
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
                                ? <li className="nav-item">
                                    <a className="nav-link" onClick={handleLogout} href={`${SERVER_URL}/logout`}>Logout</a>
                                </li>
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