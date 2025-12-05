<div align="center">

# 🛡️ Redact.js

### The Declarative, "Just Return" Framework for Modern Node.js

[![npm version](https://img.shields.io/npm/v/@noturbob/redact?style=flat-square&color=blue)](https://www.npmjs.com/package/@noturbob/redact)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen?style=flat-square&logo=node.js)](https://nodejs.org/)

[Why Redact?](#-why-redact-vs-express) • [Features](#-key-features) • [Installation](#-installation) • [Documentation](#-documentation) • [Contributing](#-contributing)

---

</div>

## 📖 Introduction

**Redact.js** is a next-generation micro-framework for Node.js built on a simple premise: **Web servers should be simple function calls, not complex state managers.**

It abandons the traditional, imperative style of Express (`req, res, next`) in favor of a **clean, declarative syntax**. With Redact, you define your API as a structured object, and your logic is pure: **You receive input, and you return output.** The framework handles the HTTP complexity for you.

---

## 🆚 Why Redact? (vs Express)

Most Node.js frameworks are **Imperative**: you have to tell the server *how* to send a response step-by-step. Redact is **Declarative**: you tell the server *what* the response is.

<table>
<thead>
<tr>
<th>Feature</th>
<th>🐢 Express.js (The Old Way)</th>
<th>🚀 Redact.js (The New Way)</th>
</tr>
</thead>
<tbody>
<tr>
<td><strong>Routing</strong></td>
<td>Scattered <code>app.get</code>, <code>app.post</code> calls. Hard to visualize structure.</td>
<td><strong>Single Object Tree.</strong> See your entire API hierarchy at a glance.</td>
</tr>
<tr>
<td><strong>Response</strong></td>
<td>Manual <code>res.status(200).json({...})</code>.</td>
<td>Just <code>return {...}</code>. The framework automates status & headers.</td>
</tr>
<tr>
<td><strong>Async Logic</strong></td>
<td>Easy to forget <code>.catch(next)</code>. Crashes server on unhandled errors.</td>
<td><strong>Native Async/Await.</strong> Thrown errors are automatically caught and handled safely.</td>
</tr>
<tr>
<td><strong>Real-Time</strong></td>
<td>Requires external libraries (socket.io) and complex setup.</td>
<td><strong>Built-in WebSockets.</strong> Handles HTTP and WS on the same port effortlessly.</td>
</tr>
<tr>
<td><strong>Boilerplate</strong></td>
<td>High. Middleware for everything (body-parser, cors, etc).</td>
<td><strong>Zero.</strong> Automatic JSON parsing, query parsing, and security limits included.</td>
</tr>
</tbody>
</table>

---

## ✨ Key Features

<table>
<tr>
<td width="50%">

### ⚡ Declarative Routing
Define your API structure in a readable, nested object syntax.

### ↩️ "Just Return" Logic
Return an Object/Array for JSON, or a String for text. No `res` object needed.

### 🔌 Built-in WebSockets
Real-time support out of the box with `app.socket()`.

</td>
<td width="50%">

### 🔀 Dynamic Routing
Native support for parameters like `/users/:id`.

### 🛡️ Automatic Security
Built-in protection against DoS attacks (1MB body limit).

### ⚙️ Smart Middleware
Filter requests globally before they hit your logic.

</td>
</tr>
</table>

<div align="center">

### 📦 Zero Config • 🚄 Lightning Fast • 🎯 Type-Friendly

</div>

---

## 💾 Installation

```bash
npm install @noturbob/redact ws
```

> **Note:** `ws` is required for WebSocket features

---

## 🚀 Quick Start

```javascript
const app = require('@noturbob/redact')();

// Define your API
app.routes({
  path: "/",
  GET: "Welcome to Redact!", // Returns text
  POST: (body) => {
    // Returns JSON automatically
    return { status: "created", data: body };
  }
});

app.listen(3000, () => {
  console.log("🚀 Server running at http://localhost:3000");
});
```

---

## 📚 Documentation

### 1️⃣ Declarative Routing

Instead of writing imperative code, **describe your API**.

```javascript
app.routes({
  path: "/api/v1/status",
  GET: { status: "online", uptime: process.uptime() }
});
```

### 2️⃣ Handling Input (`input` vs `req`)

Your route handlers receive two arguments:

- **`input`**: The parsed data (JSON body for POST/PUT, or empty object).
- **`req`**: The full request context (headers, params, query).

```javascript
app.routes({
  path: "/products",
  POST: (body, req) => {
    // 'body' is the JSON payload sent by the user
    console.log("User Agent:", req.headers['user-agent']);
    
    return { success: true, product: body };
  }
});
```

### 3️⃣ Dynamic Routes

Use `:` to define dynamic parameters. Access them via `req.params`.

```javascript
app.routes({
  path: "/users/:id",
  GET: (input, req) => {
    // GET /users/500 -> { userId: "500" }
    return { userId: req.params.id };
  }
});
```

### 4️⃣ Real-Time WebSockets

Redact creates a **unified server** for both HTTP and WebSockets.

```javascript
app.socket({
  path: '/chat',
  
  open: (ws) => {
    console.log("✅ Client connected");
    ws.send("Welcome!");
  },

  message: (ws, data, clients) => {
    // 'data' is auto-parsed JSON
    // 'clients' is a Set of all connected users (for broadcasting)
    clients.forEach(client => client.send(JSON.stringify(data)));
  },

  close: () => {
    console.log("❌ Client disconnected");
  }
});
```

### 5️⃣ Middleware

Middleware runs **before every request**. It follows the "Just Return" philosophy:

- **Return `undefined`**: Request proceeds to the route handler.
- **Return a value**: Request stops, and that value is sent as the response.

```javascript
app.use((req) => {
  // Log every request
  console.log(`[${req.method}] ${req.url}`);

  // Security Check
  if (req.url.includes("/admin")) {
    // Stop the request immediately with a 403-like error
    return { error: "Unauthorized Access" };
  }
});
```

### 6️⃣ Query Parameters

Query strings are **automatically parsed** into `req.query`.

**Request:** `GET /search?q=javascript&sort=desc`

```javascript
app.routes({
  path: "/search",
  GET: (input, req) => {
    return {
      results: [],
      meta: {
        query: req.query.q,    // "javascript"
        sort: req.query.sort   // "desc"
      }
    };
  }
});
```

---

## 🎯 Example: Complete REST API

```javascript
const app = require('@noturbob/redact')();

let users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
];

app.routes({
  path: "/api/users",
  
  // Get all users
  GET: () => users,
  
  // Create new user
  POST: (body) => {
    const newUser = { id: users.length + 1, ...body };
    users.push(newUser);
    return newUser;
  }
});

app.routes({
  path: "/api/users/:id",
  
  // Get specific user
  GET: (input, req) => {
    const user = users.find(u => u.id === parseInt(req.params.id));
    return user || { error: "User not found" };
  },
  
  // Update user
  PUT: (body, req) => {
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    if (index === -1) return { error: "User not found" };
    users[index] = { ...users[index], ...body };
    return users[index];
  },
  
  // Delete user
  DELETE: (input, req) => {
    const index = users.findIndex(u => u.id === parseInt(req.params.id));
    if (index === -1) return { error: "User not found" };
    users.splice(index, 1);
    return { success: true };
  }
});

app.listen(3000);
```

---

## 🤝 Contributing

We welcome contributions! Please fork the repository and submit a Pull Request.

1. 🍴 Fork the Project
2. 🌿 Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. 💾 Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. 🚀 Push to the Branch (`git push origin feature/AmazingFeature`)
5. 🎉 Open a Pull Request

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

## 🌟 Show Your Support

If you find Redact.js helpful, please consider giving it a ⭐ on GitHub!

---

<div align="center">

### Built with ❤️ by [noturbob](https://github.com/noturbob)

**[⬆ back to top](#️-redactjs)**

</div>