import { useLocation, useNavigate } from "react-router-dom";
import HeaderNavbar from "../components/HeaderNavbar";

export default function HomePage() {
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
            navigate('/welcome')
        } else {
            // Not sure if this shld be procedure
            navigate('/welcome')
        }
    };

    const location = useLocation();
    const { username } = location.state || {};

    return <>
        <HeaderNavbar />
        <h1>Hi {username}</h1>
        <form onSubmit={handleLogout}>
            <button type="submit"> Log Out</button>
        </form>
    </>
}