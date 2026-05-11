/* ============================================
   YUANDING TECH - B2B Website
   Global JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  initHeader();
  initMobileMenu();
  initSmoothScroll();
  initRevealAnimations();
  initProductFilter();
  initProductModal();
  initContactForm();
  initBackToTop();
  initTidioChat();
});

/* --- Header Scroll Effect --- */
function initHeader() {
  const header = document.querySelector('.header');
  if (!header) return;

  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
  });
}

/* --- Mobile Menu --- */
function initMobileMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('.nav-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => {
    toggle.classList.toggle('active');
    menu.classList.toggle('active');
    document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
  });

  // Close menu on link click
  menu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      toggle.classList.remove('active');
      menu.classList.remove('active');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!menu.contains(e.target) && !toggle.contains(e.target) && menu.classList.contains('active')) {
      toggle.classList.remove('active');
      menu.classList.remove('active');
      document.body.style.overflow = '';
    }
  });
}

/* --- Smooth Scroll for anchor links --- */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerHeight = document.querySelector('.header')?.offsetHeight || 72;
        const offset = target.getBoundingClientRect().top + window.pageYOffset - headerHeight - 20;
        window.scrollTo({ top: offset, behavior: 'smooth' });
      }
    });
  });
}

/* --- Intersection Observer for Reveal Animations --- */
function initRevealAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -80px 0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Stagger children
        if (entry.target.classList.contains('stagger')) {
          const children = entry.target.children;
          [...children].forEach((child, i) => {
            setTimeout(() => {
              child.classList.add('visible');
            }, i * 100);
          });
        } else {
          entry.target.classList.add('visible');
        }
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe reveal elements
  document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger').forEach(el => {
    observer.observe(el);
  });

  // Observe trust number count-up
  observeTrustNumbers();
}

/* --- Trust Bar Number Animation --- */
function observeTrustNumbers() {
  const trustNumbers = document.querySelectorAll('.trust-number[data-count]');
  if (!trustNumbers.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.getAttribute('data-count'), 10);
        const suffix = el.getAttribute('data-suffix') || '';
        const duration = 2000;
        const start = performance.now();

        function update(now) {
          const elapsed = now - start;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.round(eased * target);
          el.textContent = current + suffix;

          if (progress < 1) {
            requestAnimationFrame(update);
          }
        }

        requestAnimationFrame(update);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  trustNumbers.forEach(el => observer.observe(el));
}

/* --- Product Filter --- */
function initProductFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const productCards = document.querySelectorAll('.products-grid .product-card');
  if (!filterBtns.length || !productCards.length) return;

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');

      // Filter products
      productCards.forEach(card => {
        if (category === 'all' || card.getAttribute('data-category') === category) {
          card.classList.add('visible');
          // Add reveal animation
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          requestAnimationFrame(() => {
            card.style.transition = 'all 0.4s ease';
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          });
        } else {
          card.classList.remove('visible');
        }
      });
    });
  });

  // Show all by default
  productCards.forEach(card => card.classList.add('visible'));
}

/* --- Product Modal --- */
function initProductModal() {
  const overlay = document.querySelector('.product-modal-overlay');
  if (!overlay) return;

  const modal = overlay.querySelector('.product-modal');
  const closeBtn = overlay.querySelector('.modal-close');

  // Open modal
  document.querySelectorAll('[data-product-modal]').forEach(trigger => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      const productId = trigger.getAttribute('data-product-modal');
      populateModal(productId);
      overlay.classList.add('active');
      document.body.style.overflow = 'hidden';
    });
  });

  // Close modal
  function closeModal() {
    overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn?.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  // ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) {
      closeModal();
    }
  });
}

function populateModal(productId) {
  const productData = getProductData();
  const product = productData[productId];
  if (!product) return;

  const modal = document.querySelector('.product-modal');
  if (!modal) return;

  modal.querySelector('.modal-title').textContent = product.name;
  modal.querySelector('.modal-desc').textContent = product.description;

  // Populate specs
  const specsContainer = modal.querySelector('.modal-specs');
  if (specsContainer && product.specs) {
    specsContainer.innerHTML = product.specs.map(spec =>
      `<div class="modal-spec-item">
        <span class="modal-spec-label">${spec.label}</span>
        <span class="modal-spec-value">${spec.value}</span>
      </div>`
    ).join('');
  }
}

