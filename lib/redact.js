/**
 * @file The core of the Redact web framework (v2.1 - Production Ready).
 * Adds Middleware, Dynamic Routing, Query Params, and Body Limits.
 * @version 2.1.1
 */

const http = require('http');

/**
 * The Redact Factory function.
 * @returns {Object} The public API (use, routes, listen).
 */
function Redact() {
  
  // Storage for static routes (Exact match)
  const staticRoutes = { GET: {}, POST: {}, PUT: {}, DELETE: {} };
  
  // Storage for dynamic routes (Regex match like /users/:id)
  const dynamicRoutes = { GET: [], POST: [], PUT: [], DELETE: [] };
  
  // Storage for middleware functions
  const middlewares = [];

  // Security: Max body size (1MB)
  const MAX_BODY_SIZE = 1e6; 

  /**
   * INTERNAL: Helper to send responses
   */
  const send = (res, content, status = 200) => {
    if (res.headersSent) return; // Safety check
    res.statusCode = status;
    
    if (typeof content === 'object') {
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(content));
    } else {
      res.setHeader('Content-Type', 'text/plain');
      res.end(String(content));
    }
  };

  /**
   * INTERNAL: Convert path with params (e.g. /users/:id) to Regex
   */
  const pathToRegex = (path) => {
    // Replace :param with a regex capture group
    const regexPattern = "^" + path.replace(/:\w+/g, '([^/]+)') + "$";
    return new RegExp(regexPattern);
  };

  /**
   * INTERNAL: Extract param names from path
   */
  const getParamNames = (path) => {
    const matches = path.match(/:\w+/g);
    return matches ? matches.map(m => m.slice(1)) : [];
  };

  /**
   * The internal HTTP server handler.
   */
  const server = http.createServer(async (req, res) => {
    
    // 1. URL Parsing (Fixes Query Param issue)
    // "http://host/path?query" -> path: "/path", query: "..."
    const baseURL = 'http://' + req.headers.host + '/';
    const parsedURL = new URL(req.url, baseURL);
    const pathname = parsedURL.pathname;
    
    // Attach query params to req object for user convenience
    req.query = Object.fromEntries(parsedURL.searchParams);

    // 2. Run Middleware
    // "Just Return" style: If middleware returns something, we send it and STOP.
    for (const mw of middlewares) {
      try {
        const result = await mw(req);
        if (result !== undefined) {
          return send(res, result); // Stop chain, send response
        }
      } catch (err) {
        console.error("Middleware Error:", err);
        return send(res, { error: "Middleware Error" }, 500);
      }
    }

    // 3. Route Handler Logic
    const executeHandler = () => {
      const method = req.method;
      
      // A. Check Static Routes (O(1) fast lookup)
      let handler = staticRoutes[method]?.[pathname];
      req.params = {}; // Default empty params

      // B. If no static match, Check Dynamic Routes (O(n) regex search)
      if (!handler) {
        const dynamicMatches = dynamicRoutes[method] || [];
        for (const route of dynamicMatches) {
          const match = pathname.match(route.regex);
          if (match) {
            handler = route.handler;
            // Extract param values
            route.paramNames.forEach((name, index) => {
              req.params[name] = match[index + 1];
            });
            break;
          }
        }
      }

      // C. Execute if found
      if (handler) {
        try {
          // Pass body, params, and query to the handler for easy access
          const input = req.body || {};
          
          // If handler is a value, return it
          if (typeof handler !== 'function') {
            return send(res, handler);
          }

          // Execute function (supports async)
          // We pass req as second arg just in case they need headers/params/query explicitly
          const result = handler(input, req);
          
          // If the result is a promise, wait for it
          if (result instanceof Promise) {
            result.then(data => send(res, data)).catch(err => {
              console.error(err);
              send(res, { error: "Internal Error" }, 500);
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
          // Security: Kill connection if too big
          res.destroy(); 
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

  // --- Public API ---

  /**
   * Registers middleware.
   * @param {Function} fn - Function(req) that runs before routes.
   */
  const use = (fn) => {
    middlewares.push(fn);
  };

  /**
   * Registers routes using the Declarative Object Syntax.
   */
  const registerRoutes = (...args) => {
    args.forEach(routeDef => {
      const path = routeDef.path;
      if (!path) return;

      ['GET', 'POST', 'PUT', 'DELETE'].forEach(method => {
        if (routeDef[method]) {
          // Check if route is dynamic (has :)
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

  return {
    use,
    routes: registerRoutes,
    listen: (port, callback) => {
      server.listen(port, callback);
    }
  };
}

module.exports = Redact;