````markdown
# 🚀 Redact.js

[![npm version](https://img.shields.io/npm/v/@noturbob/redact.svg)](https://www.npmjs.com/package/@noturbob/redact)
[![NPM Downloads](https://img.shields.io/npm/dm/@noturbob/redact.svg)](https://www.npmjs.com/package/@noturbob/redact)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](https://github.com/noturbob/Redact)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A minimal, user-friendly web API framework for Node.js. Redact is built from the ground up to provide the essential tools for creating fast and scalable web applications, without the bloat.

It's a perfect project for learning the fundamentals of how Node.js frameworks like Express work under the hood.

---

## 📋 Table of Contents

- [Features](#-features)
- [Installation](#-installation)
- [Quick Start](#-quick-start)
- [API Guide](#-api-guide)
  - [Routing](#routing)
  - [Middleware](#middleware)
  - [Error Handling](#error-handling)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

-   **⚡️ Clean Routing:** Expressive and simple router for `GET`, `POST`, `PUT`, and `DELETE` requests.
-   **📦 Middleware Support:** Use `app.use()` to add chainable middleware for logging, authentication, and more.
-   **✨ Automatic JSON Parsing:** Incoming JSON request bodies are automatically parsed and made available on `req.body`.
-   **📝 Response Helpers:** Simple helpers like `res.json()` and `res.status()` to make sending responses a breeze.
-   **🛡️ Centralized Error Handling:** A robust system to catch errors and prevent server crashes, sending clean responses to the client.

---

## 💾 Installation

To install Redact from the npm registry, run the following command in your project directory:

```bash
npm install @noturbob/redact
````

-----

## 🏁 Quick Start

Getting a server up and running is simple. Create an `index.js` file and add the following code:

```javascript
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
```

Then, run your server from the terminal:

```bash
node index.js
```

You can now visit `http://localhost:3000` in your browser\!

-----

## 📖 API Guide

### Routing

> Define how your application responds to client requests for a specific endpoint.

```javascript
// GET request to fetch all users
app.get('/users', (req, res) => {
  res.json([{ id: 1, name: 'Bobby' }]);
});

// POST request to create a new user
app.post('/users', (req, res) => {
  const newUser = req.body; // Thanks to automatic body parsing!
  console.log('Creating user:', newUser);
  res.status(201).json({ message: 'User created!', user: newUser });
});
```

### Middleware

> Middleware functions are functions that have access to the request (`req`) and response (`res`) objects, and the `next` function in the application’s request-response cycle. They are perfect for tasks that need to run for every request. **Remember to call `next()`** to pass control to the next handler.

```javascript
// Simple request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Middleware to attach data to the request object
app.use((req, res, next) => {
  req.requestTime = Date.now();
  next();
});
```

### Error Handling

> Redact has a centralized error handler to prevent your server from crashing. Define an error-handling middleware by using four arguments `(err, req, res, next)`. This special middleware **must be defined after all other routes and `app.use()` calls.**

```javascript
// A route designed to throw an error
app.get('/error', (req, res) => {
  throw new Error('This is a simulated server error!');
});

// The error-handling middleware that catches the error
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the full error for the developer
  res.status(500).json({ error: 'Internal Server Error' });
});
```

-----

## 🤝 Contributing

Contributions, issues, and feature requests are welcome\! Feel free to check the [issues page](https://github.com/noturbob/Redact/issues).

-----

## 📜 License

This project is licensed under the MIT License.

```
```
