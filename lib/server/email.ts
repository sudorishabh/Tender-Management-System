import nodemailer from "nodemailer";

const port = parseInt(process.env.EMAIL_PORT || "587", 10);

// Create email transporter. Port 465 speaks TLS from the start; other ports
// must upgrade with STARTTLS, and the server certificate is always verified
// so the password and invite links can't be read on the way
export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port,
  secure: port === 465,
  requireTLS: port !== 465,
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
  tls: {
    minVersion: "TLSv1.2",
  },
});

// Verify connection on startup
export async function verifyEmailConnection() {
  try {
    await transporter.verify();
    console.log("✅ SMTP configuration is valid");
    return true;
  } catch (error) {
    console.error("❌ SMTP config error:", error);
    return false;
  }
}

// Email options interface
export interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

// Send email function
export async function sendMail({ to, subject, text, html }: EmailOptions) {
  const mailOptions = {
    from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM}>`,
    to,
    text,
    subject,
    html,
  };

  return await transporter.sendMail(mailOptions);
}
