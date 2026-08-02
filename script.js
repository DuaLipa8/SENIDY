/* Script dynamique pour navigation, panier, filtre et formulaires */

const navToggle = document.querySelector('.nav-toggle');
const siteNav = document.querySelector('.site-nav');
const cartToggle = document.getElementById('cartToggle');
const cartSidebar = document.getElementById('cartSidebar');
const closeCart = document.getElementById('closeCart');
const cartCount = document.getElementById('cartCount');
const cartContent = document.getElementById('cartContent');
const cartTotal = document.getElementById('cartTotal');
const clearCartButton = document.getElementById('clearCart');
const checkoutButton = document.getElementById('checkoutButton');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckout = document.getElementById('closeCheckout');
const checkoutSummary = document.getElementById('checkoutSummary');
const orderForm = document.getElementById('orderForm');
const quoteForm = document.getElementById('quoteForm');
const heroQuote = document.getElementById('heroQuote');
const contactCta = document.getElementById('contactCta');
const quoteProductButtons = document.querySelectorAll('.quote-product');
const addCartButtons = document.querySelectorAll('.add-cart');
const filterButtons = document.querySelectorAll('.filter-btn');
const productGrid = document.getElementById('productGrid');

const SITE_WHATSAPP_NUMBER = '221709691212';
let cart = {};

function toggleMobileNav() {
  if (siteNav) {
    siteNav.classList.toggle('open');
  }
}

function openCart() {
  if (cartSidebar) {
    cartSidebar.classList.add('open');
    cartSidebar.setAttribute('aria-hidden', 'false');
  }
}

function closeCartSidebar() {
  if (cartSidebar) {
    cartSidebar.classList.remove('open');
    cartSidebar.setAttribute('aria-hidden', 'true');
  }
}

function openCheckout() {
  if (checkoutModal) {
    checkoutModal.classList.add('open');
    checkoutModal.setAttribute('aria-hidden', 'false');
  }
  renderCheckoutSummary();
}

function closeCheckoutModal() {
  if (checkoutModal) {
    checkoutModal.classList.remove('open');
    checkoutModal.setAttribute('aria-hidden', 'true');
  }
}

function updateCartCount() {
  const totalItems = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
  if (cartCount) {
    cartCount.textContent = totalItems;
  }
}

function formatPrice(value) {
  return value.toLocaleString('fr-FR') + ' FCFA';
}

