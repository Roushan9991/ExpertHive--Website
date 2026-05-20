import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload; // Contains email, name, picture, etc.
  } catch (error) {
    console.error('Error verifying Google Token:', error);
    throw new Error('Invalid Google Token');
  }
};

// In-memory store for reset tokens for demonstration purposes.
// In a real application, this should be stored in a database with expiration times.
const resetTokens = new Map();

export const generateResetToken = (email) => {
  const token = crypto.randomBytes(32).toString('hex');
  resetTokens.set(token, { email, expires: Date.now() + 3600000 }); // 1 hour expiration
  return token;
};

export const verifyAndConsumeResetToken = (token) => {
  const tokenData = resetTokens.get(token);
  if (!tokenData || tokenData.expires < Date.now()) {
    return null;
  }
  
  // Consume token
  resetTokens.delete(token);
  return tokenData.email;
};
