const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors'); // Import the cors middleware
const path = require('path');
const app = express();
const PORT = 3000;

// Replace this with a secure method of storing and checking passwords
const VALID_PASSWORD = 'hotdog';

app.use(bodyParser.json());
app.use(cors()); // Enable CORS for all routes
app.use(express.static('public')); // Serve static files from the 'public' directory

app.post('/validate-password', (req, res) => {
    const { password } = req.body;
    if (password === VALID_PASSWORD) {
        res.json({ success: true });
    } else {
        res.json({ success: false });
    }
});

// Serve the confidential page
app.get('/confidential', (req, res) => {
    res.sendFile(path.join(__dirname, 'confidential.html'));
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});