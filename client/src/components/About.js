import TextEditor from "./TextEditor";

/**
 * Component for displaying and editing trip details.
 * 
 * @param {string} projectId - The ID of the project associated with the trip details.
 * @param {Object} data - Data object containing trip details.
 * @param {Object} socket - Socket object for real-time communication.
 * @returns {JSX.Element} About component displaying trip information and editable text areas.
 */
export default function About({ projectId, data, socket, user }) {
    return <div className="container pb-3 px-3">
        <div className="row mb-2">
            <div className="col-8 pt-2 d-flex flex-column">
                <h3 className="fw-bold">Planning:</h3>
                <div className="border border-2 flex-grow-1">
                    <TextEditor page="about" number="0" placeholder="Plan your trip here, similar to Google Docs" projectId={projectId} user={user} />
                </div>
            </div>


            <div className="col pt-2 d-flex flex-column">
                <h3 className="fw-bold">Destination:</h3>
                <div className="border border-2 mb-2">
                    <TextEditor page="about" number="1" placeholder="Enter the destination(s) of your trip" projectId={projectId} user={user} />
                </div>

                <h3 className="fw-bold">Duration:</h3>
                <div className="border border-2 mb-2">
                    <TextEditor page="about" number="2" placeholder="Specify the duration of your trip" projectId={projectId} user={user} />
                </div>

                <h3 className="fw-bold">Budget:</h3>
                <div className="border border-2 mb">
                    <TextEditor page="about" number="3" placeholder="Outline your budget" projectId={projectId} user={user} />
                </div>
            </div>
        </div>

        <div className="row">
            <div className="col-6">
                <h3 className="fw-bold">Accomodation:</h3>
                <div className="border border-2 mb-2">
                    <TextEditor page="about" number="4" placeholder="Describe your accomodation plans" projectId={projectId} user={user} />
                </div>
            </div>

        </div>

    </div>
}