import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM, FRONTEND_URL } =
  process.env;

const transport = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === "465", // Use true for port 465, false for all other ports like 587
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
});

const sendEmail = async (to, subject, text, html) => {
  const msg = {
    from: EMAIL_FROM,
    to,
    subject,
    text,
    html,
  };
  await transport.sendMail(msg);
};

const sendPasswordResetEmail = async (to, token) => {
  const subject = "Password Reset Request";
  const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
  const text = `You are receiving this email because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${resetUrl}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`;
  const html = `<p>You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
                <p>Please click on the following link, or paste this into your browser to complete the process:</p>
                <a href="${resetUrl}">${resetUrl}</a>
                <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`;

  await sendEmail(to, subject, text, html);
};

export const emailService = {
  sendEmail,
  sendPasswordResetEmail,
};
