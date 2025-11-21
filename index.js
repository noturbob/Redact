/**
 * @file Redact v2.2.0 Dev Server
 * Use this file to test your framework changes locally.
 */

// Import from local library
const app = require('./lib/redact.js')();
const PORT = 3000;

// --- 1. Middleware (Runs before every request) ---
app.use((req) => {
  const time = new Date().toISOString().split('T')[1].split('.')[0];
  console.log(`[${time}] ${req.method} ${req.url}`);
  
  // Security Example: Block 'admin' paths
  if (req.url.includes('/admin')) {
    return { error: "Unauthorized Access" }; // Stops request immediately
  }
});

// --- 2. HTTP Routes (REST API) ---
app.routes(

  // Static Route
  {
    path: "/",
    GET: "Welcome to Redact v2.2! The Real-Time Framework."
  },

  // Dynamic Route Example
  {
    path: "/users/:id",
    GET: (input, req) => {
      return {
        status: "found",
        userId: req.params.id,
        details: "Fetched via Dynamic Routing"
      };
    }
  },

  // Query Params Example (/search?q=test)
  {
    path: "/search",
    GET: (input, req) => {
      return {
        query: req.query.q || "empty",
        filters: req.query
      };
    }
  },

  // POST Route (Auto Body Parsing)
  {
    path: "/create",
    POST: (body) => {
      return { status: "Created", received: body };
    }
  }
);

// --- 3. WebSocket Routes (Real-Time Chat) ---
// Note: Ensure you have run 'npm install ws' in this folder
app.socket({
  path: '/chat',
  
  // On Connection
  open: (ws) => {
    console.log("⚡ Socket Connected");
    ws.send(JSON.stringify({ user: 'System', text: 'Welcome to Redact Sockets!' }));
  },

  // On Message
  message: (ws, data, clients) => {
    console.log("📩 Received:", data);

    // Broadcast to everyone else
    clients.forEach(client => {
      if (client !== ws && client.readyState === 1) {
        client.send(JSON.stringify({
          user: data.user,
          text: data.text,
          id: Date.now()
        }));
      }
    });
  },

  // On Disconnect
  close: () => {
    console.log("❌ Socket Disconnected");
  }
});

// --- 4. Start Server ---
app.listen(PORT, () => {
  console.log(`🚀 Redact Dev Server running on http://localhost:${PORT}`);
});