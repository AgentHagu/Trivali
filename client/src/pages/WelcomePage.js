// Page components
import HeaderNavbar from "../components/HeaderNavbar"

// Images
import TravelPlannerImage from '../Images/0002.jpg'; 
import CollaborativeImage from '../Images/0001.jpg'; 
import FinanceImage from '../Images/0000.jpg'; 
import Logo from "../Images/0003.png"

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
                    <img className="img-fluid mx-auto d-block" src={Logo}
                        alt="Trivali Logo" style={{ height: "300px", width: "300px", display: "block" }} />
                </div>
            </section>
            
            <div className="py-5 bg-light">
                <div className="container">
                    <div className="row">
                        {/*Feature 1 Card*/}
                        <div className="col-md-4">
                            <div className="card h-100 mb-4 shadow-sm">
                                <div className="card-header">Trip Organizer and Planner</div>
                                <img className="card-img-top" src={TravelPlannerImage}
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
                                <img className="card-img-top" src={FinanceImage}
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
                                <img className="card-img-top" src={CollaborativeImage}
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