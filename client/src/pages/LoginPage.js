// React and React Router imports
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Components
import HeaderNavbar from "../components/HeaderNavbar";

const SERVER_URL = process.env.REACT_APP_API_URL;

/**
 * LoginPage component for user login functionality.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 */
export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    // Validate user session on component mount
    useEffect(() => {
        async function validateUser() {
            const response = await fetch(`${SERVER_URL}/login`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include'
            })

            if (response.ok) {
                //console.log("Allowed to login")
            } else {
                navigate('/home')
            }
        }

        validateUser()
    }, [])

    // Handle input change
    const handleChange = (event) => {
        const { name, value } = event.target;
        if (name === 'email') {
            setEmail(value)
        } else if (name === 'password') {
            setPassword(value)
        }
    };

    // Handle form submission
    const handleSubmit = async (event) => {
        event.preventDefault();

        const response = await fetch(`${SERVER_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
            body: JSON.stringify({ email, password })
        })

        if (response.ok) {
            navigate('/home')
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
                <input type="email" name="email" value={email} placeholder="Email" required onChange={handleChange} /> <br />
                <input type="password" name="password" value={password} placeholder="Password" required onChange={handleChange} />
                <button type="submit">Login</button>
            </form>
            <p>{error}</p>
        </>
    );
}