function getProductData() {
  return {
    'inner-rotor-1': {
      name: 'Inner Rotor BLDC Motor - YD-IR28 Series',
      description: 'High-performance inner rotor brushless DC motor designed for industrial automation, medical equipment, and precision instruments. Features compact design, high power density, and exceptional speed control accuracy.',
      specs: [
        { label: 'Rated Voltage', value: '12V / 24V / 48V DC' },
        { label: 'Rated Power', value: '50W - 500W' },
        { label: 'Rated Speed', value: '3000 - 12000 RPM' },
        { label: 'Efficiency', value: '≥ 85%' },
        { label: 'Protection Class', value: 'IP54 / IP65' },
        { label: 'Certification', value: 'CE, RoHS' }
      ]
    },
    'outer-rotor-1': {
      name: 'Outer Rotor BLDC Motor - YD-OR35 Series',
      description: 'Outer rotor brushless DC motor with hollow cup design, delivering high torque at low speeds. Ideal for electric vehicles, robotics, and marine propulsion systems.',
      specs: [
        { label: 'Rated Voltage', value: '24V / 36V / 48V DC' },
        { label: 'Rated Power', value: '100W - 1000W' },
        { label: 'Rated Speed', value: '1000 - 6000 RPM' },
        { label: 'Rated Torque', value: '0.5 - 5.0 N·m' },
        { label: 'Protection Class', value: 'IP55 / IP67' },
        { label: 'Certification', value: 'CE, RoHS' }
      ]
    },
    'fan-1': {
      name: 'Brushless DC Fan - YD-BF120 Series',
      description: 'High-efficiency brushless DC fan with low noise and long service life. Suitable for HVAC systems, server cooling, automotive climate control, and industrial ventilation.',
      specs: [
        { label: 'Rated Voltage', value: '12V / 24V DC' },
        { label: 'Air Flow', value: '50 - 300 CFM' },
        { label: 'Noise Level', value: '≤ 35 dB(A)' },
        { label: 'Life Expectancy', value: '≥ 50,000 hours' },
        { label: 'Protection Class', value: 'IP54' },
        { label: 'Certification', value: 'CE, RoHS, UL' }
      ]
    },
    'gear-1': {
      name: 'DC Gear Motor - YD-GM42 Series',
      description: 'Precision DC gear motor combining high torque output with compact size. Perfect for automation equipment, conveyor systems, medical devices, and smart home applications.',
      specs: [
        { label: 'Rated Voltage', value: '12V / 24V DC' },
        { label: 'Rated Torque', value: '1.0 - 20.0 N·m' },
        { label: 'Gear Ratio', value: '1:5 - 1:200' },
        { label: 'Output Speed', value: '10 - 500 RPM' },
        { label: 'Protection Class', value: 'IP54' },
        { label: 'Certification', value: 'CE, RoHS' }
      ]
    },
    'marine-1': {
      name: 'Marine Propulsion BLDC Motor - YD-MP80 Series',
      description: 'Purpose-built brushless DC motor for electric boat propulsion systems. Features waterproof construction, corrosion resistance, and high thrust output for various watercraft applications.',
      specs: [
        { label: 'Rated Voltage', value: '48V / 72V DC' },
        { label: 'Rated Power', value: '500W - 5000W' },
        { label: 'Thrust', value: '20 - 120 lbs' },
        { label: 'Protection Class', value: 'IP68' },
        { label: 'Material', value: 'Stainless Steel Shaft' },
        { label: 'Certification', value: 'CE, RoHS' }
      ]
    }
  };
}

/* --- Contact Form --- */
function initContactForm() {
  const form = document.getElementById('inquiry-form');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset errors
    form.querySelectorAll('.form-error').forEach(err => err.classList.remove('visible'));
    form.querySelectorAll('.form-control').forEach(ctrl => ctrl.classList.remove('error'));

    // Validate
    let hasError = false;
    const requiredFields = form.querySelectorAll('[required]');

    requiredFields.forEach(field => {
      const errorEl = field.parentElement.querySelector('.form-error');
      if (!field.value.trim()) {
        field.classList.add('error');
        if (errorEl) {
          errorEl.textContent = 'This field is required';
          errorEl.classList.add('visible');
        }
        hasError = true;
      } else if (field.type === 'email' && !isValidEmail(field.value)) {
        field.classList.add('error');
        if (errorEl) {
          errorEl.textContent = 'Please enter a valid email address';
          errorEl.classList.add('visible');
        }
        hasError = true;
      }
    });

    if (hasError) return;

    // Get submit button
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Sending...';
    submitBtn.disabled = true;

    // Collect form data
    const formData = {
      name: form.querySelector('[name="name"]')?.value || '',
      email: form.querySelector('[name="email"]')?.value || '',
      company: form.querySelector('[name="company"]')?.value || '',
      phone: form.querySelector('[name="phone"]')?.value || '',
      product: form.querySelector('[name="product_interest"]')?.value || '',
      message: form.querySelector('[name="message"]')?.value || ''
    };

    // Send via Formspree (or replace with your endpoint)
    try {
      // Using Formspree endpoint - replace with actual endpoint for production
      const response = await fetch('https://formspree.io/f/your-form-id', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Show success
        form.style.display = 'none';
        const successMsg = document.querySelector('.form-success');
        if (successMsg) successMsg.classList.add('visible');
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      // Fallback: show success anyway for demo
      form.style.display = 'none';
      const successMsg = document.querySelector('.form-success');
      if (successMsg) successMsg.classList.add('visible');

      // In production, log or notify the error
      console.warn('Form submission simulated. In production, configure your form endpoint.');
    }

    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* --- Back to Top --- */
function initBackToTop() {
  const btn = document.querySelector('.back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 600) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* --- Tidio Live Chat --- */
function initTidioChat() {
  // Load Tidio script
  const script = document.createElement('script');
  script.src = '//code.tidio.co/XXXXXXXX.js'; // Replace with actual Tidio ID
  script.async = true;

  // Only load in production or if explicitly needed
  // For demo, we'll load a minimal version
  script.onerror = () => {
    console.log('Tidio chat will be available after configuring your Tidio account ID.');
  };

  // Comment out for demo - uncomment when Tidio ID is available
  // document.body.appendChild(script);
}
