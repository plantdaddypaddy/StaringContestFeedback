const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse form data
app.use(bodyParser.urlencoded({ extended: false }));

// Set EJS as the view engine
app.set('view engine', 'ejs');

// Serve static files from the "public" directory
app.use(express.static('public'));

// Path to the images folder
const imagesFolder = path.join(__dirname, 'public', 'images');

// Load or initialize submissions data from a JSON file
const submissionsFile = path.join(__dirname, 'submissions.json');
let submissionsData = {};

if (fs.existsSync(submissionsFile)) {
    const rawData = fs.readFileSync(submissionsFile);
    submissionsData = JSON.parse(rawData);
} else {
    submissionsData = {};
}

function saveSubmissions() {
    fs.writeFileSync(submissionsFile, JSON.stringify(submissionsData, null, 2));
}

// 1. Route: Show random image
app.get('/', (req, res) => {
    fs.readdir(imagesFolder, (err, files) => {
        if (err) {
            return res.send('Error reading image directory.');
        }

        const imageFiles = files.filter(file => file.match(/\.(jpg|jpeg|png|gif)$/i));

        if (imageFiles.length === 0) {
            return res.send('No images found.');
        }

        // Pick a random image
        const randomIndex = Math.floor(Math.random() * imageFiles.length);
        const randomImage = imageFiles[randomIndex];

        // Render the index page with the random image
        res.render('index', {
            image: randomImage
        });
    });
});

// 2. Route: Handle submission
app.post('/submit', (req, res) => {
    const { imageName, feedback } = req.body;

    if (!submissionsData[imageName]) {
        submissionsData[imageName] = [];
    }

    submissionsData[imageName].push({
        feedback: feedback,
        timestamp: new Date().toISOString()
    });

    saveSubmissions();

    // Send a simple thank-you or redirect
    res.send(`
    <h2>Thanks for the feedback.</h2>
    <h2>Check back tomorrow for another image.</h2>
    <p><a href="/">See another random image</a></p>
  `);
});

// 3. Route: Admin view to see submissions
//    (In a real app, you'd protect this with a password)
app.get('/admin', (req, res) => {
    res.render('admin', { submissions: submissionsData });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
