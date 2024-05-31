import { useState } from "react";
import HeaderNavbar from "../components/HeaderNavbar";

export default function LoginPage() {
    // return <>
    //     <HeaderNavbar />
    //     {/* <form>
    //         <input placeholder="Username" type="text" required /> <br />
    //         <input placeholder="Password" type="password" required />
    //         <button type="submit">Login</button>
    //     </form> */}

    //     <form action="/login" method="POST">    

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name === 'email') {
        setEmail(value);
        } else if (name === 'password') {
        setPassword(value);
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
        .then(response => response.json())
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
            <input type="text" name="email" value={email} onChange={handleChange} />
            <input type="password" name="password" value={password} onChange={handleChange} />
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