import app from './app.ts';
import { env } from './config/env.ts';
import { logger } from './utils/logger.ts';
import { startMarketSync } from './workers/index.ts';
// TODO: uncomment when enabling full functionality
// import { steamBot } from './services/steamBot.ts';
// import { startWorkers, stopWorkers } from './workers/index.ts';

const start = async () => {
  app.listen(env.PORT, () => {
    logger.info(`Server running on port ${env.PORT} [${env.NODE_ENV}]`);
  });

  // Start market sync (fetches skins from Steam Market every 10 min)
  await startMarketSync();

  // TODO: uncomment when enabling full functionality
  // steamBot.login();
  // await startWorkers();

  // const shutdown = async (signal: string) => {
  //   logger.info(`${signal} received, shutting down`);
  //   await stopWorkers();
  //   process.exit(0);
  // };
  // process.on('SIGTERM', () => shutdown('SIGTERM'));
  // process.on('SIGINT', () => shutdown('SIGINT'));
};

start().catch((err) => {
  logger.fatal(err, 'Failed to start server');
  process.exit(1);
});
