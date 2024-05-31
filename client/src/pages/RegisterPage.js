import { useState } from "react";
import HeaderNavbar from "../components/HeaderNavbar";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

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
            console.log(data)
            
            if (data.success) {
                navigate('/login')
            } else {
                setUsername('')
                setEmail('')
                setPassword('')

                alert("Registration failed")
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    };

    return (
        <>
            <HeaderNavbar />
            <form onSubmit={handleSubmit}>
            <input type="text" name="username" placeholder="Username" value={username} onChange={handleChange} /> <br/>
            <input type="text" name="email" placeholder="Email" value={email} onChange={handleChange} /> <br/>
            <input type="password" name="password" placeholder="Password" value={password} onChange={handleChange} />
            <button type="submit">Register</button>
            </form>
        </>
    );
}