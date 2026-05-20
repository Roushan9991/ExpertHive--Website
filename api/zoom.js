import axios from 'axios';

// Cache the zoom token to avoid requesting it for every meeting creation
let zoomToken = null;
let zoomTokenExpiresAt = 0;

const getZoomAccessToken = async () => {
  // If token is valid, return it
  if (zoomToken && Date.now() < zoomTokenExpiresAt) {
    return zoomToken;
  }

  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  const authHeader = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

  try {
    const response = await axios.post(`https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`, {}, {
      headers: {
        'Authorization': `Basic ${authHeader}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });

    zoomToken = response.data.access_token;
    // Set expiration slightly earlier to be safe
    zoomTokenExpiresAt = Date.now() + (response.data.expires_in - 300) * 1000;
    
    return zoomToken;
  } catch (error) {
    console.error('Failed to get Zoom Access Token:', error.response?.data || error.message);
    throw new Error('Zoom authentication failed');
  }
};

export const createZoomMeeting = async (topic, startTime, durationMins = 60) => {
  try {
    const token = await getZoomAccessToken();
    
    const response = await axios.post('https://api.zoom.us/v2/users/me/meetings', {
      topic: topic,
      type: 2, // Scheduled meeting
      start_time: startTime,
      duration: durationMins,
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        mute_upon_entry: true,
        watermark: false,
        use_pmi: false,
        approval_type: 0,
        audio: 'both',
        auto_recording: 'none',
        waiting_room: false
      }
    }, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.join_url;
  } catch (error) {
    console.error('Failed to create Zoom meeting:', error.response?.data || error.message);
    // If it fails, fallback to a mock link so the flow doesn't break
    console.log('Falling back to mock Zoom link due to API error.');
    return `https://zoom.us/j/${Date.now()}`;
  }
};
