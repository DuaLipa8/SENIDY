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
const SUPABASE_URL = window.SUPABASE_URL || '';
const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';
const supabaseClient = (window.supabase && SUPABASE_URL && SUPABASE_ANON_KEY)
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;
const isSupabaseReady = Boolean(supabaseClient && SUPABASE_URL && SUPABASE_ANON_KEY);

if (SUPABASE_URL && SUPABASE_ANON_KEY && !supabaseClient) {
  console.warn('Supabase configuration is present, but the client could not be created.');
}

async function saveQuoteRequest(quote) {
  if (!isSupabaseReady) return;

  const { error } = await supabaseClient
    .from('quotes')
    .insert([quote]);

  if (error) {
    console.warn('Could not save quote request to Supabase:', error.message);
  }
}

async function saveOrderRequest(order) {
  if (!isSupabaseReady) return;

  const { error } = await supabaseClient
    .from('orders')
    .insert([order]);

  if (error) {
    console.warn('Could not save order request to Supabase:', error.message);
  }
}

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

  saveOrderRequest({
    name,
    company,
    phone,
    address,
    order_lines: orderLines,
    total,
    created_at: new Date().toISOString(),
  });

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

  saveQuoteRequest({
    name,
    company,
    phone,
    email,
    need,
    message: messageText,
    created_at: new Date().toISOString(),
  });

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
  const testimonials = stored ? JSON.parse(stored) : [];

  if (!supabaseClient) {
    return testimonials;
  }

  supabaseClient
    .from('testimonials')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20)
    .then(({ data, error }) => {
      if (error) {
        console.warn('Supabase testimonials load failed:', error.message);
        return;
      }
      if (data && data.length) {
        renderTestimonials(data);
        window.localStorage.setItem('senidyTestimonials', JSON.stringify(data));
      }
    })
    .catch((error) => {
      console.warn('Supabase testimonials request failed:', error.message || error);
    });

  return testimonials;
}

function saveTestimonials(testimonials) {
  window.localStorage.setItem('senidyTestimonials', JSON.stringify(testimonials));

  if (!supabaseClient || !testimonials.length) {
    return;
  }

  const latest = testimonials[0];
  if (!latest || latest.synced) {
    return;
  }

  supabaseClient
    .from('testimonials')
    .insert([{ name: latest.name, company: latest.company, rating: latest.rating, message: latest.message, created_at: latest.date }])
    .then(({ error }) => {
      if (error) {
        console.warn('Could not save testimonial to Supabase:', error.message);
        return;
      }
      latest.synced = true;
      window.localStorage.setItem('senidyTestimonials', JSON.stringify(testimonials));
    })
    .catch((error) => {
      console.warn('Supabase insert failed:', error.message || error);
    });
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

let currentCategory = 'all';
let currentPage = 1;
const ITEMS_PER_PAGE = 6;

function filterProducts(category) {
  currentCategory = category;
  currentPage = 1;
  updatePagination();
  handleScrollAnimations();
}

function updatePagination() {
  const paginationContainer = document.getElementById('pagination');
  if (!productGrid || !paginationContainer) {
    return;
  }
  const cards = Array.from(productGrid.querySelectorAll('.product-card'));
  
  // Filter cards by category
  const filteredCards = cards.filter(card => {
    const cardCategory = card.dataset.category;
    return currentCategory === 'all' || cardCategory === currentCategory;
  });

  const totalPages = Math.ceil(filteredCards.length / ITEMS_PER_PAGE);

  // Hide all cards first
  cards.forEach(card => {
    card.style.display = 'none';
  });

  // Show only cards for the current page
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const pageCards = filteredCards.slice(startIndex, endIndex);
  pageCards.forEach(card => {
    card.style.display = '';
  });

  // Render pagination buttons
  paginationContainer.innerHTML = '';
  if (totalPages <= 1) {
    return; // No pagination UI needed if only 1 page
  }

  const scrollToProducts = () => {
    const productsSection = document.getElementById('produits');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Previous button (arrow)
  const prevBtn = document.createElement('button');
  prevBtn.className = 'pagination-btn prev';
  prevBtn.innerHTML = '‹';
  prevBtn.setAttribute('aria-label', 'Page précédente');
  prevBtn.disabled = currentPage === 1;
  prevBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      updatePagination();
      scrollToProducts();
    }
  });
  paginationContainer.appendChild(prevBtn);

  // Page numbers
  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.className = 'pagination-btn' + (i === currentPage ? ' active' : '');
    button.textContent = i;
    button.setAttribute('aria-label', `Page ${i}`);
    button.addEventListener('click', () => {
      if (currentPage !== i) {
        currentPage = i;
        updatePagination();
        scrollToProducts();
      }
    });
    paginationContainer.appendChild(button);
  }

  // Next button (arrow)
  const nextBtn = document.createElement('button');
  nextBtn.className = 'pagination-btn next';
  nextBtn.innerHTML = '›';
  nextBtn.setAttribute('aria-label', 'Page suivante');
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      updatePagination();
      scrollToProducts();
    }
  });
  paginationContainer.appendChild(nextBtn);
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

