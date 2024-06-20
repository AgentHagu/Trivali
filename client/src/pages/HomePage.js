import HeaderNavbar from "../components/HeaderNavbar";
import useUserData from "../hooks/useUserData";

/**
 * HomePage component to display the home page content.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 */
export default function HomePage() {
    const { user, loading } = useUserData();
    
    return <>
        <HeaderNavbar />
        <div className="container">
            {loading ? <h1>Loading...</h1> : user ? <h1>Hi {user.username}</h1> : <h1>No USER</h1>}
        </div>
    </>
}