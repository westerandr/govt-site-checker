import cron from 'node-cron';
import { captureAllSnapshots } from './jobs/snapshotJob.js';

const SNAPSHOT_SCHEDULE = process.env.SNAPSHOT_SCHEDULE || '0 3 * * *'; // Default: daily at 3am

console.log(`Snapshot worker started. Schedule: ${SNAPSHOT_SCHEDULE}`);

// Run scheduled snapshot capture
cron.schedule(SNAPSHOT_SCHEDULE, async () => {
  console.log('Starting scheduled snapshot capture...');
  try {
    await captureAllSnapshots();
    console.log('Scheduled snapshot capture completed successfully');
  } catch (err) {
    console.error('Error during scheduled snapshot capture:', err);
  }
});

// Keep the process alive
console.log('Worker process running. Waiting for scheduled jobs...');