function initHeroCarousel() {
  const heroCarousel = document.querySelector('.hero-carousel');
  const slides = Array.from(document.querySelectorAll('.hero-carousel .hero-image'));
  const prevButton = document.querySelector('.hero-carousel .carousel-btn.prev');
  const nextButton = document.querySelector('.hero-carousel .carousel-btn.next');
  const dotsContainer = document.querySelector('.hero-carousel .carousel-dots');

  if (!heroCarousel || !slides.length) {
    return;
  }

  let activeIndex = 0;
  let autoplayId = null;

  function renderDots() {
    if (!dotsContainer) return;

    dotsContainer.innerHTML = '';
    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = `carousel-dot${index === activeIndex ? ' active' : ''}`;
      dot.setAttribute('aria-label', `Afficher l'image ${index + 1}`);
      dot.addEventListener('click', () => {
        showSlide(index);
        restartAutoplay();
      });
      dotsContainer.appendChild(dot);
    });
  }

  function showSlide(index) {
    const previousIndex = activeIndex;
    activeIndex = (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.remove('is-active', 'is-leaving');
      if (slideIndex === previousIndex && slideIndex !== activeIndex) {
        slide.classList.add('is-leaving');
      }
      if (slideIndex === activeIndex) {
        slide.classList.add('is-active');
      }
    });

    renderDots();
  }

  function nextSlide() {
    showSlide(activeIndex + 1);
  }

  function restartAutoplay() {
    if (autoplayId) {
      window.clearInterval(autoplayId);
    }
    autoplayId = window.setInterval(nextSlide, 3000);
  }

  if (prevButton) {
    prevButton.addEventListener('click', () => {
      showSlide(activeIndex - 1);
      restartAutoplay();
    });
  }

  if (nextButton) {
    nextButton.addEventListener('click', () => {
      showSlide(activeIndex + 1);
      restartAutoplay();
    });
  }

  heroCarousel.addEventListener('mouseenter', () => {
    if (autoplayId) {
      window.clearInterval(autoplayId);
    }
  });

  heroCarousel.addEventListener('mouseleave', restartAutoplay);

  showSlide(0);
  restartAutoplay();
}

function initApp() {
  if (navToggle) {
    navToggle.addEventListener('click', toggleMobileNav);
  }
  if (siteNav) {
    siteNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        siteNav.classList.remove('open');
      });
    });
  }
  document.addEventListener('click', (event) => {
    if (siteNav && siteNav.classList.contains('open')) {
      if (navToggle && !navToggle.contains(event.target) && !siteNav.contains(event.target)) {
        siteNav.classList.remove('open');
      }
    }
  });
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

  initHeroCarousel();
  window.addEventListener('scroll', handleScrollAnimations);
  handleScrollAnimations();
  renderTestimonials(loadTestimonials());
  filterProducts('all');
}

initApp();
window.addEventListener('load', () => {
  renderCart();
  handleScrollAnimations();
});
