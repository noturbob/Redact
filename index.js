/**
 * @file Example server using the Production-Ready Redact v2.1.
 * @author Bobby-Anthene
 */

const app = require('./lib/redact.js')();
const PORT = 3000;

// --- 1. Middleware Example ---
// This runs before every request.
// If we return nothing, the request continues.
// If we return an object, the request STOPS and sends that object.
app.use((req) => {
  console.log(`[Log] ${req.method} request to ${req.url}`);
  
  // Security example: Block requests to /admin
  if (req.url.includes('/admin')) {
    return { error: "Unauthorized Access" }; // Stops request immediately
  }
});

// --- 2. Routes ---
app.routes(

  // Standard Static Route
  {
    path: "/",
    GET: "Welcome to Redact v2.1!"
  },

  // Dynamic Route (New Feature!)
  // Matches /users/123, /users/bobby, etc.
  // We access params via `req.params` (2nd argument)
  {
    path: "/users/:id",
    GET: (input, req) => {
      return {
        message: "User Found",
        userId: req.params.id, // Extracted from URL
        details: "This is a dynamic route response"
      };
    }
  },

  // Query Params Example (New Feature!)
  // Try visiting /search?q=javascript
  {
    path: "/search",
    GET: (input, req) => {
      return {
        results: `Searching for: ${req.query.q}`,
        filters: req.query
      };
    }
  },

  // POST with Body Limit (New Feature!)
  // If you send >1MB of data, the server will automatically cut connection.
  {
    path: "/create",
    POST: (body) => {
      return { status: "Created", data: body };
    }
  }
);

app.listen(PORT, () => {
  console.log(`Redact v2.1 running on http://localhost:${PORT}`);
});