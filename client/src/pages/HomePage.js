import HeaderNavbar from "../components/HeaderNavbar";
import useUserData from "../hooks/useUserData";

/**
 * HomePage component to display the home page content.
 *
 * @component
 * @returns {JSX.Element} The rendered component.
 */
export default function HomePage() {
    const user = useUserData();
    
    return <>
        <HeaderNavbar />
        <div className="container">
            {user ? <h1>Hi {user.username}</h1> : <h1>Loading...</h1>}
        </div>
    </>
}