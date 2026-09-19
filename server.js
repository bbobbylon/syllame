/**
 * Process entry point: connect to MongoDB, then start the HTTP server.
 *
 * Run with `npm start` (production) or `npm run server` (nodemon, restarts on
 * file changes). Configuration comes from environment variables; see
 * `config/env.js` and `.env.example`.
 */

const mongoose = require("mongoose");
const env = require("./config/env");
const createApp = require("./app");

/**
 * Connects to MongoDB and begins listening for HTTP requests.
 *
 * The app deliberately refuses to start if the database is unreachable
 * instead of serving requests that would all fail; hosting platforms will
 * restart it, and the log line tells you exactly what to fix.
 *
 * Mongoose 9 note: the `useNewUrlParser` / `useUnifiedTopology` flags the
 * original code passed were removed in Mongoose 6+ because they became the
 * only behavior; passing them today is unnecessary.
 *
 * @returns {Promise<import("node:http").Server>}
 */
async function main() {
  try {
    // Fail within 5s instead of the 30s driver default so a bad URI is obvious fast.
    await mongoose.connect(env.mongoURI, { serverSelectionTimeoutMS: 5000 });
    console.log("MongoDB connected successfully");
  } catch (err) {
    console.error("Could not connect to MongoDB. Check MONGO_URI in your .env file.");
    console.error(err.message);
    process.exit(1);
  }

  const app = createApp();
  return app.listen(env.port, () => {
    console.log(`Server running on http://localhost:${env.port} (${env.nodeEnv})`);
  });
}

main();
