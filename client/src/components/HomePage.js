import { Link } from "react-router-dom"
import HeaderNavbar from "./HeaderNavbar"

export default function HomePage() {
    return <>
    <HeaderNavbar />
    <body class="body pt-5">
        <h1>HELLO??</h1>
        <h1>Welcome to Trivali</h1>
        <h2>The one-stop solution to your travel planning problems</h2>
        <Link to="/login">
            <button>Login</button>
        </Link>

        <Link to="/register">
            <button>Register</button>
        </Link>
    </body>
    </>
}