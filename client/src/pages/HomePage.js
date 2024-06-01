import HeaderNavbar from "../components/HeaderNavbar";
import useUserData from "../hooks/useUserData";

export default function HomePage() {
    const user = useUserData();
    
    return <>
        <HeaderNavbar />
        <div className="container">
            {user ? <h1>Hi {user.username}</h1> : <h1>Loading...</h1>}
        </div>
    </>
}