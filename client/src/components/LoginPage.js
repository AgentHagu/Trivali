import HeaderNavbar from "./HeaderNavbar";

export default function LoginPage() {
    return <>
        <HeaderNavbar />
        <form>
            <input placeholder="Username" type="text" required /> <br />
            <input placeholder="Password" type="password" required />
            <button type="submit">Login</button>
        </form>
    </>
}