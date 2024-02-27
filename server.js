const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.error('\u001b[1;31m[APP] Uncaught Exception!');
  console.error(err);
  process.exit(1);
});

dotenv.config({ path: './config.env' });
const app = require('./app');

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`[APP] Listening on ${port}`),
);

const DB_URL = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

const shutDownServer = () => {
  server.close(() => {
    console.log(`\u001b[1;33m[APP] Shutting down...`);
    process.exit(1);
  });
};

mongoose
  .connect(DB_URL)
  .then(() => console.log('[DATABASE] Connection successful'))
  .catch((err) => {
    console.error(`\u001b[1;31m[DATABASE] Connection failed: ${err}`);
    shutDownServer();
  });

process.on('unhandledRejection', (err) => {
  console.error('\u001b[1;31m[APP] [1;31mUnhandled Rejection!');
  console.error(err.name, err.message);
  shutDownServer();
});