function renderCart() {
  const items = Object.values(cart);
  if (cartContent) {
    cartContent.innerHTML = '';
  }

  if (!items.length) {
    if (cartContent) {
      cartContent.innerHTML = '<p class="empty-cart">Votre panier est vide.</p>';
    }
    if (cartTotal) {
      cartTotal.textContent = formatPrice(0);
    }
    updateCartCount();
    updateCartWarning(items);
    return;
  }

  let total = 0;
  items.forEach(item => {
    const lineTotal = item.price * item.quantity;
    total += lineTotal;

    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <span>${item.price > 0 ? formatPrice(item.price) : 'Sur devis'}</span>
        <div class="quantity-control">
          <button data-action="decrease" data-id="${item.id}" aria-label="Réduire la quantité">-</button>
          <span>${item.quantity}</span>
          <button data-action="increase" data-id="${item.id}" aria-label="Augmenter la quantité">+</button>
        </div>
      </div>
      <div>
        <span>${item.price > 0 ? formatPrice(lineTotal) : 'Sur devis'}</span>
        <button class="btn btn-outline remove-item" data-id="${item.id}">Supprimer</button>
      </div>
    `;

    if (cartContent) {
      cartContent.appendChild(cartItem);
    }
  });

  if (cartTotal) {
    cartTotal.textContent = items.some(item => item.price === 0) ? 'Sur devis' : formatPrice(total);
  }
  updateCartCount();
  updateCartWarning(items);
}

function updateCartWarning(items) {
  const cartWarning = document.getElementById('cartWarning');
  const hasEstimate = items.some(item => item.price === 0);
  if (!cartWarning) return;

  if (hasEstimate) {
    cartWarning.innerHTML = '<p class="warning-text">Ce produit est sur devis. La commande en ligne est désactivée pour les articles sans prix fixe.</p>';
    if (checkoutButton) {
      checkoutButton.disabled = true;
      checkoutButton.classList.add('btn-disabled');
    }
  } else {
    cartWarning.innerHTML = '';
    if (checkoutButton) {
      checkoutButton.disabled = false;
      checkoutButton.classList.remove('btn-disabled');
    }
  }
}

function addToCart(id, name, price) {
  if (!cart[id]) {
    cart[id] = { id, name, price, quantity: 1 };
  } else {
    cart[id].quantity += 1;
  }
  renderCart();
  openCart();
}

function removeCartItem(id) {
  delete cart[id];
  renderCart();
}

function changeCartQuantity(id, delta) {
  if (!cart[id]) return;
  cart[id].quantity += delta;
  if (cart[id].quantity < 1) delete cart[id];
  renderCart();
}

function clearCart() {
  cart = {};
  renderCart();
}

function renderCheckoutSummary() {
  const items = Object.values(cart);
  if (!items.length) {
    if (checkoutSummary) {
      checkoutSummary.innerHTML = '<p>Votre panier est vide. Ajoutez des produits avant de passer commande.</p>';
    }
    if (checkoutButton) {
      checkoutButton.disabled = true;
    }
    return;
  }

  const summary = items.map(item => `
    <p><strong>${item.name}</strong> x${item.quantity} - ${item.price > 0 ? formatPrice(item.price * item.quantity) : 'Sur devis'}</p>
  `).join('');
  const total = items.some(item => item.price === 0) ? 'Sur devis' : formatPrice(items.reduce((sum, item) => sum + item.price * item.quantity, 0));

  if (checkoutSummary) {
    checkoutSummary.innerHTML = `${summary}<p><strong>Total général : ${total}</strong></p>`;
  }
}

function openWhatsApp(message, subject, phone = SITE_WHATSAPP_NUMBER) {
  const whatsappNumber = (phone || SITE_WHATSAPP_NUMBER).replace(/\D/g, '');
  const fullMessage = [subject ? `[${subject}]` : '', message].filter(Boolean).join('\n');
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(fullMessage)}`;
  window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
}

function handleOrderFormSubmit(event) {
  event.preventDefault();
  const nameInput = document.getElementById('orderName');
  const companyInput = document.getElementById('orderCompany');
  const phoneInput = document.getElementById('orderPhone');
  const addressInput = document.getElementById('orderAddress');

  if (!nameInput || !companyInput || !phoneInput || !addressInput) {
    return;
  }

  const name = nameInput.value.trim();
  const company = companyInput.value.trim();
  const phone = phoneInput.value.trim();
  const address = addressInput.value.trim();
  const items = Object.values(cart);

  if (!items.length) {
    alert('Votre panier est vide. Ajoutez des produits avant de passer commande.');
    return;
  }

  const orderLines = items.map(item => `${item.name} x${item.quantity}`).join('\n');
  const total = items.some(item => item.price === 0) ? 'Sur devis' : formatPrice(items.reduce((sum, item) => sum + item.price * item.quantity, 0));

  const message = [
    `Nom: ${name}`,
    `Entreprise: ${company}`,
    `Téléphone: ${phone}`,
    `Adresse: ${address}`,
    '',
    'Produits:',
    orderLines,
    '',
    `Total: ${total}`
  ].join('\n');

  openWhatsApp(message, 'Commande SENIDY TELECOM', SITE_WHATSAPP_NUMBER);
  closeCheckoutModal();
}

function handleQuoteFormSubmit(event) {
  event.preventDefault();
  const nameInput = document.getElementById('clientName');
  const companyInput = document.getElementById('clientCompany');
  const phoneInput = document.getElementById('clientPhone');
  const emailInput = document.getElementById('clientEmail');
  const needInput = document.getElementById('clientNeed');
  const messageInput = document.getElementById('clientMessage');

  if (!nameInput || !companyInput || !phoneInput || !emailInput || !needInput || !messageInput) {
    return;
  }

  const name = nameInput.value.trim();
  const company = companyInput.value.trim();
  const phone = phoneInput.value.trim();
  const email = emailInput.value.trim();
  const need = needInput.value.trim();
  const messageText = messageInput.value.trim();

  const message = [
    `Nom: ${name}`,
    `Entreprise: ${company}`,
    `Téléphone: ${phone}`,
    `Email: ${email}`,
    `Besoin: ${need}`,
    `Message: ${messageText}`
  ].join('\n');

  openWhatsApp(message, 'Demande de devis SENIDY TELECOM', SITE_WHATSAPP_NUMBER);
}


function renderTestimonials(testimonials) {
  const testimonialGrid = document.getElementById('testimonialGrid');
  if (!testimonialGrid) return;

  testimonialGrid.innerHTML = testimonials.map(testimonial => `
    <article class="testimonial-card">
      <p>"${testimonial.message}"</p>
      <div class="testimonial-meta">
        <strong>${testimonial.name} - ${testimonial.company}</strong>
        <span>${'★'.repeat(testimonial.rating)}${'☆'.repeat(5 - testimonial.rating)}</span>
      </div>
    </article>
  `).join('');
}

function loadTestimonials() {
  const stored = window.localStorage.getItem('senidyTestimonials');
  return stored ? JSON.parse(stored) : [];
}

function saveTestimonials(testimonials) {
  window.localStorage.setItem('senidyTestimonials', JSON.stringify(testimonials));
}

function handleTestimonialSubmit(event) {
  event.preventDefault();
  const ratingInput = document.getElementById('testimonialRating');
  const messageInput = document.getElementById('testimonialMessage');

  if (!ratingInput || !messageInput) {
    return;
  }

  const message = messageInput.value.trim();

  if (!message) {
    alert('Veuillez écrire votre témoignage.');
    return;
  }

  const testimonial = {
    name: 'Anonyme',
    company: 'Client',
    rating: Number(ratingInput.value),
    message,
    date: new Date().toISOString()
  };

  const testimonials = loadTestimonials();
  testimonials.unshift(testimonial);
  saveTestimonials(testimonials);
  renderTestimonials(testimonials);
  event.target.reset();
}

function prefillQuote(productName) {
  const quoteFormElement = document.getElementById('quoteForm');
  const needField = document.getElementById('clientNeed');
  const nameField = document.getElementById('clientName');
  const companyField = document.getElementById('clientCompany');
  const phoneField = document.getElementById('clientPhone');
  const emailField = document.getElementById('clientEmail');
  const messageField = document.getElementById('clientMessage');

  if (quoteFormElement) {
    quoteFormElement.reset();
  }

  if (needField) {
    needField.value = `Demande pour ${productName} - quantité souhaitée : `;
  }
  if (nameField) {
    nameField.focus();
  }
  if (companyField) {
    companyField.value = '';
  }
  if (phoneField) {
    phoneField.value = '';
  }
  if (emailField) {
    emailField.value = '';
  }
  if (messageField) {
    messageField.value = '';
  }

  window.location.hash = '#contact';
}

function filterProducts(category) {
  if (!productGrid) {
    return;
  }
  const cards = productGrid.querySelectorAll('.product-card');
  cards.forEach(card => {
    const cardCategory = card.dataset.category;
    if (category === 'all' || cardCategory === category) {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}

function handleScrollAnimations() {
  const revealElements = document.querySelectorAll('.product-card, .step-card, .pricing-card, .testimonial-card, .contact-section, .hero-copy');
  revealElements.forEach(element => {
    const rect = element.getBoundingClientRect();
    if (rect.top < window.innerHeight - 80) {
      element.style.opacity = '1';
      element.style.transform = 'translateY(0)';
    }
  });
}

function initApp() {
  if (navToggle) {
    navToggle.addEventListener('click', toggleMobileNav);
  }
  if (cartToggle) {
    cartToggle.addEventListener('click', openCart);
  }
  if (closeCart) {
    closeCart.addEventListener('click', closeCartSidebar);
  }
  if (clearCartButton) {
    clearCartButton.addEventListener('click', clearCart);
  }
  if (checkoutButton) {
    checkoutButton.addEventListener('click', openCheckout);
  }
  if (closeCheckout) {
    closeCheckout.addEventListener('click', closeCheckoutModal);
  }
  if (orderForm) {
    orderForm.addEventListener('submit', handleOrderFormSubmit);
  }
  if (quoteForm) {
    quoteForm.addEventListener('submit', handleQuoteFormSubmit);
  }
  const testimonialForm = document.getElementById('testimonialForm');
  if (testimonialForm) {
    testimonialForm.addEventListener('submit', handleTestimonialSubmit);
  }
  if (heroQuote) {
    heroQuote.addEventListener('click', () => prefillQuote('postes Alcatel ou coffret OmniPCX'));
  }
  if (contactCta) {
    contactCta.addEventListener('click', () => prefillQuote('postes Alcatel ou coffret OmniPCX'));
  }

  addCartButtons.forEach(button => {
    button.addEventListener('click', () => {
      addToCart(button.dataset.id, button.dataset.name, Number(button.dataset.price));
    });
  });

  quoteProductButtons.forEach(button => {
    button.addEventListener('click', () => prefillQuote(button.dataset.name));
  });

  filterButtons.forEach(button => {
    button.addEventListener('click', () => {
      filterButtons.forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      filterProducts(button.dataset.category);
    });
  });

  if (cartContent) {
    cartContent.addEventListener('click', event => {
      const action = event.target.dataset.action;
      const id = event.target.dataset.id;
      if (action === 'increase') {
        changeCartQuantity(id, 1);
      }
      if (action === 'decrease') {
        changeCartQuantity(id, -1);
      }
      if (event.target.classList.contains('remove-item')) {
        removeCartItem(id);
      }
    });
  }

  window.addEventListener('scroll', handleScrollAnimations);
  handleScrollAnimations();
  renderTestimonials(loadTestimonials());
}

initApp();
window.addEventListener('load', () => {
  renderCart();
  handleScrollAnimations();
});
