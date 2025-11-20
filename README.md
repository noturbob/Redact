🚀 Redact.js

A minimal, user-friendly web API framework for Node.js. Redact v2.1 introduces a powerful "Just Return" syntax, eliminating boilerplate code like res.json() or next().

📋 Table of Contents

Features

Installation

Quick Start

API Guide

Routing

Dynamic Routes

Middleware

Contributing

License

✨ Features

⚡️ Declarative Routing: Define your API structure in clean, readable object blocks.

🪄 "Just Return" Logic: Return an object, array, or string, and Redact sends the response automatically.

🔀 Dynamic Routing: Support for parameters like /users/:id.

🛡️ Built-in Security: Automatic 1MB body size limit to prevent DoS attacks.

🔍 Query Parsing: Automatic parsing of URL query strings (?search=foo).

💾 Installation

npm install @noturbob/redact


🏁 Quick Start

const app = require('@noturbob/redact')();

app.routes({
  path: "/",
  GET: "Welcome to Redact!"
});

app.listen(3000);


📖 API Guide

Routing

Define routes using object blocks. The key is the method, the value is the handler.

app.routes(
  {
    path: "/users",
    GET: () => [{ name: "Bobby" }],
    POST: (body) => {
      return { message: "Created", user: body };
    }
  }
);


Dynamic Routes

You can use : to define dynamic parameters in the URL. Access them via req.params.

// Matches /users/123
{
  path: "/users/:id",
  GET: (body, req) => {
    return { userId: req.params.id };
  }
}


Middleware

Middleware runs before every request. Use it for logging or security.

Continue: Return undefined (or nothing).

Stop/Error: Return an object or string. The request will stop immediately and send that value as the response.

app.use((req) => {
  console.log(`Request to ${req.url}`);
  
  if (!req.headers.authorization) {
    return { error: "Unauthorized" }; // Sends 200 OK with this JSON
  }
  // Implicit "next()" if nothing returned
});


🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

📜 License

This project is licensed under the MIT License.