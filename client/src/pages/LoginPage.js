import { useState } from "react";
import HeaderNavbar from "../components/HeaderNavbar";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const navigate = useNavigate()

    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name === 'email') {
        setEmail(value)
        } else if (name === 'password') {
        setPassword(value)
        }
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        fetch('http://localhost:3001/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({email, password})
        })
        .then(response => {
            console.log(response)
            return response.json()})
        .then(data => {
            console.log(data); // Handle response from server

            if (data.success) {
                //const username = data.user.name
                navigate('/home', { state: { username: "Test" }})
            } else {
                setEmail('')
                setPassword('')
                alert("Login Failed")
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
            <input type="text" name="email" value={email} placeholder="Email" onChange={handleChange} /> <br/>
            <input type="password" name="password" value={password} placeholder="Password" onChange={handleChange} />
            <button type="submit">Login</button>
            </form>
        </>
    );

    // return (
    //     <>
            
    //         <form onSubmit={handleSubmit}>
    //         <input type="text" name="username" value={email} onChange={handleChange}/>
    //         <input type="password" name="password" value={password} onChange={handleChange}/>
    //         <button type="submit">Login</button>
    //         </form>
    //         <a href="/register">Register</a>
    //     </>
    // );
}