import { useEffect, useState } from "react"

/**
 * SearchBar component for adding users to a project.
 * Handles user search, validation, and addition/removal.
 *
 * @param {Object} props - Component props.
 * @param {SocketIO.Socket} props.socket - Socket instance for real-time communication.
 * @param {Object} props.currUser - Current user object.
 * @param {Array} props.addedUsersList - List of users already added to the project.
 * @param {Function} props.setAddedUsersList - Function to update the addedUsersList state.
 * @returns {JSX.Element} - SearchBar component JSX.
 */
export default function SearchBar({ socket, currUser, addedUsersList, setAddedUsersList }) {
    const [userValidity, setUserValidity] = useState(true)
    const [invalidMessage, setInvalidMessage] = useState("")

    /**
     * Converts a full user object to a simplified user object for storage.
     * @param {Object} user - Full user object.
     * @returns {Object} Simplified user object containing _id, username, and email.
     */
    function userToSimpleUser(user) {
        const simpleUser = {
            _id: user._id,
            username: user.username,
            email: user.email
        }

        return simpleUser
    }

    /**
     * Handles the search form submission.
     * Emits a 'search-user' event to the server with the search query.
     * @param {Event} e - Form submit event.
     */
    function searchHandler(e) {
        e.preventDefault()
        const userSearch = e.target[0].value

        socket.emit("search-user", userSearch)
    }

    useEffect(() => {
        /**
         * Handles the 'found-user' event from the server.
         * Validates the found user and updates the addedUsersList state if valid.
         * @param {Object} user - Found user object or null if not found.
         */
        const handleUserFound = user => {
            if (user == null) {
                setUserValidity(false)
                setInvalidMessage("No such user found")
                return
            }

            if (user._id === currUser._id) {
                setUserValidity(false)
                setInvalidMessage("You have already been added")
                return
            }

            const isUserInArray = addedUsersList.some(addedUser =>
                addedUser._id === user._id
            )

            if (!isUserInArray) {
                setUserValidity(true)
                setInvalidMessage("")
                const newList = [...addedUsersList, user]
                setAddedUsersList(newList)
                socket.emit("add-user", userToSimpleUser(user))

            } else {
                setUserValidity(false)
                setInvalidMessage("User has already been added")
            }
        }

        socket.on("found-user", handleUserFound)

        return () => {
            socket.off("found-user", handleUserFound)
        }
    }, [socket, addedUsersList, currUser, setAddedUsersList])

    /**
     * Removes a user from the addedUsersList state and emits a 'remove-user' event to the server.
     * @param {Object} simpleUser - Simplified user object to be removed.
     */
    function removeUserHandler(simpleUser) {
        const newList = addedUsersList.filter(addedUser => addedUser._id !== simpleUser._id)
        setAddedUsersList(newList)
        socket.emit("remove-user", simpleUser)
    }

    return <>
        <form className="mb-3" onSubmit={searchHandler}>
            <label htmlFor="addUsers" className="form-label">Add Users to Project</label>
            <div className="input-group has-validation">
                <input
                    type="search"
                    className={`form-control me-2 
                        ${userValidity ? '' : 'is-invalid'}`}
                    id="addUsers"
                    placeholder="Search with ID or Email"
                />
                <button className="btn btn-outline-primary" type="submit">
                    <i className="bi bi-search" />
                </button>
                <div className="invalid-feedback">
                    {invalidMessage}
                </div>
            </div>
        </form>

        {addedUsersList.length > 0
            ? <>
                <label className="form-label">Added Users</label>
                <ul className="list-group">
                    {addedUsersList.map(user => (
                        <li className="list-group-item d-flex justify-content-between align-items-center" key={user._id}>
                            <span>
                                {user.username} (Email: {user.email})
                            </span>
                            {
                                user._id !== currUser._id
                                    ? <button
                                        className="btn ms-auto p-0"
                                        onClick={() => removeUserHandler(user)}
                                    >
                                        <i className="bi bi-person-fill-dash" />
                                    </button>
                                    : <>Owner</>
                            }
                        </li>
                    ))}
                </ul>
            </>
            : <>
                <label className="form-label">No added Users</label>
            </>
        }
    </>
}