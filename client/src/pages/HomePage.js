import { useLocation, useNavigate } from "react-router-dom";
import HeaderNavbar from "../components/HeaderNavbar";

export default function HomePage() {
    const navigate = useNavigate()

    const handleLogout = (event) => {
        event.preventDefault();

        fetch('http://localhost:3001/logout', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            },
        })
        .then(response => {
            return response.json()})
        .then(data => {
            console.log(data); // Handle response from server

            if (data.success) {
                navigate('/welcome')
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    const location = useLocation();
    const { username } = location.state || {};

    return <>
        <HeaderNavbar />
        <h1>Hi {username}</h1>
        {/* <form action="/logout?_method=DELETE" method="POST"> */}
        <form onSubmit={handleLogout}>
            <button type="submit"> Log Out</button>
        </form>
    </>
}