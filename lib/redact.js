/**
 * @file The core of the Redact web framework.
 * @author Bobby-Anthene
 * @version 1.0.0
 */

const http = require('http');

/**
 * The main class for the Redact application.
 * It encapsulates the server, routing, and middleware logic.
 */
class Redact {
  /**
   * Initializes a new Redact application instance.
   */
  constructor() {
    /** @private */
    this.routes = { 'GET': {}, 'POST': {}, 'PUT': {}, 'DELETE': {} };
    /** @private */
    this.middleware = [];

    this.server = http.createServer((req, res) => {
      this.enhanceResponse(res);
      this.handleRequest(req, res);
    });
  }

  // --- Core Methods ---

  /**
   * Enhances the native Node.js response object with helper methods.
   * @private
   * @param {http.ServerResponse} res - The response object.
   */
  enhanceResponse(res) {
    res.statusCode = 200; // Default status code

    /**
     * Sets the HTTP status code for the response.
     * @param {number} code - The HTTP status code (e.g., 200, 404).
     * @returns {http.ServerResponse} The response object for chaining.
     */
    res.status = (code) => {
      res.statusCode = code;
      return res;
    };

    /**
     * Sends a JSON response.
     * @param {object} data - The JavaScript object to be sent as JSON.
     */
    res.json = (data) => {
      res.writeHead(res.statusCode, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));
    };
    
    /**
     * Sends a plain text response.
     * @param {string} data - The text to be sent.
     */
    res.send = (data) => {
      res.writeHead(res.statusCode, { 'Content-Type': 'text/plain' });
      res.end(data);
    };
  }

  /**
   * The main handler for all incoming HTTP requests.
   * It orchestrates the middleware, body parser, and router chain.
   * @private
   * @param {http.IncomingMessage} req - The request object.
   * @param {http.ServerResponse} res - The enhanced response object.
   */
  handleRequest(req, res) {
    const runRouter = () => {
      const handler = this.routes[req.method]?.[req.url];
      if (handler) {
        handler(req, res);
      } else {
        res.status(404).json({ error: 'Route Not Found' });
      }
    };

    const runBodyParser = (callback) => {
      if (req.method === 'POST' || req.method === 'PUT') {
        let body = [];
        req.on('data', chunk => body.push(chunk));
        req.on('end', () => {
          body = Buffer.concat(body).toString();
          try {
            req.body = body ? JSON.parse(body) : {};
            callback();
          } catch (error) {
            res.status(400).json({ error: 'Bad Request: Invalid JSON' });
          }
        });
      } else {
        callback();
      }
    };

    // Middleware runner
    let index = 0;
    const next = () => {
      if (index < this.middleware.length) {
        this.middleware[index++](req, res, next);
      } else {
        runBodyParser(runRouter);
      }
    };

    next(); // Start the middleware chain
  }

  // --- Public API ---

  /**
   * Registers a middleware function to be executed for every request.
   * @param {Function} fn - The middleware function (req, res, next) => {}.
   */
  use(fn) {
    this.middleware.push(fn);
  }

  /**
   * Registers a handler for GET requests to a specific path.
   * @param {string} path - The URL path (e.g., '/users').
   * @param {Function} handler - The handler function (req, res) => {}.
   */
  get(path, handler) { this.routes['GET'][path] = handler; }

  /**
   * Registers a handler for POST requests to a specific path.
   * @param {string} path - The URL path (e.g., '/users').
   * @param {Function} handler - The handler function (req, res) => {}.
   */
  post(path, handler) { this.routes['POST'][path] = handler; }

  /**
   * Registers a handler for PUT requests to a specific path.
   * @param {string} path - The URL path (e.g., '/users/1').
   * @param {Function} handler - The handler function (req, res) => {}.
   */
  put(path, handler) { this.routes['PUT'][path] = handler; }

  /**
   * Registers a handler for DELETE requests to a specific path.
   * @param {string} path - The URL path (e.g., '/users/1').
   * @param {Function} handler - The handler function (req, res) => {}.
   */
  delete(path, handler) { this.routes['DELETE'][path] = handler; }

  /**
   * Starts the HTTP server and makes it listen for connections.
   * @param {number} port - The port number to listen on.
   * @param {Function} [callback] - An optional callback to run when the server starts.
   */
  listen(port, callback) {
    this.server.listen(port, callback);
  }
}

module.exports = Redact;