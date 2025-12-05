/**
 * @file The core of the Redact web framework (v2.2 - Real-Time).
 * Adds WebSocket Support, alongside HTTP, Middleware, and Routing.
 * @version 2.2.1
 * @author Bobby Anthene
 */

const http = require('http');
let WebSocket;
let WebSocketServer;

// Try to load 'ws'. If user hasn't installed it, we gracefully skip socket features.
try {
  const wsModule = require('ws');
  WebSocket = wsModule.WebSocket;
  WebSocketServer = wsModule.Server;
} catch (e) {
  // 'ws' not installed. Socket features will be disabled.
}

/**
 * The Redact Factory function.
 * Initializes a new application instance with HTTP and WebSocket capabilities.
 * @returns {Object} The public API (use, routes, socket, listen).
 */
function Redact() {
  
  // --- HTTP Route Storage ---
  const staticRoutes = { GET: {}, POST: {}, PUT: {}, DELETE: {} };
  const dynamicRoutes = { GET: [], POST: [], PUT: [], DELETE: [] };
  const middlewares = [];
  
  // Security: Max body size (1MB) to prevent DoS attacks
  const MAX_BODY_SIZE = 1e6; 

  // --- WebSocket Route Storage ---
  const socketRoutes = {};
  let wss = null; 

  /**
   * INTERNAL: Helper to send HTTP responses based on return type.
   */
  const send = (res, content, status = 200) => {
    if (res.headersSent) return; 
    res.statusCode = status;
    
    const type = typeof content === 'object' ? 'application/json' : 'text/plain';
    const payload = typeof content === 'object' ? JSON.stringify(content) : String(content);
    
    res.setHeader('Content-Type', type);
    res.end(payload);
  };

  /**
   * INTERNAL: Convert path with params (e.g. /users/:id) to Regex.
   */
  const pathToRegex = (path) => {
    const regexPattern = "^" + path.replace(/:\w+/g, '([^/]+)') + "$";
    return new RegExp(regexPattern);
  };

  /**
   * INTERNAL: Extract param names from path.
   */
  const getParamNames = (path) => {
    const matches = path.match(/:\w+/g);
    return matches ? matches.map(m => m.slice(1)) : [];
  };

  /**
   * The Internal HTTP Server Handler.
   * Runs for every request to manage Middleware, Body Parsing, and Routing.
   */
  const server = http.createServer(async (req, res) => {
    
    // 1. URL & Query Parsing
    const baseURL = 'http://' + req.headers.host + '/';
    const parsedURL = new URL(req.url, baseURL);
    const pathname = parsedURL.pathname;
    req.query = Object.fromEntries(parsedURL.searchParams);

    // 2. Middleware Runner
    // "Just Return" style: If middleware returns a value, we send it and STOP the request.
    for (const mw of middlewares) {
      try {
        const result = await mw(req);
        if (result !== undefined) {
          return send(res, result);
        }
      } catch (err) {
        console.error("Middleware Error:", err);
        return send(res, { error: "Internal Middleware Error" }, 500);
      }
    }

    // 3. Route Handler Logic
    const executeHandler = () => {
      const method = req.method;
      
      // A. Check Static Routes (Fast O(1) lookup)
      let handler = staticRoutes[method]?.[pathname];
      req.params = {}; 

      // B. If no static match, Check Dynamic Routes (Regex search)
      if (!handler) {
        const dynamicMatches = dynamicRoutes[method] || [];
        for (const route of dynamicMatches) {
          const match = pathname.match(route.regex);
          if (match) {
            handler = route.handler;
            route.paramNames.forEach((name, index) => {
              req.params[name] = match[index + 1];
            });
            break;
          }
        }
      }

      // C. Execute Handler if found
      if (handler) {
        try {
          const input = req.body || {};
          
          // If handler is just a static value, return it
          if (typeof handler !== 'function') {
            return send(res, handler);
          }

          // Execute function (supports async)
          const result = handler(input, req);
          
          if (result instanceof Promise) {
            result.then(data => send(res, data)).catch(err => {
              console.error(err);
              send(res, { error: "Internal Server Error" }, 500);
            });
          } else {
            send(res, result);
          }
        } catch (error) {
          console.error(error);
          send(res, { error: "Internal Server Error", details: error.message }, 500);
        }
      } else {
        send(res, { error: "Not Found" }, 404);
      }
    };

    // 4. Body Parsing (with Security Limit)
    if (['POST', 'PUT'].includes(req.method)) {
      let body = '';
      let received = 0;
      
      req.on('data', chunk => {
        received += chunk.length;
        if (received > MAX_BODY_SIZE) {
          res.destroy(); // Security: Kill connection if too big
          return;
        }
        body += chunk;
      });

      req.on('end', () => {
        try {
          req.body = body ? JSON.parse(body) : {};
        } catch (e) {
          req.body = {};
        }
        executeHandler();
      });
    } else {
      executeHandler();
    }
  });

  // --- 5. WebSocket Upgrade Logic ---
  if (WebSocketServer) {
    wss = new WebSocketServer({ noServer: true });

    server.on('upgrade', (request, socket, head) => {
      const pathname = new URL(request.url, 'http://' + request.headers.host).pathname;
      const routeDef = socketRoutes[pathname];

      if (routeDef) {
        wss.handleUpgrade(request, socket, head, (ws) => {
          // Trigger 'open' handler
          if (routeDef.open) routeDef.open(ws);

          // Listen for messages (Auto-JSON Parse)
          ws.on('message', (message) => {
            if (routeDef.message) {
              let data = message.toString();
              try { data = JSON.parse(data); } catch(e) {}
              routeDef.message(ws, data, wss.clients);
            }
          });

          // Trigger 'close' handler
          ws.on('close', () => {
            if (routeDef.close) routeDef.close(ws);
          });
        });
      } else {
        socket.destroy();
      }
    });
  }

  // --- Public API ---

  const use = (fn) => middlewares.push(fn);

  const registerRoutes = (...args) => {
    args.forEach(routeDef => {
      const path = routeDef.path;
      if (!path) return;

      ['GET', 'POST', 'PUT', 'DELETE'].forEach(method => {
        if (routeDef[method]) {
          if (path.includes(':')) {
            dynamicRoutes[method].push({
              regex: pathToRegex(path),
              paramNames: getParamNames(path),
              handler: routeDef[method]
            });
          } else {
            staticRoutes[method][path] = routeDef[method];
          }
        }
      });
    });
  };

  const registerSocket = (def) => {
    if (!WebSocketServer) {
      console.error("Redact Error: You must 'npm install ws' to use app.socket()");
      return;
    }
    socketRoutes[def.path] = def;
  };

  return {
    use,
    routes: registerRoutes,
    socket: registerSocket,
    listen: (port, callback) => {
      server.listen(port, callback);
    }
  };
}

module.exports = Redact;