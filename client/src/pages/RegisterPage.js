import { useState } from "react";
import HeaderNavbar from "../components/HeaderNavbar";

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')

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

    const handleSubmit = (event) => {
        event.preventDefault();

        fetch('http://localhost:3001/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({username, email, password})
        })
        .then(response => {
            return response.json()
        })
        .then(data => {
            console.log(data); // Handle response from server
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    return (
        <>
            <HeaderNavbar />
            <form onSubmit={handleSubmit}>
            <input type="text" name="username" value={username} onChange={handleChange} />
            <input type="text" name="email" value={email} onChange={handleChange} />
            <input type="password" name="password" value={password} onChange={handleChange} />
            <button type="submit">Register</button>
            </form>
        </>
    );
}