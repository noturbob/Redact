<div align="center">

🛡️ Redact.js

The Declarative, "Just Return" Framework for Node.js.

Features • Quick Start • Documentation • Philosophy

</div>

📖 Overview

Redact.js is a modern micro-framework designed to eliminate boilerplate. It abandons the traditional, imperative style of Express (res.send, res.json, next()) in favor of a clean, declarative syntax.

With Redact, your API is defined as a structured object, and your logic is simple: You receive data, and you return data. The framework handles the rest.

✨ Features

Feature

Description

⚡ Declarative Routing

Define your entire API structure in a single, readable object tree.

↩️ "Just Return" Logic

Forget res.json(). Just return an object, array, or string.

🔀 Dynamic Routing

Native support for parameters like /users/:id.

🛡️ Built-in Security

Automatic 1MB body size limit to prevent DoS attacks.

🔌 Smart Middleware

Filter requests or inject data before they reach your logic.

🔎 Query Parsing

Automatic parsing of URL query strings (?search=foo).

💾 Installation

npm install @noturbob/redact


🚀 Quick Start

Initialize the app and define your first route in under 10 lines of code.

const app = require('@noturbob/redact')();

app.routes({
  path: "/",
  GET: "Welcome to the Redact API!"
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});


🧠 Philosophy

1. Declarative vs. Imperative

Most frameworks force you to call functions to register routes one by one. Redact lets you describe your API structure.

The Old Way:

app.get('/users', (req, res) => res.send('users'));
app.post('/users', (req, res) => res.send('created'));


The Redact Way:

app.routes({
  path: "/users",
  GET: "users",
  POST: "created"
});


2. The Return Pattern

Redact functions are pure. You don't manage the HTTP response manually.

Return an Object/Array? → Redact sends 200 OK with Content-Type: application/json.

Return a String? → Redact sends 200 OK with Content-Type: text/plain.

Throw an Error? → Redact catches it and sends 500 Internal Server Error.

📚 Documentation

1. Routing

Routes are defined by passing objects to app.routes(). Each object represents a path and the methods it supports.

Static Routes

app.routes({
  path: "/status",
  GET: { status: "healthy", uptime: process.uptime() }
});


Dynamic Routes

Use : to denote a parameter. Access it via req.params.

app.routes({
  path: "/users/:id",
  GET: (body, req) => {
    return { 
      message: "User Found", 
      userId: req.params.id 
    };
  }
});


2. Handling Input (body vs req)

Route handlers receive two arguments:

Argument

Type

Description

1. input

Object

The parsed JSON body (for POST/PUT) or an empty object.

2. req

Object

The full request context, including params, query, and headers.

Example: Creating a Resource

app.routes({
  path: "/products",
  POST: (body) => {
    // 'body' is the JSON data sent by the user
    if (!body.price) return { error: "Price required" };
    
    return { success: true, item: body };
  }
});


3. Middleware

Middleware runs before every request. It follows the same "Just Return" logic.

Return undefined (or nothing): The request continues to the next step.

Return a value: The request stops immediately, and that value is sent to the client.

// Example: Authentication Middleware
app.use((req) => {
  console.log(`Incoming ${req.method} to ${req.url}`);

  // Block access to admin routes
  if (req.url.includes("/admin")) {
    return { error: "Unauthorized: Admin access only." };
  }
  
  // If we return nothing here, the request proceeds to the route handler.
});


4. Query Parameters

Query strings are automatically parsed into req.query.

URL: GET /search?q=javascript&sort=desc

app.routes({
  path: "/search",
  GET: (body, req) => {
    return {
      searchTerm: req.query.q,      // "javascript"
      sortOrder: req.query.sort     // "desc"
    };
  }
});


🤝 Contributing

We welcome contributions! Please fork the repository and submit a Pull Request.

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

📄 License

Distributed under the MIT License. See LICENSE for more information.

<div align="center">
<sub>Built with ❤️ by NotUrBob</sub>
</div>