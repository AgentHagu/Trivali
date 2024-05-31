import HeaderNavbar from "../components/HeaderNavbar"

// TODO: Credit Bootstrap for the Album page example
// TODO: Credit Bootstrap and other packages (i think)

export default function WelcomePage() {
    return <>
        <HeaderNavbar />
        <main role="main">
            <section class="p-5 rounded text-center">
                <div class="container">
                    <h1 class="jumbotron-heading">Welcome to <br /> Trivali</h1>
                    <p class="lead text-muted">The one-stop solution to your <br /> travel planning problems</p>
                    <img class="img-fluid" src="https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg"
                        alt="Trivali Logo" />
                </div>
            </section>
            <div class="py-5 bg-light">
                <div class="container">
                    <div class="row">
                        {/*Feature 1 Card*/}
                        <div class="col-md-4">
                            <div class="card h-100 mb-4 shadow-sm">
                                <div class="card-header">Trip Organizer and Planner</div>
                                <img class="card-img-top" src="https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg"
                                    alt="Feature" style={{ height: "225px", width: "100%", display: "block" }} />
                                <div class="card-body">
                                    <p class="card-text">
                                        Our web-app will provide tools such as itinerary
                                        creation and planning, accommodation bookings and
                                        transportation arrangements.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/*Feature 2 Card*/}
                        <div class="col-md-4">
                            <div class="card h-100 mb-4 shadow-sm">
                                <div class="card-header">Manage Travel Finances</div>
                                <img class="card-img-top" src="https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg"
                                    alt="Feature" style={{ height: "225px", width: "100%", display: "block" }} />
                                <div class="card-body">
                                    <p class="card-text">
                                        Allow users to input expenses and automatically
                                        calculate who owes whom money at the end of the
                                        trip.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/*Feature 3 Card*/}
                        <div class="col-md-4">
                            <div class="card h-100 mb-4 shadow-sm">
                                <div class="card-header">Collaboration Support</div>
                                <img class="card-img-top" src="https://t3.ftcdn.net/jpg/02/48/42/64/360_F_248426448_NVKLywWqArG2ADUxDq6QprtIzsF82dMF.jpg"
                                    alt="Feature" style={{ height: "225px", width: "100%", display: "block" }} />
                                <div class="card-body">
                                    <p class="card-text">
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