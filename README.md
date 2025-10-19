Redact.js

A minimal, user-friendly web API framework for Node.js. Redact is built from the ground up to provide the essential tools for creating fast and scalable web applications, without the bloat.

It's a perfect project for learning the fundamentals of how Node.js frameworks like Express work under the hood.

Features

Clean Routing: Expressive and simple router for GET, POST, PUT, and DELETE requests.

Middleware Support: Use app.use() to add middleware for logging, authentication, and more.

Automatic JSON Parsing: Incoming JSON request bodies are automatically parsed and made available on req.body.

Response Helpers: Simple helpers like res.json() and res.status() to make sending responses a breeze.

Centralized Error Handling: A robust system to catch errors and prevent server crashes, sending clean responses to the client.

Installation

To install Redact from the npm registry, run the following command in your project directory:

npm install @noturbob/redact


Quick Start

Getting a server up and running is simple. Create an index.js file and add the following code:

// 1. Import the framework
const Redact = require('@noturbob/redact');

// 2. Initialize the app
const app = new Redact();
const PORT = 3000;

// 3. Define a route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to Redact.js!' });
});

// 4. Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});


Then, run your server from the terminal:

node index.js


You can now visit http://localhost:3000 in your browser!

API Guide

Routing

Define how your application responds to client requests.

// GET request
app.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Bobby' }]);
});

// POST request
app.post('/users', (req, res) => {
  const newUser = req.body;
  console.log('Creating user:', newUser);
  res.status(201).json({ message: 'User created!', user: newUser });
});


Middleware

Middleware functions run for every request, before your route handlers. They are perfect for logging, data validation, or authentication. Remember to call next() to pass control to the next handler.

// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Attaching data to the request
app.use((req, res, next) => {
  req.requestTime = Date.now();
  next();
});


Error Handling

Redact has a centralized error handler to prevent your server from crashing. Define an error-handling middleware by using four arguments. This must be defined after all other routes and middleware.

// A route that throws an error
app.get('/error', (req, res) => {
  throw new Error('Something went wrong!');
});

// The error handler
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error for the developer
  res.status(500).json({ error: 'Internal Server Error' });
});


License

This project is licensed under the MIT License.