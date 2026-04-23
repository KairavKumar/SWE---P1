const nodemailer = require("nodemailer");
const env = require("../config/env");

let transporter = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.smtp.host,
      port: env.smtp.port,
      secure: env.smtp.port === 465,
      auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.password } : undefined
    });
  }
  return transporter;
}

async function sendPasswordReset(toEmail, resetUrl) {
  if (!env.smtp.host) {
    console.warn("SMTP not configured; skipping email send");
    return;
  }

  const mailer = getTransporter();
  await mailer.sendMail({
    from: env.smtp.from,
    to: toEmail,
    subject: "Password Reset",
    html: `<p>Click the link below to reset your password:</p><p><a href=\"${resetUrl}\">Reset Password</a></p>`
  });
}

module.exports = {
  sendPasswordReset
};
