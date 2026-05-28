'use strict';

require('dotenv').config();

const express = require('express');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3000;

// Trust Render's reverse proxy so rate limiting sees real client IPs
app.set('trust proxy', 1);

// Reject oversized payloads before body parsing
app.use(express.json({ limit: '10kb' }));

// Serve all static frontend files from the project root
app.use(express.static(path.join(__dirname)));

// 10 submissions per IP per 15 minutes
const formLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests. Please wait 15 minutes before trying again.' },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function sanitize(val) {
  if (typeof val !== 'string') return '';
  return val.replace(/<[^>]*>/g, '').trim();
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

function buildHtmlEmail({ fullName, email, phone, businessName, businessType, serviceNeeded, software, deadlineDisplay, message, source, timestamp }) {
  const e = escapeHtml;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
body{font-family:Arial,sans-serif;font-size:15px;color:#1B2B4B;background:#f8f7f4;margin:0;padding:0;}
.wrap{max-width:620px;margin:24px auto;background:#fff;border-radius:8px;border:1px solid #e2e0db;overflow:hidden;}
.hd{background:#1B2B4B;padding:24px 32px;}
.hd h1{color:#C4962A;font-size:1.1rem;margin:0;font-family:Georgia,serif;}
.hd p{color:rgba(255,255,255,.6);font-size:.8rem;margin:4px 0 0;}
.bd{padding:28px 32px;}
.note{background:#f8f7f4;border-left:4px solid #C4962A;padding:12px 16px;margin-bottom:24px;border-radius:0 4px 4px 0;font-size:.875rem;color:#555;}
table{width:100%;border-collapse:collapse;}
tr:nth-child(even) td{background:#f8f7f4;}
td{padding:10px 12px;border-bottom:1px solid #eee;font-size:.875rem;vertical-align:top;}
td:first-child{font-weight:600;color:#1B2B4B;width:40%;white-space:nowrap;}
.msg{background:#f8f7f4;border:1px solid #e2e0db;border-radius:6px;padding:16px;margin-top:20px;}
.msg h3{font-size:.8rem;font-weight:700;color:#1B2B4B;margin:0 0 10px;text-transform:uppercase;letter-spacing:.5px;}
.msg p{margin:0;font-size:.875rem;line-height:1.65;color:#333;white-space:pre-wrap;}
.ft{padding:14px 32px;background:#f8f7f4;border-top:1px solid #e2e0db;font-size:.75rem;color:#888;text-align:center;}
</style>
</head>
<body>
<div class="wrap">
  <div class="hd">
    <h1>T&amp;N ACCOUNTANCY &#8212; New Website Enquiry</h1>
    <p>Submitted via ${e(source)}</p>
  </div>
  <div class="bd">
    <div class="note">A new enquiry has been received through your website. Details are shown below.</div>
    <table>
      <tr><td>Name</td><td>${e(fullName)}</td></tr>
      <tr><td>Email</td><td><a href="mailto:${e(email)}" style="color:#C4962A;">${e(email)}</a></td></tr>
      <tr><td>Phone</td><td>${phone ? e(phone) : '&#8212;'}</td></tr>
      <tr><td>Business Name</td><td>${businessName ? e(businessName) : '&#8212;'}</td></tr>
      <tr><td>Business Type</td><td>${businessType ? e(businessType) : '&#8212;'}</td></tr>
      <tr><td>Service Needed</td><td>${serviceNeeded ? e(serviceNeeded) : '&#8212;'}</td></tr>
      <tr><td>Accounting Software</td><td>${software ? e(software) : '&#8212;'}</td></tr>
      <tr><td>Urgent Deadline</td><td>${e(deadlineDisplay)}</td></tr>
      <tr><td>Consent Given</td><td>Yes</td></tr>
      <tr><td>Source</td><td>${e(source)}</td></tr>
      <tr><td>Submitted At</td><td>${e(timestamp)}</td></tr>
    </table>
    <div class="msg">
      <h3>Message</h3>
      <p>${e(message)}</p>
    </div>
  </div>
  <div class="ft">T&amp;N Accountancy &nbsp;|&nbsp; info@tandnaccountancy.co.uk &nbsp;|&nbsp; 07939061264</div>
</div>
</body>
</html>`;
}

function buildTextEmail({ fullName, email, phone, businessName, businessType, serviceNeeded, software, deadlineDisplay, message, source, timestamp }) {
  return [
    'NEW T&N ACCOUNTANCY WEBSITE ENQUIRY',
    '====================================',
    '',
    `Name:                ${fullName}`,
    `Email:               ${email}`,
    `Phone:               ${phone || 'Not provided'}`,
    `Business Name:       ${businessName || 'Not provided'}`,
    `Business Type:       ${businessType || 'Not specified'}`,
    `Service Needed:      ${serviceNeeded || 'Not specified'}`,
    `Accounting Software: ${software || 'Not specified'}`,
    `Urgent Deadline:     ${deadlineDisplay}`,
    `Consent Given:       Yes`,
    `Source:              ${source}`,
    `Submitted At:        ${timestamp}`,
    '',
    'MESSAGE',
    '-------',
    message,
    '',
    '---',
    'T&N Accountancy | info@tandnaccountancy.co.uk | 07939061264',
  ].join('\n');
}

function buildAutoReplyHtml(fullName) {
  const e = escapeHtml;
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<style>
body{font-family:Arial,sans-serif;font-size:15px;color:#1B2B4B;background:#f8f7f4;margin:0;padding:0;}
.wrap{max-width:580px;margin:24px auto;background:#fff;border-radius:8px;border:1px solid #e2e0db;overflow:hidden;}
.hd{background:#1B2B4B;padding:28px 32px;text-align:center;}
.hd h1{color:#C4962A;font-size:1.15rem;margin:0;font-family:Georgia,serif;}
.bd{padding:32px;}
p{margin:0 0 16px;line-height:1.65;color:#333;}
.sig{margin-top:28px;padding-top:20px;border-top:1px solid #eee;font-size:.9rem;color:#555;}
.ft{padding:14px 32px;background:#f8f7f4;border-top:1px solid #e2e0db;font-size:.75rem;color:#888;text-align:center;}
</style>
</head>
<body>
<div class="wrap">
  <div class="hd"><h1>T&amp;N ACCOUNTANCY</h1></div>
  <div class="bd">
    <p>Dear ${e(fullName)},</p>
    <p>Thank you for contacting T&amp;N Accountancy.</p>
    <p>We have received your enquiry and aim to respond within 24 hours.</p>
    <p>Your information will be treated confidentially and used only to respond to your enquiry.</p>
    <div class="sig">
      <p>Kind regards,<br><strong>T&amp;N Accountancy</strong></p>
      <p><a href="mailto:info@tandnaccountancy.co.uk" style="color:#C4962A;">info@tandnaccountancy.co.uk</a><br>07939061264</p>
    </div>
  </div>
  <div class="ft">T&amp;N Accountancy &nbsp;|&nbsp; Unit 28 Basepoint Business Centre, Stroudley Road, Basingstoke, RG24 8UP</div>
</div>
</body>
</html>`;
}

function buildAutoReplyText(fullName) {
  return [
    `Dear ${fullName},`,
    '',
    'Thank you for contacting T&N Accountancy.',
    '',
    'We have received your enquiry and aim to respond within 24 hours.',
    '',
    'Your information will be treated confidentially and used only to respond to your enquiry.',
    '',
    'Kind regards,',
    'T&N Accountancy',
    '',
    'info@tandnaccountancy.co.uk',
    '07939061264',
  ].join('\n');
}

// ---------------------------------------------------------------------------
// Shared enquiry handler (used by both /api/contact and /api/enquiry)
// ---------------------------------------------------------------------------

async function handleEnquiry(req, res, defaultSource) {
  const apiKey    = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;
  const toEmail   = process.env.CONTACT_TO_EMAIL || 'info@tandnaccountancy.co.uk';
  const enableAutoReply = process.env.ENABLE_AUTO_REPLY === 'true';

  if (!apiKey || !fromEmail) {
    console.error('RESEND_API_KEY or RESEND_FROM_EMAIL is not set.');
    return res.status(500).json({
      success: false,
      error: 'Email service is not configured. Please contact us directly at info@tandnaccountancy.co.uk.',
    });
  }

  const body = req.body;

  // Honeypot: bots tend to fill every visible-looking field; real users leave these blank
  if (body.website || body._gotcha) {
    return res.json({ success: true }); // silent accept — don't reveal the trap
  }

  const fullName     = sanitize(body.fullName).slice(0, 100);
  const email        = sanitize(body.email).slice(0, 200);
  const phone        = sanitize(body.phone).slice(0, 30);
  const businessName = sanitize(body.businessName).slice(0, 100);
  const businessType = sanitize(body.businessType).slice(0, 50);
  const serviceNeeded = sanitize(body.serviceNeeded).slice(0, 100);
  const software     = sanitize(body.software).slice(0, 50);
  const deadline     = sanitize(body.deadline).slice(0, 20);
  const deadlineDate = sanitize(body.deadlineDate).slice(0, 20);
  const message      = sanitize(body.message).slice(0, 2000);
  const consent      = body.consent === true || body.consent === 'true';
  const source       = sanitize(body.source || defaultSource).slice(0, 100);

  const errors = [];
  if (!fullName)           errors.push('Full name is required.');
  if (!email)              errors.push('Email address is required.');
  else if (!isValidEmail(email)) errors.push('Please enter a valid email address.');
  if (!message)            errors.push('Message is required.');
  if (!consent)            errors.push('Please confirm your consent before submitting.');

  if (errors.length) {
    return res.status(400).json({ success: false, error: errors.join(' ') });
  }

  const timestamp = new Date().toLocaleString('en-GB', {
    timeZone: 'Europe/London',
    dateStyle: 'full',
    timeStyle: 'short',
  });

  const deadlineDisplay =
    deadline === 'yes' && deadlineDate ? `Yes — ${deadlineDate}` :
    deadline === 'yes'    ? 'Yes' :
    deadline === 'no'     ? 'No' :
    deadline === 'unsure' ? 'Not sure' : 'Not specified';

  const sourceLower = source.toLowerCase();
  const subject =
    sourceLower.includes('consultation') ? 'New T&N Accountancy Consultation Request' :
    sourceLower.includes('enquiry')      ? 'New T&N Accountancy Service Enquiry' :
                                           'New T&N Accountancy Contact Enquiry';

  const fields = { fullName, email, phone, businessName, businessType, serviceNeeded, software, deadlineDisplay, message, source, timestamp };

  try {
    const resend = new Resend(apiKey);

    // Resend SDK v3 returns { data, error } — it does not throw on API errors
    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: [toEmail],
      replyTo: email,
      subject,
      html: buildHtmlEmail(fields),
      text: buildTextEmail(fields),
    });

    if (sendError) {
      console.error('Resend send error:', sendError);
      return res.status(500).json({
        success: false,
        error: 'There was a problem sending your enquiry. Please try again or contact us at info@tandnaccountancy.co.uk or call 07939061264.',
      });
    }

    if (enableAutoReply && isValidEmail(email)) {
      // Non-fatal — log failure but do not block the success response
      resend.emails.send({
        from: fromEmail,
        to: [email],
        subject: 'Thank you for contacting T&N Accountancy',
        html: buildAutoReplyHtml(fullName),
        text: buildAutoReplyText(fullName),
      }).then(({ error: replyError }) => {
        if (replyError) console.error('Auto-reply send failed (non-fatal):', replyError);
      }).catch(err => console.error('Auto-reply unexpected error (non-fatal):', err.message));
    }

    return res.json({ success: true });
  } catch (err) {
    console.error('Resend unexpected error:', err.message || err);
    return res.status(500).json({
      success: false,
      error: 'There was a problem sending your enquiry. Please try again or contact us at info@tandnaccountancy.co.uk or call 07939061264.',
    });
  }
}

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.post('/api/contact', formLimiter, (req, res) => handleEnquiry(req, res, 'Contact Page'));
app.post('/api/enquiry', formLimiter, (req, res) => handleEnquiry(req, res, 'General Enquiry'));

app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// ---------------------------------------------------------------------------
// Start
// ---------------------------------------------------------------------------

app.listen(PORT, () => {
  console.log(`T&N Accountancy server running on port ${PORT} (${process.env.NODE_ENV || 'development'})`);
});
