import { useNavigate } from "react-router-dom";
import useUserData from "../hooks/useUserData"

export default function HeaderNavbar() {
    const user = useUserData();
    const navigate = useNavigate()

    const handleLogout = async (event) => {
        event.preventDefault();

        const response = await fetch('http://localhost:3001/logout', {
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
                        user// === null ? <></> : user


                            ? <li className="nav-item">
                                {/* <form onSubmit={handleLogout}>
                                    <button type="submit"> Log Out</button>
                                </form> */}
                                <a className="nav-link" onClick={handleLogout} href="http://localhost:3001/logout">Logout</a>
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