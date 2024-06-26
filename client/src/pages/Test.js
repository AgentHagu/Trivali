export default function Test() {
    const submitHandler = (e) => {
        const projectName = e.target[0].value

        e.preventDefault()
        console.log(projectName)
    }

    return <>
        <button type="button" className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#createProjectModal">
            Create Project
        </button >

        <div className="modal fade" id="createProjectModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
            <div className="modal-dialog modal-dialog-centered">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Create a new Project</h5>
                        <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <div className="modal-body">
                        <form id="createProjectForm" onSubmit={submitHandler}>
                            <div className="mb-3">
                                <label htmlFor="projectName" className="form-label">Project Name</label>
                                <input type="text" className="form-control" id="projectName" />
                            </div>

                            <div className="mb-3">
                                <label htmlFor="addUsers" className="form-label">Add Users</label>
                                <input type="search" className="form-control" id="addUsers" />
                            </div>
                        </form>
                        
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>

                        {/* TODO: data-bs-dismiss is a bit weird, check how to actually dismiss after submit */}
                        <input type="submit" form="createProjectForm" value="Create" className="btn btn-primary" data-bs-dismiss="modal" />
                    </div>
                </div>
            </div>
        </div>
    </>
}