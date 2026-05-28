# T&N Accountancy — Website

A complete, professional, static HTML website for **T&N Accountancy**, a UK accountancy and bookkeeping practice.

---

## 📂 File Structure

```
tn-accountancy-website/
├── index.html                        Homepage
├── services.html                     Services overview
├── bookkeeping.html                  Bookkeeping service page
├── self-assessment-tax-returns.html  Self Assessment page
├── sole-trader-accounts.html         Sole Trader Accounts page
├── limited-company-accounts.html     Limited Company Accounts page
├── vat-returns.html                  VAT Returns page
├── payroll-support.html              Payroll Support page
├── corporation-tax-support.html      Corporation Tax Support page
├── management-accounts.html          Management Accounts page
├── business-start-up-support.html    Business Start-Up Support page
├── who-we-help.html                  Who We Help page
├── about.html                        About page
├── faqs.html                         FAQs page
├── contact.html                      Contact page (with enquiry form)
├── privacy-policy.html               Privacy Policy
├── terms-of-business.html            Terms of Business
├── cookie-policy.html                Cookie Policy
├── css/
│   └── style.css                     Main stylesheet (2,300+ lines)
├── js/
│   └── main.js                       Main JavaScript
└── images/                           Image assets folder (populate as needed)
```

---

## 🚀 Getting Started

This is a static HTML website with no build process required.

**To preview locally:**
- Open `index.html` in any browser
- Or run a local server: `python3 -m http.server 8000` then visit `http://localhost:8000`

**To deploy:**
- Upload all files to your web hosting, maintaining the folder structure
- Ensure `css/`, `js/`, and `images/` folders are preserved

---

## ✅ Before Going Live — Placeholder Checklist

Search for `[` in the codebase to find all placeholders that need updating:

| Placeholder | Location | What to add |
|---|---|---|
| `[Email address to be confirmed]` | All pages + footer | Real email address |
| `[Phone number to be confirmed]` | All pages + footer | Real phone number |
| `[Address / service area to be confirmed]` | Contact, footer | Real address or service area |
| `[Date to be confirmed]` | Legal pages | Policy effective dates |
| `[Business name, registration number...]` | Privacy Policy, Terms | Company registration details |
| `[To be confirmed]` | Footer | Company reg + AML supervision |

---

## 🎨 Design System

| Element | Value |
|---|---|
| Primary brand colour | `#1B2B4B` (Deep Navy) |
| Accent colour | `#C4962A` (Refined Gold) |
| Off-white background | `#F8F7F4` |
| Heading font | Playfair Display (Google Fonts) |
| Body font | Inter (Google Fonts) |
| Icons | Font Awesome 6 Free (CDN) |

---

## 🔧 Technical Notes

- **No framework dependencies** — pure HTML, CSS, JavaScript
- **Mobile-first responsive** design with breakpoints at 768px and 1024px
- **Sticky header** with scroll detection
- **Mobile hamburger menu** with accessibility support
- **FAQ accordion** — all FAQ sections use the same JS handler
- **Scroll animations** via IntersectionObserver API (graceful fallback)
- **Contact form** — client-side validation included; connect to a real backend/email service before go-live
- **Cookie banner** — functional consent logic using cookies; update if analytics are added
- **SEO** — unique `<title>`, `<meta description>`, `<h1>`, canonical URLs, breadcrumbs on every page
- **Accessibility** — skip navigation, ARIA labels, semantic HTML throughout

---

## 📝 Compliance Notes

- All copy is **compliance-aware** — no false claims about chartered status, client numbers, awards, or qualifications
- Professional status section uses **cautious placeholder wording** pending confirmation
- All pages include a **general disclaimer** about website content being general guidance only
- **AML supervision** placeholder in footer — add details when confirmed
- **Privacy Policy** and **Cookie Policy** are templates — have them reviewed by a legal professional before go-live
- **Terms of Business** — have reviewed by a solicitor before use with clients

---

## 📨 Contact Form

The contact form (`contact.html`) submits to `/api/contact` via `fetch()`. The Express backend sends emails using [Resend](https://resend.com).

**Spam protection included:**
- Honeypot hidden field (bots fill it; real users don't)
- Rate limiting: 10 submissions per IP per 15 minutes
- Message and field length limits
- Payload size cap (10 KB)

---

## 🚀 Deploying to Render

### Prerequisites
- A [Render](https://render.com) account
- A [Resend](https://resend.com) account with a **verified sending domain**
- The project pushed to a GitHub (or GitLab) repository

### Step 1 — Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/tn-accountancy-website.git
git push -u origin main
```

### Step 2 — Create a Web Service on Render

1. Go to [dashboard.render.com](https://dashboard.render.com) → **New → Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free (or paid for always-on)

### Step 3 — Set Environment Variables

In the Render dashboard, go to your service → **Environment** and add:

| Key | Value |
|-----|-------|
| `RESEND_API_KEY` | Your Resend API key |
| `RESEND_FROM_EMAIL` | A verified sender, e.g. `noreply@tandnaccountancy.co.uk` |
| `CONTACT_TO_EMAIL` | `info@tandnaccountancy.co.uk` |
| `ENABLE_AUTO_REPLY` | `true` |
| `NODE_ENV` | `production` |

> **Never commit `.env` to Git.** Use `.env.example` as the template.

### Step 4 — Deploy

Click **Deploy** (or push to `main` — Render auto-deploys on every push).

### Local Development

```bash
cp .env.example .env
# Fill in real values in .env
npm install
npm run dev
# Visit http://localhost:3000
```

---

## 🔍 SEO Implementation

Each page has:
- Unique `<title>` tag with keywords
- Unique `<meta description>`
- Single `<h1>` heading
- Logical `<h2>`/`<h3>` hierarchy
- Internal links between related pages
- Breadcrumb navigation
- `<link rel="canonical">` tags
- Mobile-first responsive layout

---

*Built for T&N Accountancy — UK Accountancy & Bookkeeping*
