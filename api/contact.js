// Serverless function backing the contact form (src/partials/contact/01-
// main.html). Deliberately NOT a third-party form service (Formspree,
// etc.) -- sends straight from this project's own Vercel deployment to
// the client's own existing email inbox over SMTP, so no outside company
// ever handles the submission. Needs 5 environment variables set in the
// Vercel project (never committed to the repo): SMTP_HOST, SMTP_PORT,
// SMTP_USER, SMTP_PASS, and CONTACT_TO_EMAIL (the inbox that should
// receive submissions -- SMTP_USER and CONTACT_TO_EMAIL are often the
// same address, but don't have to be).
//
// This is the one place in the whole project with a real npm runtime
// dependency (nodemailer) -- build.js and the static site it produces
// stay at zero. Vercel's installCommand omits devDependencies
// (vercel.json), so nodemailer is a regular "dependency", not a dev one,
// or it wouldn't survive that install and this function would fail to
// bundle.
const nodemailer = require('nodemailer');

const REQUIRED_FIELDS = ['name', 'company', 'email', 'message'];
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Strips CR/LF so no submitted field can inject extra headers into the
// outgoing message -- defense in depth; nodemailer already guards against
// header injection internally, but stripping at the boundary costs nothing.
// Only for single-line fields; the "message" textarea uses cleanBody()
// below instead, since it's the mail body, not anywhere near a header --
// stripping its newlines would collapse a real multi-paragraph message
// from a genuine visitor into one unbroken line.
function clean(value) {
  return String(value || '').replace(/[\r\n]+/g, ' ').trim();
}

function cleanBody(value) {
  return String(value || '').trim();
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).send('Method Not Allowed');
  }

  const body = req.body || {};

  // Honeypot: a hidden field no real visitor can see or fill in (see the
  // form markup). A bot that fills every field trips this -- respond as
  // if the submission succeeded so the bot doesn't learn it was caught,
  // but never actually send the email.
  if (clean(body.website)) {
    res.writeHead(302, { Location: '/contact.html?sent=1' });
    return res.end();
  }

  const missing = REQUIRED_FIELDS.filter(function (f) { return !clean(body[f]); });
  if (missing.length || !EMAIL_PATTERN.test(clean(body.email))) {
    res.writeHead(302, { Location: '/contact.html?error=1' });
    return res.end();
  }

  const name = clean(body.name);
  const company = clean(body.company);
  const email = clean(body.email);
  const phone = clean(body.phone);
  const service = clean(body.service);
  const message = cleanBody(body.message);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    // Port 465 is implicit TLS; 587 (the common default) upgrades via
    // STARTTLS instead, which nodemailer only does when secure:false.
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: process.env.CONTACT_TO_EMAIL,
      replyTo: email,
      subject: 'New consultation request from ' + name + ' (' + company + ')',
      text: [
        'Name: ' + name,
        'Company: ' + company,
        'Email: ' + email,
        'Phone: ' + (phone || '(not provided)'),
        'Service interested in: ' + (service || '(not specified)'),
        '',
        'Message:',
        message,
      ].join('\n'),
    });
  } catch (err) {
    console.error('contact form send failed:', err);
    res.writeHead(302, { Location: '/contact.html?error=1' });
    return res.end();
  }

  res.writeHead(302, { Location: '/contact.html?sent=1' });
  return res.end();
};
