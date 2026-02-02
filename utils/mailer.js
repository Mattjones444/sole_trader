const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const { promisify } = require('util');

const renderFile = promisify(ejs.renderFile);

function requiredEnv(name) {
  const val = process.env[name];
  if (!val) throw new Error(`Missing environment variable: ${name}`);
  return val;
}

function toBool(value, fallback = false) {
  if (value === undefined) return fallback;
  return String(value).toLowerCase() === 'true';
}

const SMTP_HOST = requiredEnv('SMTP_HOST');
const SMTP_PORT = Number(requiredEnv('SMTP_PORT'));
const SMTP_SECURE = toBool(process.env.SMTP_SECURE, SMTP_PORT === 465);
const SMTP_USER = requiredEnv('SMTP_USER');
const SMTP_PASS = requiredEnv('SMTP_PASS');
const EMAIL_FROM = requiredEnv('EMAIL_FROM');

const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_SECURE,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS
  },
  ...(SMTP_SECURE ? {} : { requireTLS: true }),
  tls: { minVersion: 'TLSv1.2' }
});

// Optional startup check
transporter.verify()
  .then(() => console.log('✅ SMTP transporter verified'))
  .catch(err => console.error('❌ SMTP transporter verify failed:', err.message));

exports.sendTemplateMail = async ({ to, subject, template, data }) => {
  const templatePath = path.join(__dirname, '..', 'emails', template);
  const layoutPath = path.join(__dirname, '..', 'emails', 'layouts', 'base.ejs');

  const body = await renderFile(templatePath, data);
  const html = await renderFile(layoutPath, { body });

  // Safety check so you immediately see if rendering broke
  if (!html || typeof html !== 'string' || html.trim().length === 0) {
    throw new Error(`Rendered HTML is empty (template: ${template})`);
  }

  return transporter.sendMail({
    from: `"Sole Traders" <${EMAIL_FROM}>`,
    to,
    subject,
    html,
    // Add a plain-text fallback so Mailtrap always shows a body too
    text: body.replace(/<[^>]*>/g, '').trim()
  });
};
