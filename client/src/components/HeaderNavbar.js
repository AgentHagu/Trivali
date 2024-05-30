export default function HeaderNavbar() {
    return <header class="header">
        <nav class="navbar navbar-expand-sm bg-dark navbar-dark fixed-top">
            <div class="container-fluid">
                <a class="navbar-brand" href="/home">Trivali</a>
                <ul class="navbar-nav">
                    <li class="nav-item">
                        <a class="nav-link" href="/login">Login</a>
                    </li>
                    <li class="nav-item">
                        <a class="nav-link" href="/register">Sign up</a>
                    </li>
                </ul>
            </div>
        </nav>
        <div class="navbar-spacer"></div>
    </header> 
}