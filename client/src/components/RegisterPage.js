export default function RegisterPage() {
    return <div>
        <form>
            <input placeholder="Username" type="text" required /> <br />
            <input placeholder="Password" type="password" required /> <br />
            <input placeholder="Confirm Password" type="password" required />
            <button type="submit">Register</button>
        </form>
    </div>
}