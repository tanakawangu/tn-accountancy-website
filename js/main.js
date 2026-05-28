/* ============================================================
   T&N ACCOUNTANCY — Main JavaScript
   ============================================================ */

'use strict';

document.addEventListener('DOMContentLoaded', function () {

  /* --- Sticky Header --- */
  const header = document.querySelector('.site-header');
  if (header) {
    let lastScrollY = window.scrollY;
    const handleScroll = () => {
      if (window.scrollY > 60) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScrollY = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
  }

  /* --- Mobile Navigation --- */
  const navToggle = document.querySelector('.nav-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const body = document.body;

  if (navToggle && mobileMenu) {
    navToggle.addEventListener('click', function () {
      const isOpen = mobileMenu.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (
        mobileMenu.classList.contains('open') &&
        !mobileMenu.contains(e.target) &&
        !navToggle.contains(e.target)
      ) {
        closeMobileMenu();
      }
    });

    // Close on escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && mobileMenu.classList.contains('open')) {
        closeMobileMenu();
        navToggle.focus();
      }
    });

    // Close menu when nav link is clicked
    const mobileLinks = mobileMenu.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', closeMobileMenu);
    });
  }

  function openMobileMenu() {
    mobileMenu.classList.add('open');
    navToggle.classList.add('open');
    navToggle.setAttribute('aria-expanded', 'true');
    body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('open');
    navToggle.classList.remove('open');
    navToggle.setAttribute('aria-expanded', 'false');
    body.style.overflow = '';
  }

  /* --- Active Navigation Link --- */
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-link, .dropdown-link, .mobile-nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (!href) return;
    const linkPath = href.replace(/^\.\//, '/').replace(/\/index\.html$/, '/');
    const cleanCurrent = currentPath.replace(/\/index\.html$/, '/');
    if (
      (cleanCurrent === '/' && (href === 'index.html' || href === '/')) ||
      (cleanCurrent !== '/' && href && cleanCurrent.includes(href.replace('.html', '')))
    ) {
      link.classList.add('active');
    }
  });

  /* --- FAQ Accordion --- */
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', function () {
      const isOpen = item.classList.contains('open');

      // Close all others
      faqItems.forEach(other => {
        if (other !== item && other.classList.contains('open')) {
          other.classList.remove('open');
          const btn = other.querySelector('.faq-question');
          if (btn) btn.setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      if (isOpen) {
        item.classList.remove('open');
        question.setAttribute('aria-expanded', 'false');
      } else {
        item.classList.add('open');
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* --- Scroll Animations (Intersection Observer) --- */
  const fadeElements = document.querySelectorAll('.fade-in');
  if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.12,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    fadeElements.forEach(el => observer.observe(el));
  } else {
    // Fallback: show all elements
    fadeElements.forEach(el => el.classList.add('visible'));
  }

  /* --- Contact Form --- */
  const enquiryForm = document.getElementById('enquiryForm');
  if (enquiryForm) {
    // Deadline toggle
    const deadlineYes = document.getElementById('deadline-yes');
    const deadlineDateField = document.getElementById('deadline-date-field');
    const deadlineNo = document.getElementById('deadline-no');
    const deadlineUnsure = document.getElementById('deadline-unsure');

    function toggleDeadlineDate() {
      if (deadlineDateField) {
        deadlineDateField.style.display = deadlineYes && deadlineYes.checked ? 'block' : 'none';
      }
    }

    if (deadlineYes) deadlineYes.addEventListener('change', toggleDeadlineDate);
    if (deadlineNo) deadlineNo.addEventListener('change', toggleDeadlineDate);
    if (deadlineUnsure) deadlineUnsure.addEventListener('change', toggleDeadlineDate);

    // Form submission — POST to backend via fetch
    enquiryForm.addEventListener('submit', async function (e) {
      e.preventDefault();

      const submitBtn = enquiryForm.querySelector('[type="submit"]');
      const consentEl = document.getElementById('consent');

      if (!consentEl || !consentEl.checked) {
        showFormMessage('Please confirm your consent before submitting.', 'error');
        return;
      }

      // Client-side required field check (email/name/message)
      const required = enquiryForm.querySelectorAll('[required]');
      let valid = true;
      required.forEach(field => {
        if (field.type === 'checkbox') return; // handled above
        if (!field.value.trim()) {
          valid = false;
          field.style.borderColor = '#c0392b';
          field.addEventListener('input', function () {
            field.style.borderColor = '';
          }, { once: true });
        }
      });

      if (!valid) {
        showFormMessage('Please fill in all required fields.', 'error');
        return;
      }

      // Build payload
      const deadlineChecked = document.querySelector('input[name="deadline"]:checked');
      const payload = {
        fullName:     (document.getElementById('fullName')?.value     || '').trim(),
        email:        (document.getElementById('email')?.value        || '').trim(),
        phone:        (document.getElementById('phone')?.value        || '').trim(),
        businessName: (document.getElementById('businessName')?.value || '').trim(),
        businessType:  document.getElementById('businessType')?.value  || '',
        serviceNeeded: document.getElementById('serviceNeeded')?.value || '',
        software:      document.getElementById('software')?.value      || '',
        deadline:      deadlineChecked?.value || '',
        deadlineDate:  document.querySelector('input[name="deadlineDate"]')?.value || '',
        message:      (document.getElementById('message')?.value      || '').trim(),
        consent:       true,
        website:       document.getElementById('hp_website')?.value   || '', // honeypot
        source:        'Contact Page',
      };

      // Show loading state
      const btnOriginalHTML = submitBtn ? submitBtn.innerHTML : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin" aria-hidden="true"></i> Sending&hellip;';
      }

      // Clear any previous message
      const oldMsg = document.getElementById('form-message');
      if (oldMsg) oldMsg.remove();

      try {
        const response = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        let result;
        try { result = await response.json(); } catch (_) { result = {}; }

        if (result.success) {
          showFormMessage(
            'Thank you. Your enquiry has been sent successfully. We aim to respond within 24 hours.',
            'success'
          );
          enquiryForm.reset();
          if (deadlineDateField) deadlineDateField.style.display = 'none';
        } else {
          showFormMessage(
            result.error || 'There was a problem sending your enquiry. Please try again or contact us at info@tandnaccountancy.co.uk.',
            'error'
          );
        }
      } catch (_err) {
        showFormMessage(
          'There was a problem sending your enquiry. Please check your connection and try again, or contact us at info@tandnaccountancy.co.uk or call 07939061264.',
          'error'
        );
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = btnOriginalHTML;
        }
      }
    });
  }

  function showFormMessage(message, type) {
    let msgEl = document.getElementById('form-message');
    if (!msgEl) {
      msgEl = document.createElement('div');
      msgEl.id = 'form-message';
      msgEl.setAttribute('role', 'status');
      msgEl.setAttribute('aria-live', 'polite');
      msgEl.setAttribute('aria-atomic', 'true');
      msgEl.style.cssText = [
        'padding:1rem 1.5rem',
        'border-radius:8px',
        'font-size:0.875rem',
        'font-weight:500',
        'margin-bottom:1rem',
        'line-height:1.5',
      ].join(';');
      const form = document.getElementById('enquiryForm');
      if (form) form.prepend(msgEl);
    }

    if (type === 'success') {
      msgEl.style.background = '#f0fdf4';
      msgEl.style.color = '#15803d';
      msgEl.style.border = '1px solid #bbf7d0';
    } else {
      msgEl.style.background = '#fef2f2';
      msgEl.style.color = '#b91c1c';
      msgEl.style.border = '1px solid #fecaca';
    }

    msgEl.textContent = message;
    msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

    if (type === 'success') {
      setTimeout(() => { if (msgEl) msgEl.remove(); }, 10000);
    }
  }

  /* --- Cookie Banner --- */
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieAccept = document.getElementById('cookieAccept');
  const cookieDecline = document.getElementById('cookieDecline');

  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }

  if (cookieBanner && !getCookie('tn_cookie_consent')) {
    setTimeout(() => {
      cookieBanner.classList.add('visible');
    }, 1500);
  }

  if (cookieAccept) {
    cookieAccept.addEventListener('click', function () {
      document.cookie = 'tn_cookie_consent=accepted; max-age=31536000; path=/; SameSite=Lax';
      cookieBanner.classList.remove('visible');
    });
  }

  if (cookieDecline) {
    cookieDecline.addEventListener('click', function () {
      document.cookie = 'tn_cookie_consent=declined; max-age=31536000; path=/; SameSite=Lax';
      cookieBanner.classList.remove('visible');
    });
  }

  /* --- Smooth scroll for anchor links --- */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 90;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
