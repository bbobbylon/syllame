/**
 * Outgoing email.
 *
 * With SMTP_URL set (e.g. `smtps://user:pass@smtp.example.com:465`) mail goes
 * through nodemailer. Without it, which is the normal local-development
 * case, the message is printed to the server console instead, so you can
 * copy a password-reset link straight from the terminal.
 *
 * In tests every message is pushed onto `outbox` so assertions can read it.
 */

const nodemailer = require("nodemailer");
const env = require("./env");

/** Messages "sent" while NODE_ENV=test. Cleared by tests as needed. */
const outbox = [];

/** @type {import("nodemailer").Transporter | null} */
let transporter = null;
if (env.smtpUrl) {
  transporter = nodemailer.createTransport(env.smtpUrl);
}

/**
 * Sends (or logs) an email.
 *
 * @param {object} message
 * @param {string} message.to
 * @param {string} message.subject
 * @param {string} message.text - Plain-text body; always provided.
 * @param {string} [message.html]
 * @returns {Promise<{ delivered: boolean }>} `delivered` is false when the
 *   message was only logged.
 */
async function sendMail(message) {
  const full = { from: env.mailFrom, ...message };

  if (env.nodeEnv === "test") {
    outbox.push(full);
    return { delivered: false };
  }

  if (transporter) {
    await transporter.sendMail(full);
    return { delivered: true };
  }

  console.log("\n=== Email (SMTP_URL not set; printing instead of sending) ===");
  console.log(`To:      ${full.to}`);
  console.log(`Subject: ${full.subject}`);
  console.log(full.text);
  console.log("=== End email ===\n");
  return { delivered: false };
}

module.exports = { sendMail, outbox, isConfigured: Boolean(transporter) };
