require('dotenv').config();

const app = require('./app');
const { connectDatabase } = require('./config/database');

const port = Number(process.env.PORT) || 5000;

async function startServer() {
  try {
    await connectDatabase();
    app.listen(port, () => {
      console.info(`ShopSphere API listening on port ${port}`);
    });
  } catch (error) {
    console.error('Unable to start ShopSphere API:', error.message);
    process.exitCode = 1;
  }
}

startServer();
