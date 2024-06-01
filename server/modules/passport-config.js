const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

/**
 * Initializes the passport authentication strategy.
 *
 * @param {Object} passport - The passport instance.
 * @param {function(string): Promise<Object|null>} getUserByEmail - A function to get a user by their email.
 * @param {function(string): Promise<Object|null>} getUserById - A function to get a user by their ID.
 */
function initialize(passport, getUserByEmail, getUserById) {
    /**
     * Authenticates a user.
     *
     * @param {string} email - The email of the user.
     * @param {string} password - The password of the user.
     * @param {function(Error|null, Object|boolean, Object=): void} done - The callback function.
     */
    const authenticateUser = async (email, password, done) => {
        const user = await getUserByEmail(email);
        if (!user) {
            return done(null, false, { message: 'No user with that email' });
        }

        try {
            if (await bcrypt.compare(password, user.password)) {
                return done(null, user);
            } else {
                return done(null, false, { message: 'Password incorrect' });
            }
        } catch (e) {
            return done(e);
            
        }
    };

    passport.use(new LocalStrategy({ usernameField: 'email' }, authenticateUser));
    
    /**
     * Serializes a user into a session.
     *
     * @param {Object} user - The user object.
     * @param {function(Error|null, string): void} done - The callback function.
     */
    passport.serializeUser((user, done) => {
        process.nextTick(() => {
            return done(null, user.id)
        })
    })

    /**
     * Deserializes a user from a session.
     *
     * @param {string} id - The ID of the user.
     * @param {function(Error|null, Object|boolean): void} done - The callback function.
     */
    passport.deserializeUser((id, done) => {
        const user = getUserById(id);
        process.nextTick(() => done(null, user))
    });
}

module.exports = initialize;