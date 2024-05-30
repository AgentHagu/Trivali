export default function HeaderNavbar() {
    return <header class="sticky-top">
        <div class="navbar navbar-expand-sm navbar-dark bg-dark">
            <div class="container d-flex justify-content-between">
                <a class="navbar-brand d-flex align-items-center" href="/home">
                    {/* add logo here */}
                    <strong>Trivali</strong>
                </a>
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="/login">Login</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/register">Sign up</a>
                    </li>
                </ul>
            </div>
        </div>
    </header>
}