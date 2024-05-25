const express = require('express');
const app = express();

// Define a route handler for GET requests to the root URL
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Define other route handlers as needed

// Start the server
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
