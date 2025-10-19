/**
 * @file An example server demonstrating how to use the Redact framework.
 * This file showcases routing, middleware, body parsing, and error handling.
 * @author Bobby-Anthene
 * @version 1.1.0
 */

// 1. Import the framework
const Redact = require('./lib/redact.js');

// 2. Initialize the application and define the port
const app = new Redact();
const PORT = 3000;

// --- Middleware ---

/**
 * A simple logger middleware.
 * This runs for every incoming request to log its method and URL to the console.
 * It's useful for debugging and monitoring server traffic.
 */
app.use((req, res, next) => {
  console.log(`Request Received: ${req.method} ${req.url}`);
  next(); // Pass control to the next middleware in the chain
});

/**
 * A middleware that attaches a custom property to the request object.
 * This demonstrates how middleware can enrich the request object with data
 * that can be used later in the route handlers.
 */
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});


// --- Routes ---

/**
 * Route for the homepage (GET /).
 * Responds with a simple welcome message, including the timestamp
 * added by the middleware.
 */
app.get('/', (req, res) => {
  res.send(`Welcome! Your request was received at ${req.requestTime}`);
});

/**
 * Route to create a new user (POST /users).
 * Expects a JSON body with a 'name' property and demonstrates
 * using the built-in body parser.
 */
app.post('/users', (req, res) => {
  const { name } = req.body;

  // Validate the incoming data.
  if (!name) {
    // Use the .status() and .json() helpers to send a clear error response.
    return res.status(400).json({ error: `The 'name' property is required.` });
  }

  // In a real application, you would save the user to a database here.
  const newUser = { id: Date.now(), name };

  console.log('User created:', newUser);

  // Send a 201 (Created) status and the new user object back to the client.
  res.status(201).json({
    message: 'User created successfully',
    user: newUser,
  });
});

/**
 * A route designed to test the error handling system (GET /error).
 * Accessing this route will intentionally throw an error, which should be
 * caught by the error-handling middleware defined below.
 */
app.get('/error', (req, res) => {
  throw new Error('This is a simulated server error!');
});


// --- Error Handling Middleware ---

/**
 * A "catch-all" error handler.
 * This special middleware will only run when an error is thrown or passed to `next(err)`.
 * It is identified by its unique four-argument signature: (err, req, res, next).
 *
 * NOTE: It is crucial to define this AFTER all other routes and middleware.
 */
app.use((err, req, res, next) => {
  // Log the full error stack to the console for the developer.
  console.error('An error occurred:', err.stack);

  // Send a generic, user-friendly 500 response to the client.
  // Avoid sending sensitive stack trace information in a production environment.
  res.status(500).json({
    error: 'Internal Server Error',
    message: err.message, // Optionally include the error message
  });
});


// 3. Start the server
app.listen(PORT, () => {
  console.log(`Redact server running on http://localhost:${PORT}`);
});