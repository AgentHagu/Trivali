import { useEffect, useState } from "react";
import HeaderNavbar from "../components/HeaderNavbar";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchUser() {
            const response = await fetch('http://localhost:3001/register', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })

            if (response.ok) {
                console.log("Allowed to register")
            } else {
                navigate('/home')
            }
        }

        fetchUser()
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

        const response = await fetch('http://localhost:3001/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ username, email, password })
        })

        if (response.ok) {
            console.log("Register Success")
            navigate('/login')
        } else {
            console.log("Register failed")
            navigate('/register')
        }
    };

    return (
        <>
            <HeaderNavbar />
            <form onSubmit={handleSubmit}>
                <input type="text" name="username" placeholder="Username" value={username} onChange={handleChange} /> <br />
                <input type="text" name="email" placeholder="Email" value={email} onChange={handleChange} /> <br />
                <input type="password" name="password" placeholder="Password" value={password} onChange={handleChange} />
                <button type="submit">Register</button>
            </form>
        </>
    );
}