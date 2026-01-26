// File: api/index.js
import app from "./app.js";
import { config } from './config/config.js';
import { db } from "./config/database.js";

const startServer = async () => {
  try {
    await db.query('SELECT 1');
    console.log('✅ Database connected successfully.');
    app.listen(config.port, () => {
      console.log(`🚀 API running at http://localhost:${config.port}`);
    });
  } catch (err) {
    console.error('❌ Server failed to start.', err);
    process.exit(1);
  }
};

startServer();

