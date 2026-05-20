import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import { createRazorpayOrder, verifyRazorpayPayment } from './razorpay.js';
import { createZoomMeeting } from './zoom.js';
import { verifyGoogleToken, generateResetToken, verifyAndConsumeResetToken } from './auth.js';
import { sendZoomLinkEmail, sendPasswordResetEmail } from './email.js';

const app = express();
app.use(cors());
app.use(express.json());

// --- Razorpay & Zoom & Email Routes ---

app.post('/api/payment/orders', async (req, res) => {
  try {
    const { amount } = req.body;
    const order = await createRazorpayOrder(amount);
    res.json(order);
  } catch (error) {
    console.error('Razorpay Error:', error);
    res.status(500).json({ error: error.message || 'Failed to create order' });
  }
});

app.post('/api/payment/verify', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const isValid = verifyRazorpayPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    
    if (isValid) {
      res.json({ success: true, paymentId: razorpay_payment_id });
    } else {
      res.status(400).json({ error: 'Invalid signature' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Verification failed' });
  }
});

app.post('/api/zoom/meeting', async (req, res) => {
  try {
    const { topic, startTime, duration } = req.body;
    const joinUrl = await createZoomMeeting(topic, startTime, duration);
    res.json({ joinUrl });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create meeting' });
  }
});

app.post('/api/email/zoom', async (req, res) => {
  try {
    const { studentEmail, expertEmail, zoomLink, studentName, expertName, date, time } = req.body;
    const success = await sendZoomLinkEmail(studentEmail, expertEmail, zoomLink, studentName, expertName, date, time);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to send email' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Email sending error' });
  }
});

// --- Authentication Routes ---

app.post('/api/auth/google', async (req, res) => {
  try {
    const { token } = req.body;
    const payload = await verifyGoogleToken(token);
    res.json({ user: payload });
  } catch (error) {
    res.status(401).json({ error: 'Invalid Google token' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const token = generateResetToken(email);
    const success = await sendPasswordResetEmail(email, token);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(500).json({ error: 'Failed to send reset email' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Password reset error' });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const email = verifyAndConsumeResetToken(token);
    if (email) {
      res.json({ success: true, email });
    } else {
      res.status(400).json({ error: 'Invalid or expired token' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to reset password' });
  }
});

// Vercel serverless function entrypoint
export default app;
