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
    const [isEmailValid, setIsEmailValid] = useState(true)
    const [isPasswordValid, setIsPasswordValid] = useState(true)

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
        setIsEmailValid(true)
        setIsPasswordValid(true)

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

                if (errorMessage === "Password incorrect") {
                    setIsPasswordValid(false)
                } else {
                    setIsEmailValid(false)
                    setIsPasswordValid(false)
                }
            });
        }
    };

    return (
        <>
            <HeaderNavbar />
            <body className="text-center">
                <div style={{ width: "100%", maxWidth: "330px", padding: "15px", margin: "auto" }}>
                    <form onSubmit={handleSubmit} className="mb-4" noValidate>
                        <h1 className="h3 mb-3 fw-normal">Sign in here</h1>

                        <div className="form-floating mb-2">
                            <input id="floatingEmail" className={`form-control ${isEmailValid ? "" : "is-invalid"}`} type="email" name="email" value={email} placeholder="Email" required onChange={handleChange} />
                            <label htmlFor="floatingEmail">Email address</label>
                        </div>

                        <div className="form-floating mb-2">
                            <input id="floatingPassword" className={`form-control ${isPasswordValid ? "" : "is-invalid"}`} type="password" name="password" value={password} placeholder="Password" required onChange={handleChange} />
                            <label htmlFor="floatingPassword">Password</label>
                        </div>

                        <div className="mb-3 text-danger">
                            {error}
                        </div>

                        <button className="w-100 btn btn-lg btn-primary" type="submit">Sign in</button>
                    </form>

                    <div className="text-center">
                        <p>Not a member? <a href="/register" className="text-decoration-none">Register</a></p>
                    </div>
                </div>
            </body>
        </>
    );
}