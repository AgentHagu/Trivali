import { useEffect, useState } from "react";
import HeaderNavbar from "../components/HeaderNavbar";
import { useNavigate } from "react-router-dom";

const SERVER_URL = process.env.REACT_APP_API_URL;

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        async function validateUser() {
            const response = await fetch(`${SERVER_URL}/register`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })

            if (response.ok) {
                //console.log("Allowed to register")
            } else {
                navigate('/home')
            }
        }

        validateUser()
    }, [navigate])

    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name === 'email') {
            setEmail(value);
        } else if (name === 'password') {
            setPassword(value);
        } else if (name === 'username') {
            setUsername(value)
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const response = await fetch(`${SERVER_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, email, password })
        })

        if (response.ok) {
            navigate('/login')
        } else {
            response.text().then(errorMessage => {
                setError(errorMessage)
            });
        }
    };

    return (
        <>
            <HeaderNavbar />
            <form onSubmit={handleSubmit}>
                <input type="text" name="username" placeholder="Username" required value={username} onChange={handleChange} /> <br />
                <input type="email" name="email" placeholder="Email" required value={email} onChange={handleChange} /> <br />
                <input type="password" name="password" placeholder="Password" required value={password} onChange={handleChange} />
                <button type="submit">Register</button>
            </form>
            <p>{error}</p>
        </>
    );
}