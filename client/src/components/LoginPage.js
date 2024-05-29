export default function LoginPage() {
    return <div>
        <form>
            <input placeholder="Username" type="text" required /> <br />
            <input placeholder="Password" type="password" required />
            <button type="submit">Login</button>
        </form>
    </div>
}