// React and React Router imports
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

// Components
import HeaderNavbar from "../components/HeaderNavbar";

const SERVER_URL = process.env.REACT_APP_API_URL;

/**
 * RegisterPage component for user registration functionality.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 */
export default function RegisterPage() {
    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const navigate = useNavigate()

    // Validate user session on component mount
    useEffect(() => {
        async function validateUser() {
            const token = localStorage.getItem('token')
            if (token) {
                navigate('/home')
                return;
            }
        }

        validateUser()
    }, [navigate])

    // Handle input change
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

    // Handle form submission
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
            <div className="text-center">
                <div style={{ width: "100%", maxWidth: "330px", padding: "15px", margin: "auto" }}>
                    <form onSubmit={handleSubmit} className="mb-4">
                        <h1 className="h3 mb-3 fw-normal">Register</h1>

                        <div className="form-floating mb-2">
                            <input id="floatingUsername" className="form-control" type="text" name="username" placeholder="Username" required value={username} onChange={handleChange} />
                            <label htmlFor="floatingUsername">Username</label>
                        </div>

                        <div className="form-floating mb-2">
                            <input id="floatingEmail" className="form-control" type="email" name="email" placeholder="Email" required value={email} onChange={handleChange} />
                            <label htmlFor="floatingEmail">Email address</label>
                        </div>

                        <div className="form-floating mb-2">
                            <input id="floatingPassword" className="form-control" type="password" name="password" placeholder="Password" required value={password} onChange={handleChange} />
                            <label htmlFor="floatingPassword">Password</label>
                        </div>

                        <div className="mb-3 text-danger">
                            {error}
                        </div>

                        <button className="w-100 btn btn-lg btn-primary" type="submit">Sign up</button>
                    </form>

                    <div className="text-center">
                        <p>Have an account? <a href="/login" className="text-decoration-none">Login</a></p>
                    </div>
                </div>
            </div>
        </>
    );
}