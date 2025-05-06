

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

// Set EJS as the template engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Connect to MongoDB using environment variable
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.error('Failed to connect to MongoDB', err);
});

// Define User schema and model
const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// Define Quote schema and model
const quoteSchema = new mongoose.Schema({
    text: { type: String, required: true }
});
const Quote = mongoose.model('Quote', quoteSchema);

// Define Challenge schema and model
const challengeSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    duration: { type: Number, required: true },
    levelClass: { type: String, required: true },
    popular: { type: Boolean, default: false },
    features: [{ type: String }]
});
const Challenge = mongoose.model('Challenge', challengeSchema);

// Define Reward schema and model
const rewardSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true }
});
const Reward = mongoose.model('Reward', rewardSchema);

// Define HomepageContent schema and model
const homepageContentSchema = new mongoose.Schema({
    key: { type: String, required: true, unique: true },
    value: { type: mongoose.Schema.Types.Mixed }
});
const HomepageContent = mongoose.model('HomepageContent', homepageContentSchema);

const session = require('express-session');

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session middleware
app.use(session({
    secret: 'your-secret-key', // Replace with a strong secret in production
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // Set to true if using HTTPS
}));

// Authentication middleware for admin routes
function adminAuth(req, res, next) {
    if (req.session && req.session.isAdmin) {
        next();
    } else {
        res.redirect('/adminlogin.html');
    }
}

// Homepage route rendering dynamic content (to be implemented)
app.get('/', async (req, res) => {
    // Placeholder: fetch homepage content from DB
    res.render('index', { challenges: [], quotes: [], rewards: [] });
});

// Admin login route
app.post('/admin-login', (req, res) => {
    const { username, Password } = req.body;

    if (username === 'admin' && Password === 'admin123') {
        // Set session or flag for admin authentication
        req.session = req.session || {};
        req.session.isAdmin = true;
        res.redirect('/admin-dashboard');
    } else {
        res.send(`<h2>Invalid admin credentials. <a href="/adminlogin.html">Try again</a></h2>`);
    }
});

// Admin dashboard route (protected)
app.get('/admin-dashboard', adminAuth, async (req, res) => {
    try {
        const users = await User.find({});
        const quotes = await Quote.find({});
        const challenges = await Challenge.find({});
        const rewards = await Reward.find({});
        const homepageContent = await HomepageContent.find({});
        res.render('admin-dashboard', { users, quotes, challenges, rewards, homepageContent });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

// CRUD routes for Quotes
app.post('/admin/quotes/add', adminAuth, async (req, res) => {
    try {
        const newQuote = new Quote({ text: req.body.text });
        await newQuote.save();
        res.redirect('/admin-dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

app.post('/admin/quotes/edit/:id', adminAuth, async (req, res) => {
    try {
        await Quote.findByIdAndUpdate(req.params.id, { text: req.body.text });
        res.redirect('/admin-dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

app.post('/admin/quotes/delete/:id', adminAuth, async (req, res) => {
    try {
        await Quote.findByIdAndDelete(req.params.id);
        res.redirect('/admin-dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

// CRUD routes for Challenges
app.post('/admin/challenges/add', adminAuth, async (req, res) => {
    try {
        const featuresArray = req.body.features.split(',').map(f => f.trim());
        const newChallenge = new Challenge({
            title: req.body.title,
            description: req.body.description,
            duration: parseInt(req.body.duration),
            levelClass: req.body.levelClass,
            popular: req.body.popular.toLowerCase() === 'true',
            features: featuresArray
        });
        await newChallenge.save();
        res.redirect('/admin-dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

app.post('/admin/challenges/edit/:id', adminAuth, async (req, res) => {
    try {
        const featuresArray = req.body.features.split(',').map(f => f.trim());
        await Challenge.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            description: req.body.description,
            duration: parseInt(req.body.duration),
            levelClass: req.body.levelClass,
            popular: req.body.popular.toLowerCase() === 'true',
            features: featuresArray
        });
        res.redirect('/admin-dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

app.post('/admin/challenges/delete/:id', adminAuth, async (req, res) => {
    try {
        await Challenge.findByIdAndDelete(req.params.id);
        res.redirect('/admin-dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

// CRUD routes for Rewards
app.post('/admin/rewards/add', adminAuth, async (req, res) => {
    try {
        const newReward = new Reward({
            title: req.body.title,
            description: req.body.description
        });
        await newReward.save();
        res.redirect('/admin-dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

app.post('/admin/rewards/edit/:id', adminAuth, async (req, res) => {
    try {
        await Reward.findByIdAndUpdate(req.params.id, {
            title: req.body.title,
            description: req.body.description
        });
        res.redirect('/admin-dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

app.post('/admin/rewards/delete/:id', adminAuth, async (req, res) => {
    try {
        await Reward.findByIdAndDelete(req.params.id);
        res.redirect('/admin-dashboard');
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

// User login route
app.post('/login', async (req, res) => {
    const { username, Password } = req.body;

    try {
        const user = await User.findOne({ username: username });
        if (user && user.password === Password) {
            res.sendFile(path.join(__dirname, 'views', 'success.html'));
        } else {
            res.send(`<script>alert('Username or password is invalid'); window.location.href = '/loginpage.html';</script>`);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

// User registration route
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    try {
        const existingUser = await User.findOne({ username: username });
        if (existingUser) {
            res.send(`<script>alert('Username already exists'); window.location.href = '/register.html';</script>`);
        } else {
            const newUser = new User({ username: username, password: password });
            await newUser.save();
            res.send(`<script>alert('Registration successful! Please login.'); window.location.href = '/loginpage.html';</script>`);
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal server error');
    }
});

// Start server
const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
