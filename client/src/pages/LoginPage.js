import { useEffect, useState } from "react";
import HeaderNavbar from "../components/HeaderNavbar";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        async function fetchUser() {
            const response = await fetch('http://localhost:3001/login', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })

            if (response.ok) {
                console.log("Allowed to login")
            } else {
                navigate('/home')
            }
        }

        fetchUser()
    }, [])

    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name === 'email') {
        setEmail(value)
        } else if (name === 'password') {
        setPassword(value)
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        const response = await fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({email, password})
        })

        console.log(response)
        if (response.ok) {
            navigate('/home')
            console.log("Logged in successfully")
        } else {
            console.log("Login failed")
        }
    };

    return (
        <>
            <HeaderNavbar />
            <form onSubmit={handleSubmit}>
            <input type="text" name="email" value={email} placeholder="Email" onChange={handleChange} /> <br/>
            <input type="password" name="password" value={password} placeholder="Password" onChange={handleChange} />
            <button type="submit">Login</button>
            </form>
        </>
    );
}