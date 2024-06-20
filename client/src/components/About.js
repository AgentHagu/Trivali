import useUserData from "../hooks/useUserData";

export default function About() {
    const user = useUserData()
    let content = "Loading..."

    if (user != null) {
        content = user.username
    }

    return <>
        <div className="container">
            <h1>About:</h1>
            <h2>{content}</h2>
        </div>
    </>
}