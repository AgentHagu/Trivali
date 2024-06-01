export default function HeaderNavbar() {
    return <header className="sticky-top">
        <div className="navbar navbar-expand-sm navbar-dark bg-dark">
            <div className="container d-flex justify-content-between">
                <a className="navbar-brand d-flex align-items-center" href="/welcome">
                    {/* add logo here */}
                    <strong>Trivali</strong>
                </a>
                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" href="/login">Login</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="/register">Sign up</a>
                    </li>
                </ul>
            </div>
        </div>
    </header>
}