import TextEditor from "./TextEditor"

function testScript() {
    console.log("hello");
}

export default function ProjectAbout() {
    return <>
        {/* <div class="container my-3">
            <div class="row g-0 border border-black border-1">
                <div class="col-1 border border-black border-1">
                    <h2>Day</h2>
                </div>
                <div class="col-2 border border-black border-1">
                    <h2>Time</h2>
                </div>
                <div class="col border border-black border-1">
                    <h2>Itinerary</h2>
                </div>
            </div>
            <TableRow rowNum="0" />
            <TableRow rowNum="1" />
        </div> */}
        <table className="table table-bordered m-0">
            <thead className="table-dark">
                <tr>
                    <th scope="col" className="col-1">Day</th>
                    <th scope="col" className="col-2">Time</th>
                    <th scope="col">Activity</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">1</th>
                    <td>1000-1200</td>
                    <td className="p-0"><TextEditor page="test" number="1"/></td>
                </tr>
                <tr>
                    <th scope="row">2</th>
                    <td>1300-1600</td>
                    <td className="p-0"><TextEditor page="test" number="1"/></td>
                </tr>
                <tr>
                    <th scope="row">3</th>
                    <td>0900-1100</td>
                    <td className="p-0" onContextMenu={testScript}><TextEditor page="test" number="1"/></td>
                </tr>
            </tbody>
        </table>
    </>
}

function TableRow({ rowNum }) {
    return <div class="row g-0">
        <div class="col-1">
            <TextEditor page="itinerary" number={`${rowNum}+"-0"`} />
        </div>
        <div class="col-2">
            <TextEditor page="itinerary" number={`${rowNum}+"-1"`} />
        </div>
        <div class="col">
            <TextEditor page="itinerary" number={`${rowNum}+"-2"`} />
        </div>
    </div>
}