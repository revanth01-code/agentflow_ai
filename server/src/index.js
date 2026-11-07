const http = require('http');
const app = require('./app');
const env = require('./config/env');
const { connectDatabase } = require('./config/db');
const { initSocket } = require('./config/socket');

async function start() {
  const db = await connectDatabase();
  const server = http.createServer(app);
  initSocket(server, env.clientUrl);

  server.listen(env.port, () => {
    console.log(`API listening on http://localhost:${env.port}`);
    console.log(`Database mode: ${db.status}${db.reason ? ` (${db.reason})` : ''}`);
  });
}

start().catch((error) => {
  console.error(error);
  process.exit(1);
});
