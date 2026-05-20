import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendZoomLinkEmail = async (studentEmail, expertEmail, zoomLink, studentName, expertName, date, time) => {
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: [studentEmail, expertEmail],
    subject: 'AgriExpert Consultation - Zoom Link',
    html: `
      <h2>Your consultation is confirmed!</h2>
      <p>Hello,</p>
      <p>Your consultation between <strong>${studentName}</strong> and <strong>${expertName}</strong> is scheduled for <strong>${date} at ${time}</strong>.</p>
      <p>Please join the meeting using the following link:</p>
      <p><a href="${zoomLink}">${zoomLink}</a></p>
      <br />
      <p>Thank you,</p>
      <p>AgriExpert Connect Team</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Zoom link email sent: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetLink = `http://localhost:5173/reset-password?token=${token}`;
  
  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: email,
    subject: 'AgriExpert Connect - Password Reset',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested to reset your password.</p>
      <p>Click the link below to set a new password:</p>
      <p><a href="${resetLink}">Reset Password</a></p>
      <br />
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent: ', info.messageId);
    return true;
  } catch (error) {
    console.error('Error sending reset email:', error);
    return false;
  }
};
