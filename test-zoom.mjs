import 'dotenv/config';
import { createZoomMeeting } from './backend/zoom.js';

(async () => {
  try {
    const url = await createZoomMeeting('Test Meeting', new Date().toISOString(), 30);
    console.log('Success:', url);
  } catch (err) {
    console.error('Failed:', err);
  }
})();
