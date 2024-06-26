import HeaderNavbar from "../components/HeaderNavbar"

/**
 * WelcomePage component to display the welcome page content.
 * 
 * @component
 * @returns {JSX.Element} The rendered component.
 */
export default function WelcomePage() {
    return <>
        <HeaderNavbar />
        <main role="main">
            <section className="p-5 rounded text-center">
                <div className="container">
                    <h1 className="jumbotron-heading">Welcome to <br /> Trivali</h1>
                    <p className="lead text-muted">The one-stop solution to your <br /> travel planning problems</p>
                    <img className="img-fluid" src="https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg"
                        alt="Trivali Logo" />
                </div>
            </section>
            
            <div className="py-5 bg-light">
                <div className="container">
                    <div className="row">
                        {/*Feature 1 Card*/}
                        <div className="col-md-4">
                            <div className="card h-100 mb-4 shadow-sm">
                                <div className="card-header">Trip Organizer and Planner</div>
                                <img className="card-img-top" src="https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg"
                                    alt="Feature" style={{ height: "225px", width: "100%", display: "block" }} />
                                <div className="card-body">
                                    <p className="card-text">
                                        Our web-app will provide tools such as itinerary
                                        creation and planning, accommodation bookings and
                                        transportation arrangements.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/*Feature 2 Card*/}
                        <div className="col-md-4">
                            <div className="card h-100 mb-4 shadow-sm">
                                <div className="card-header">Manage Travel Finances</div>
                                <img className="card-img-top" src="https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg"
                                    alt="Feature" style={{ height: "225px", width: "100%", display: "block" }} />
                                <div className="card-body">
                                    <p className="card-text">
                                        Allow users to input expenses and automatically
                                        calculate who owes whom money at the end of the
                                        trip.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/*Feature 3 Card*/}
                        <div className="col-md-4">
                            <div className="card h-100 mb-4 shadow-sm">
                                <div className="card-header">Collaboration Support</div>
                                <img className="card-img-top" src="https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg"
                                    alt="Feature" style={{ height: "225px", width: "100%", display: "block" }} />
                                <div className="card-body">
                                    <p className="card-text">
                                        Easily coordinate and plan trips together with family and friends on our platform.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </>
}