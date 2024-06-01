import { useNavigate } from "react-router-dom";
import useUserData from "../hooks/useUserData"

const SERVER_URL = process.env.REACT_APP_API_URL;

export default function HeaderNavbar() {
    const user = useUserData();
    const navigate = useNavigate()

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

    return <header className="sticky-top">
        <div className="navbar navbar-expand-sm navbar-dark bg-dark">
            <div className="container d-flex justify-content-between">
                <a className="navbar-brand d-flex align-items-center" href="/welcome">
                    {/* add logo here */}
                    <strong>Trivali</strong>
                </a>
                <ul className="navbar-nav">
                    {
                        user
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