import { Link } from "react-router-dom"

export default function HomePage() {
    return <div>
        <h1>Welcome to Trivali</h1>
        <h2>The one-stop solution to your travel planning problems</h2>
        <Link to="/login">
            <button>Login</button>
        </Link>

        <Link to="/register">
            <button>Register</button>
        </Link>
    </div>
}