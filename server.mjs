// Load environment variables
import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';
import express from 'express';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import authRoutes from './routes/authRoutes.mjs';
import adminRoutes from './routes/adminRoutes.mjs';
import campaignRoutes from './routes/campaignRoutes.mjs';
import User from './models/User.mjs';
import cors from 'cors';

if (!process.env.DATABASE_URL || !process.env.SESSION_SECRET) {
  console.error("Error: config environment variables not set. Please create/edit .env configuration file.");
  process.exit(-1);
}

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());

// Middleware to parse request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Setting the templating engine to EJS
app.set("view engine", "ejs");

// Serve static files
app.use(express.static("public"));

// Database connection
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => {
    console.log("Database connected successfully");
  })
  .catch((err) => {
    console.error(`Database connection error: ${err.message}`, err.stack);
    process.exit(1);
  });

// Session configuration with connect-mongo
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.DATABASE_URL }),
  }),
);

app.on("error", (error) => {
  console.error(`Server error: ${error.message}`, error.stack);
});

// Logging session creation and destruction
app.use((req, res, next) => {
  const sess = req.session;
  // Make session available to all views
  res.locals.session = sess;
  if (!sess.views) {
    sess.views = 1;
    console.log("Session created at: ", new Date().toISOString());
  } else {
    sess.views++;
    console.log(
      `Session accessed again at: ${new Date().toISOString()}, Views: ${sess.views}, User ID: ${sess.userId || '(unauthenticated)'}`,
    );
  }
  next();
});

// Authentication Routes
app.use(authRoutes);

// Admin Routes
app.use(adminRoutes);

// Campaign Routes
app.use(campaignRoutes);

// Root path response
app.get("/", (req, res) => {
  res.render("index");
});

app.get("/campaigns", async (req, res) => {
  if (!req.session || !req.session.userId) {
    console.log("Access attempt to /campaigns by unauthenticated user.");
    return res.redirect('/auth/login');
  }
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      console.log("User not found for session.userId:", req.session.userId);
      return res.status(404).send("User not found.");
    }
    const campaigns = user.campaignIds.map(id => ({ id, name: `Campaign ${id}` })); // Mock campaign names for demo purposes
    console.log(`Rendering campaigns for user: ${req.session.userId}`);
    res.render("campaigns", { campaigns });
  } catch (error) {
    console.error(`Error fetching user campaigns: ${error.message}`, error.stack);
    res.status(500).send("Internal server error while fetching user campaigns.");
  }
});

// If no routes handled the request, it's a 404
app.use((req, res, next) => {
  res.status(404).send("Page not found.");
});

// Error handling
app.use((err, req, res, next) => {
  console.error(`Unhandled application error: ${err.message}`, err.stack);
  res.status(500).send("There was an error serving your request.");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});