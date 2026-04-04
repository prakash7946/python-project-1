/* ============================================
   ELEGANCE DRESS STORE — SCRIPT.JS
   Complete e-commerce logic:
   - Product catalog & rendering
   - Search & filter
   - Cart system (add/remove/qty)
   - Checkout flow (3 steps)
   - Order confirmation & REAL email via Flask
   - Toast notifications
   - Scroll effects
   ============================================ */

/* Flask backend URL — dynamic for production and local */
const API_BASE = window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'http://localhost:5000' : '';

'use strict';

/* ==================== PRODUCTS DATA ==================== */
const PRODUCTS = [
  {
    id: 1,
    name: "Blossom Floral Maxi Dress",
    price: 1899,
    originalPrice: 2999,
    discount: 37,
    image: "images/dress_1.png",
    rating: 4.8,
    reviewCount: 342,
    sizes: ["L", "XL", "XXL"],
    badge: "sale",
    category: "casual",
    description: "A breathtaking floral maxi dress perfect for summer outings."
  },
  {
    id: 2,
    name: "Velvet Rouge Evening Gown",
    price: 3499,
    originalPrice: 5499,
    discount: 36,
    image: "images/dress_2.png",
    rating: 4.9,
    reviewCount: 218,
    sizes: ["L", "XL"],
    badge: "hot",
    category: "evening",
    description: "Luxurious red velvet evening gown for the most glamorous occasions."
  },
  {
    id: 3,
    name: "Azure Midi A-Line Dress",
    price: 2199,
    originalPrice: 3199,
    discount: 31,
    image: "images/dress_3.png",
    rating: 4.7,
    reviewCount: 189,
    sizes: ["L", "XL", "XXL"],
    badge: "new",
    category: "party",
    description: "Chic royal blue midi dress that transitions from day to night."
  },
  {
    id: 4,
    name: "Midnight Lace Cocktail Dress",
    price: 2750,
    originalPrice: 3999,
    discount: 31,
    image: "images/dress_4.png",
    rating: 4.6,
    reviewCount: 156,
    sizes: ["L", "XL", "XXL"],
    badge: null,
    category: "party",
    description: "Sleek black lace cocktail dress that oozes modern elegance."
  },
  {
    id: 5,
    name: "Sunshine Wrap Sundress",
    price: 1499,
    originalPrice: 2199,
    discount: 32,
    image: "images/dress_5.png",
    rating: 4.5,
    reviewCount: 273,
    sizes: ["L", "XL", "XXL"],
    badge: "sale",
    category: "summer",
    description: "Vibrant yellow wrap dress for a bright, carefree summer look."
  },
  {
    id: 6,
    name: "Emerald Drape Wrap Dress",
    price: 2350,
    originalPrice: 3499,
    discount: 33,
    image: "images/dress_6.png",
    rating: 4.8,
    reviewCount: 201,
    sizes: ["L", "XL"],
    badge: "new",
    category: "casual",
    description: "Deep emerald wrap dress with elegant draping for a sophisticated look."
  },
  {
    id: 7,
    name: "Rose Blush Bodycon Dress",
    price: 1999,
    originalPrice: 2899,
    discount: 31,
    image: "images/dress_7.png",
    rating: 4.7,
    reviewCount: 312,
    sizes: ["L", "XL", "XXL"],
    badge: "hot",
    category: "party",
    description: "Glamorous rose pink bodycon dress that flatters every curve."
  },
  {
    id: 8,
    name: "Ivory Lace Bridal Maxi",
    price: 4999,
    originalPrice: 7999,
    discount: 38,
    image: "images/dress_8.png",
    rating: 5.0,
    reviewCount: 97,
    sizes: ["L", "XL", "XXL"],
    badge: "new",
    category: "bridal",
    description: "Breathtaking white lace maxi dress for your most special day."
  },
  {
    id: 9,
    name: "Urban White Graphic Tee",
    price: 799,
    originalPrice: 1299,
    discount: 38,
    image: "images/tshirt_1.png",
    rating: 4.6,
    reviewCount: 185,
    sizes: ["L", "XL", "XXL"],
    badge: "new",
    category: "tshirt",
    description: "Clean white graphic tee with a modern print — perfect for everyday casual wear."
  },
  {
    id: 10,
    name: "Noir Oversized Tee",
    price: 899,
    originalPrice: 1499,
    discount: 40,
    image: "images/tshirt_2.png",
    rating: 4.8,
    reviewCount: 231,
    sizes: ["L", "XL", "XXL"],
    badge: "hot",
    category: "tshirt",
    description: "Chic black oversized t-shirt — effortlessly stylish for any relaxed occasion."
  },
  {
    id: 11,
    name: "Blush Pink Crop Tee",
    price: 699,
    originalPrice: 1099,
    discount: 36,
    image: "images/tshirt_3.png",
    rating: 4.7,
    reviewCount: 142,
    sizes: ["L", "XL"],
    badge: "new",
    category: "tshirt",
    description: "Trendy pastel pink crop t-shirt — cute, comfortable and Instagram-ready."
  },
  {
    id: 12,
    name: "Classic Navy Stripe Tee",
    price: 749,
    originalPrice: 1199,
    discount: 38,
    image: "images/tshirt_4.png",
    rating: 4.5,
    reviewCount: 98,
    sizes: ["L", "XL", "XXL"],
    badge: "sale",
    category: "tshirt",
    description: "Timeless navy striped t-shirt — a wardrobe essential for a polished casual look."
  }
];

/* ==================== STATE ==================== */
let cart = JSON.parse(localStorage.getItem('elegance-cart')) || [];
let filteredProducts = [...PRODUCTS];
let activeSize = 'all';
let activeSort = 'default';
let searchQuery = '';

/* ==================== UTILS ==================== */

/** Format price to Indian Rupee */
function formatPrice(num) {
  return '₹' + num.toLocaleString('en-IN');
}

/** Generate star rating HTML */
function renderStars(rating) {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  let stars = '';
  for (let i = 0; i < full; i++) stars += '★';
  if (half) stars += '½';
  while (stars.replace('½','').length < 5) stars += '☆';
  return stars;
}

/** Save cart to localStorage */
function saveCart() {
  localStorage.setItem('elegance-cart', JSON.stringify(cart));
}

/** Get total cart items count */
function getTotalItems() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

/** Get cart subtotal */
function getSubtotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

/** Random ID generator */
function generateOrderId() {
  return 'ELG-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).substr(2, 4).toUpperCase();
}

/* ==================== TOAST SYSTEM ==================== */
function showToast(message, type = 'info', duration = 3000) {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icons = { success: '✅', error: '❌', info: '🛍️' };
  toast.innerHTML = `<span>${icons[type] || '💬'}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove());
  }, duration);
}

/* ==================== PRODUCT RENDERING ==================== */

/** Build the product card HTML */
function createProductCard(product, index) {
  const badgeHTML = product.badge
    ? `<div class="product-badge badge-${product.badge}">${product.badge === 'sale' ? '🏷️ Sale' : product.badge === 'new' ? '✨ New' : '🔥 Hot'}</div>`
    : '';

  const sizesHTML = product.sizes.map(size =>
    `<button class="size-btn" data-product-id="${product.id}" data-size="${size}" onclick="selectSize(${product.id}, '${size}', this)">${size}</button>`
  ).join('');

  return `
    <div class="product-card" style="animation-delay: ${index * 0.07}s" data-id="${product.id}" data-category="${product.category}" data-sizes="${product.sizes.join(',')}">
      ${badgeHTML}
      <button class="card-wishlist" onclick="toggleWishlist(this)" aria-label="Add to wishlist">🤍</button>
      <div class="product-img-wrapper">
        <img src="${product.image}" alt="${product.name}" class="product-img" loading="lazy" />
        <div class="quick-view-btn">👁 Quick View</div>
      </div>
      <div class="product-info">
        <div class="product-name">${product.name}</div>
        <div class="product-rating">
          <span class="stars-display">${renderStars(product.rating)}</span>
          <span class="rating-count">(${product.reviewCount})</span>
        </div>
        <div class="product-price-row">
          <span class="product-price">${formatPrice(product.price)}</span>
          <span class="product-original-price">${formatPrice(product.originalPrice)}</span>
          <span class="product-discount">${product.discount}% OFF</span>
        </div>
        <div class="size-options">
          <span class="size-label">Size:</span>
          ${sizesHTML}
        </div>
        <button class="add-to-cart-btn" onclick="addToCart(${product.id})">
          <span class="btn-icon">🛒</span> Add to Cart
        </button>
      </div>
    </div>
  `;
}

/** Render all (filtered) products */
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  const noResults = document.getElementById('noResults');
  const resultsCount = document.getElementById('resultsCount');

  // Apply search filter
  let results = PRODUCTS.filter(p => {
    const q = searchQuery.toLowerCase();
    return !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
  });

  // Apply size filter
  if (activeSize !== 'all') {
    results = results.filter(p => p.sizes.includes(activeSize));
  }

  // Apply sort
  if (activeSort === 'price-asc') results.sort((a, b) => a.price - b.price);
  else if (activeSort === 'price-desc') results.sort((a, b) => b.price - a.price);
  else if (activeSort === 'rating') results.sort((a, b) => b.rating - a.rating);

  filteredProducts = results;

  if (results.length === 0) {
    grid.innerHTML = '';
    noResults.style.display = 'block';
    resultsCount.textContent = '0 dresses found';
  } else {
    noResults.style.display = 'none';
    grid.innerHTML = results.map((p, i) => createProductCard(p, i)).join('');
    resultsCount.textContent = `${results.length} dress${results.length !== 1 ? 'es' : ''} found`;
  }
}

/* ==================== SIZE SELECTION ==================== */
function selectSize(productId, size, btn) {
  // Deselect siblings in the same product card
  const card = btn.closest('.product-card');
  card.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  btn.dataset.selectedSize = size;
}

/* ==================== WISHLIST ==================== */
function toggleWishlist(btn) {
  const isActive = btn.classList.toggle('active');
  btn.textContent = isActive ? '❤️' : '🤍';
  showToast(isActive ? 'Added to wishlist!' : 'Removed from wishlist', 'info', 2000);
}

/* ==================== CART FUNCTIONS ==================== */

/** Add item to cart */
function addToCart(productId) {
  const product = PRODUCTS.find(p => p.id === productId);
  if (!product) return;

  // Check if a size is selected
  const card = document.querySelector(`.product-card[data-id="${productId}"]`);
  const sizeBtn = card ? card.querySelector('.size-btn.selected') : null;
  const size = sizeBtn ? sizeBtn.dataset.size : product.sizes[0];

  // Ensure default size is "selected" visually
  if (!sizeBtn && card) {
    const firstSizeBtn = card.querySelector('.size-btn');
    if (firstSizeBtn) firstSizeBtn.classList.add('selected');
  }

  // Check if item with same id + size already exists
  const existing = cart.find(item => item.id === productId && item.size === size);
  if (existing) {
    existing.qty += 1;
    showToast(`${product.name} (${size}) quantity updated!`, 'success');
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      size: size,
      qty: 1
    });
    showToast(`${product.name} added to cart!`, 'success');
  }

  saveCart();
  updateCartUI();

  // Bump animation on cart icon
  const badge = document.getElementById('cartBadge');
  badge.classList.remove('bump');
  void badge.offsetWidth; // reflow
  badge.classList.add('bump');
}

/** Remove item from cart */
function removeFromCart(productId, size) {
  cart = cart.filter(item => !(item.id === productId && item.size === size));
  saveCart();
  updateCartUI();
  showToast('Item removed from cart', 'error', 2000);
}

/** Update item quantity */
function updateQty(productId, size, delta) {
  const item = cart.find(i => i.id === productId && i.size === size);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    removeFromCart(productId, size);
    return;
  }
  saveCart();
  updateCartUI();
}

/** Update all cart UI elements */
function updateCartUI() {
  const total = getTotalItems();
  const subtotal = getSubtotal();
  const shipping = subtotal >= 999 ? 0 : 99;
  const grandTotal = subtotal + shipping;

  // Badge
  const badge = document.getElementById('cartBadge');
  badge.textContent = total;
  badge.classList.toggle('visible', total > 0);

  // Item count in sidebar header
  document.getElementById('cartItemCount').textContent = `(${total} item${total !== 1 ? 's' : ''})`;

  // Cart body
  const cartBody = document.getElementById('cartBody');
  const cartEmpty = document.getElementById('cartEmpty');
  const cartFooter = document.getElementById('cartFooter');

  if (cart.length === 0) {
    cartBody.innerHTML = '';
    cartBody.appendChild(cartEmpty);
    cartEmpty.style.display = 'block';
    cartFooter.style.display = 'none';
  } else {
    cartEmpty.style.display = 'none';
    cartBody.innerHTML = cart.map(item => `
      <div class="cart-item" data-id="${item.id}" data-size="${item.size}">
        <img class="cart-item-img" src="${item.image}" alt="${item.name}" />
        <div class="cart-item-details">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-size">Size: ${item.size}</div>
          <div class="cart-item-price">${formatPrice(item.price * item.qty)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="updateQty(${item.id}, '${item.size}', -1)">−</button>
            <span class="qty-display">${item.qty}</span>
            <button class="qty-btn" onclick="updateQty(${item.id}, '${item.size}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id}, '${item.size}')" aria-label="Remove item">🗑️</button>
      </div>
    `).join('');
    cartBody.appendChild(cartEmpty);
    cartFooter.style.display = 'block';
  }

  // Totals
  document.getElementById('cartSubtotal').textContent = formatPrice(subtotal);
  document.getElementById('cartShipping').textContent = shipping === 0 ? 'FREE 🎉' : formatPrice(shipping);
  document.getElementById('cartTotal').textContent = formatPrice(grandTotal);
}

/** Clear entire cart */
function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
  showToast('Cart cleared', 'error', 2000);
}

/* ==================== CART SIDEBAR TOGGLE ==================== */
function openCart() {
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

/* ==================== FILTER & SEARCH ==================== */

/** Clear all filters */
function clearFilters() {
  searchQuery = '';
  activeSize = 'all';
  activeSort = 'default';
  document.getElementById('searchInput').value = '';
  document.querySelectorAll('.size-filter-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('filter-all').classList.add('active');
  document.getElementById('sortSelect').value = 'default';
  renderProducts();
}

/* ==================== CHECKOUT ==================== */

let currentStep = 1;
let customerData = {};

/** Open checkout modal */
function openCheckout() {
  if (cart.length === 0) {
    showToast('Your cart is empty!', 'error');
    return;
  }
  closeCart();
  currentStep = 1;
  showStep(1);
  document.getElementById('checkoutOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

/** Close checkout modal */
function closeCheckout() {
  document.getElementById('checkoutOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

/** Show a specific step */
function showStep(step) {
  [1, 2, 3].forEach(s => {
    document.getElementById(`checkoutStep${s}`).classList.remove('active');
    const dot = document.getElementById(`step${s}-dot`);
    dot.classList.remove('active', 'done');
    if (s < step) dot.classList.add('done');
  });
  document.getElementById(`checkoutStep${step}`).classList.add('active');
  document.getElementById(`step${step}-dot`).classList.add('active');
  currentStep = step;
}

/** Validate step 1 form */
function validateStep1() {
  let valid = true;
  const fields = [
    { id: 'custName', errId: 'nameError', msg: 'Please enter your full name', minLen: 2 },
    { id: 'custPhone', errId: 'phoneError', msg: 'Please enter a valid 10-digit phone number', pattern: /^\+?[0-9\s]{10,15}$/ },
    { id: 'custEmail', errId: 'emailError', msg: 'Please enter a valid email address', pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    { id: 'custAddress', errId: 'addressError', msg: 'Please enter your delivery address', minLen: 10 }
  ];

  fields.forEach(f => {
    const input = document.getElementById(f.id);
    const err = document.getElementById(f.errId);
    const val = input.value.trim();
    let ok = true;

    if (!val) { ok = false; }
    else if (f.minLen && val.length < f.minLen) { ok = false; }
    else if (f.pattern && !f.pattern.test(val)) { ok = false; }

    if (!ok) {
      input.classList.add('error');
      if (err) err.textContent = f.msg;
      valid = false;
    } else {
      input.classList.remove('error');
      if (err) err.textContent = '';
    }
  });

  // City & PIN
  const city = document.getElementById('custCity').value.trim();
  const pin = document.getElementById('custPin').value.trim();
  if (!city || !pin || pin.length !== 6 || isNaN(pin)) {
    valid = false;
    showToast('Please fill city and valid 6-digit PIN code', 'error');
  }

  return valid;
}

/** Populate order summary mini in step 2 */
function populateOrderSummary() {
  const container = document.getElementById('orderSummaryMini');
  const subtotal = getSubtotal();
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  container.innerHTML = `
    <h4>Order Summary</h4>
    ${cart.map(item => `
      <div class="mini-item">
        <span>${item.name} (${item.size}) × ${item.qty}</span>
        <span>${formatPrice(item.price * item.qty)}</span>
      </div>
    `).join('')}
    <div class="mini-item">
      <span>Shipping</span>
      <span>${shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
    </div>
    <div class="mini-total">
      <span>Total</span>
      <span>${formatPrice(total)}</span>
    </div>
  `;
}

/** Simulate confetti */
function launchConfetti() {
  const container = document.getElementById('confettiContainer');
  container.innerHTML = '';
  const colors = ['#c9547a', '#f0a500', '#2ed573', '#a29bfe', '#fd79a8', '#00cec9', '#e17055'];
  const shapes = ['square', 'circle'];
  for (let i = 0; i < 50; i++) {
    const piece = document.createElement('div');
    piece.className = 'confetti-piece';
    piece.style.left = Math.random() * 100 + '%';
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDelay = Math.random() * 0.8 + 's';
    piece.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
    piece.style.width = (6 + Math.random() * 8) + 'px';
    piece.style.height = (6 + Math.random() * 8) + 'px';
    piece.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    container.appendChild(piece);
  }
}

/**
 * Build a WhatsApp message text for the owner with full order details.
 */
function buildWhatsAppMessage(orderData) {
  const { orderId, date, customer, items, subtotal, shipping, total } = orderData;
  const itemLines = items.map(item =>
    `  • ${item.name} (Size: ${item.size}) x${item.qty} = ${formatPrice(item.price * item.qty)}`
  ).join('%0A');

  const msg =
    `🛍️ *NEW ORDER — april-86*%0A` +
    `━━━━━━━━━━━━━━━━━━━━━━━━%0A` +
    `📦 *Order ID:* ${orderId}%0A` +
    `📅 *Date:* ${date}%0A%0A` +
    `👤 *Customer Details*%0A` +
    `Name: ${customer.name}%0A` +
    `Phone: ${customer.phone}%0A` +
    `Email: ${customer.email}%0A` +
    `Address: ${customer.address}, ${customer.city} - ${customer.pin}%0A%0A` +
    `🛒 *Items Ordered*%0A` +
    `${itemLines}%0A%0A` +
    `━━━━━━━━━━━━━━━━━━━━━━━━%0A` +
    `Subtotal: ${formatPrice(subtotal)}%0A` +
    `Shipping: ${shipping === 0 ? 'FREE 🎉' : formatPrice(shipping)}%0A` +
    `*TOTAL: ${formatPrice(total)}*%0A%0A` +
    `💳 Payment via GPay/PhonePe/Paytm to 9344709406%0A` +
    `━━━━━━━━━━━━━━━━━━━━━━━━`;
  return msg;
}

/**
 * Open WhatsApp with pre-filled order message to the owner.
 * Uses wa.me link — works on mobile (opens app) and desktop (opens WhatsApp Web).
 */
function notifyOwnerWhatsApp(orderData) {
  const OWNER_PHONE = '919344709406'; // India +91
  const message = buildWhatsAppMessage(orderData);
  const url = `https://wa.me/${OWNER_PHONE}?text=${message}`;
  window.open(url, '_blank');
}

/**
 * Send WhatsApp directly to owner via Flask backend (CallMeBot API).
 * Returns true if sent successfully, false otherwise.
 */
async function sendWhatsAppBackend(orderData) {
  try {
    const response = await fetch(`${API_BASE}/send-whatsapp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const result = await response.json();
    return result.success === true;
  } catch (err) {
    console.warn('WhatsApp backend notification failed:', err.message);
    return false;
  }
}

/**
 * Send real order confirmation email via Flask backend.
 * Calls POST /send-order-email with the full order payload.
 * Returns a Promise that resolves when done.
 */
async function sendOrderEmail(orderData) {
  try {
    const response = await fetch(`${API_BASE}/send-order-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderData)
    });
    const result = await response.json();
    if (result.success) {
      console.log('✅ Order email sent successfully! Order ID:', orderData.orderId);
      return true;
    } else {
      console.error('❌ Email server error:', result.error);
      return false;
    }
  } catch (err) {
    console.error('❌ Could not reach email server:', err.message);
    return false;
  }
}

/** Place order - final step (calls real email API) */
async function placeOrder() {
  const btn = document.getElementById('placeOrderBtn');
  btn.disabled = true;
  btn.querySelector('#placeOrderText').textContent = '⏳ Processing...';

  // Small UX delay so the user sees the loading state
  await new Promise(resolve => setTimeout(resolve, 1000));

  const subtotal = getSubtotal();
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;
  const orderId = generateOrderId();
  const now = new Date();

  customerData = {
    name: document.getElementById('custName').value.trim(),
    phone: document.getElementById('custPhone').value.trim(),
    email: document.getElementById('custEmail').value.trim(),
    address: document.getElementById('custAddress').value.trim(),
    city: document.getElementById('custCity').value.trim(),
    pin: document.getElementById('custPin').value.trim()
  };

  const orderData = {
    orderId,
    date: now.toLocaleString('en-IN'),
    customer: customerData,
    items: [...cart],
    subtotal,
    shipping,
    total
  };

  // --- Send REAL email via Flask backend ---
  btn.querySelector('#placeOrderText').textContent = '📧 Sending email...';
  const emailSent = await sendOrderEmail(orderData);

  // --- Send WhatsApp DIRECTLY to owner via CallMeBot (no popup, no user action needed) ---
  btn.querySelector('#placeOrderText').textContent = '📲 Sending WhatsApp to owner...';
  const waSent = await sendWhatsAppBackend(orderData);

  // --- Show confirmation screen regardless ---
  showStep(3);
  document.getElementById('orderId').textContent = orderId;
  document.getElementById('confirmEmail').textContent = customerData.email;

  document.getElementById('confirmDetails').innerHTML = `
    <p>👤 <strong>${customerData.name}</strong></p>
    <p>📞 <strong>${customerData.phone}</strong></p>
    <p>📧 <strong>${customerData.email}</strong></p>
    <p>📍 <strong>${customerData.address}, ${customerData.city} - ${customerData.pin}</strong></p>
    <p>📅 <strong>${orderData.date}</strong></p>
    <p>💳 Pay via Phone: <strong>9344709406</strong></p>
  `;

  // Summary table (with product image thumbnails)
  const table = document.getElementById('summaryTable');
  table.innerHTML = `
    <thead>
      <tr>
        <th colspan="2">Product</th>
        <th>Size</th>
        <th>Qty</th>
        <th>Amount</th>
      </tr>
    </thead>
    <tbody>
      ${orderData.items.map(item => `
        <tr>
          <td style="width:54px;padding:8px 6px;">
            <img src="${item.image}" alt="${item.name}"
              style="width:46px;height:54px;object-fit:cover;border-radius:6px;display:block;">
          </td>
          <td style="font-weight:600;font-size:13px;">${item.name}</td>
          <td>${item.size}</td>
          <td>${item.qty}</td>
          <td>${formatPrice(item.price * item.qty)}</td>
        </tr>
      `).join('')}
      <tr>
        <td colspan="4">Shipping</td>
        <td>${shipping === 0 ? 'FREE 🎉' : formatPrice(shipping)}</td>
      </tr>
      <tr>
        <td colspan="4"><strong>Grand Total</strong></td>
        <td><strong>${formatPrice(total)}</strong></td>
      </tr>
    </tbody>
  `;

  // Update email notice based on result
  const emailNotice = document.querySelector('.email-notice');
  if (emailNotice) {
    if (emailSent) {
      emailNotice.style.background = 'rgba(46, 213, 115, 0.1)';
      emailNotice.style.borderColor = 'rgba(46,213,115,0.3)';
      emailNotice.style.color = '#1b7e3d';
      emailNotice.innerHTML = `<span class="email-icon">📧</span><span>Order confirmation email sent to <strong>${customerData.email}</strong> ✅</span>`;
    } else {
      emailNotice.style.background = 'rgba(255,193,7,0.1)';
      emailNotice.style.borderColor = 'rgba(255,193,7,0.4)';
      emailNotice.style.color = '#856404';
      emailNotice.innerHTML = `<span class="email-icon">⚠️</span><span>Email server offline. Start <code>app.py</code> to enable emails.</span>`;
    }
  }

  // Wire up the manual WhatsApp button (fallback if auto-send failed)
  const waBtn = document.getElementById('manualWhatsappBtn');
  if (waBtn) {
    const waMsg = buildWhatsAppMessage(orderData);
    waBtn.href = `https://wa.me/919344709406?text=${waMsg}`;
    // Show manual button only if direct send failed
    waBtn.style.display = waSent ? 'none' : 'flex';
  }

  // Update WhatsApp notice
  const waNotice = document.getElementById('whatsappNotice');
  if (waNotice) {
    if (waSent) {
      waNotice.style.background = 'rgba(37,211,102,0.1)';
      waNotice.style.borderColor = 'rgba(37,211,102,0.4)';
      waNotice.style.color = '#0b6e4f';
      waNotice.innerHTML = `<span class="email-icon">📲</span><span>Order details sent directly to owner on <strong>WhatsApp</strong> ✅</span>`;
    } else {
      waNotice.style.background = 'rgba(255,193,7,0.1)';
      waNotice.style.borderColor = 'rgba(255,193,7,0.4)';
      waNotice.style.color = '#856404';
      waNotice.innerHTML = `<span class="email-icon">⚠️</span><span>Auto WhatsApp needs setup. Use the button below to send manually.</span>`;
    }
  }

  // Show toast
  if (emailSent) {
    showToast('📧 Order email sent to your inbox!', 'success', 4000);
  } else {
    showToast('⚠️ Order saved! Run app.py to enable emails.', 'info', 5000);
  }

  // Clear cart
  cart = [];
  saveCart();
  updateCartUI();

  // Launch confetti
  launchConfetti();

  btn.disabled = false;
  btn.querySelector('#placeOrderText').textContent = 'Place Order 🎉';
}

/* ==================== HEADER SCROLL EFFECT ==================== */
window.addEventListener('scroll', () => {
  const header = document.getElementById('header');
  header.classList.toggle('scrolled', window.scrollY > 50);

  const backToTop = document.getElementById('backToTop');
  backToTop.classList.toggle('visible', window.scrollY > 400);
}, { passive: true });

/* ==================== INIT & EVENT LISTENERS ==================== */
document.addEventListener('DOMContentLoaded', () => {

  // Initial render
  renderProducts();
  updateCartUI();

  // --- Check WhatsApp (CallMeBot) status & show setup banner if not configured ---
  fetch(`${API_BASE}/whatsapp-status`)
    .then(r => r.json())
    .then(data => {
      if (!data.configured) {
        const banner = document.createElement('div');
        banner.id = 'waBanner';
        banner.innerHTML = `
          <div style="background:linear-gradient(135deg,#25d366,#128c7e);color:#fff;padding:14px 24px;
            display:flex;align-items:center;justify-content:space-between;gap:16px;
            font-family:var(--font-body);font-size:0.88rem;flex-wrap:wrap;position:relative;z-index:999;">
            <div style="display:flex;align-items:center;gap:12px;">
              <span style="font-size:1.5rem;">📲</span>
              <div>
                <strong style="display:block;font-size:0.95rem;margin-bottom:2px;">WhatsApp Direct Notification — Setup Required (Once)</strong>
                <span style="opacity:0.9;">
                  1. Save <strong>+34 644 59 78 11</strong> as <em>"CallMeBot"</em> in your WhatsApp &nbsp;|&nbsp;
                  2. Send: <strong>"I allow callmebot to send me messages"</strong> &nbsp;|&nbsp;
                  3. Paste the API key into <code style="background:rgba(0,0,0,0.2);padding:2px 6px;border-radius:4px;">app.py → CALLMEBOT_APIKEY</code> &nbsp;|&nbsp;
                  4. Restart app.py
                </span>
              </div>
            </div>
            <button onclick="document.getElementById('waBanner').remove()"
              style="background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.4);color:#fff;
              padding:6px 14px;border-radius:50px;cursor:pointer;font-size:0.8rem;white-space:nowrap;
              font-family:var(--font-body);flex-shrink:0;">
              Dismiss
            </button>
          </div>`;
        // Insert before the products section
        const productsSection = document.getElementById('products');
        if (productsSection) productsSection.before(banner);
      }
    })
    .catch(() => {}); // silently skip if server is offline

  // --- Navbar scroll active link ---
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => link.classList.remove('active'));
        const active = document.querySelector(`.nav-link[href="#${entry.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4, rootMargin: '-70px 0px 0px 0px' });
  sections.forEach(s => observer.observe(s));

  // --- Hamburger ---
  const hamburger = document.getElementById('hamburger');
  const navLinksEl = document.querySelector('.nav-links');
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinksEl.classList.toggle('open');
  });
  navLinksEl.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('open');
      navLinksEl.classList.remove('open');
    });
  });

  // --- Search Toggle ---
  const searchToggle = document.getElementById('searchToggle');
  const searchBarWrapper = document.getElementById('searchBarWrapper');
  const searchClose = document.getElementById('searchClose');
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');

  searchToggle.addEventListener('click', () => {
    searchBarWrapper.classList.toggle('open');
    if (searchBarWrapper.classList.contains('open')) searchInput.focus();
  });
  searchClose.addEventListener('click', () => {
    searchBarWrapper.classList.remove('open');
    searchQuery = '';
    searchInput.value = '';
    renderProducts();
  });

  // Live search
  searchInput.addEventListener('input', () => {
    searchQuery = searchInput.value.trim();
    renderProducts();
    // Scroll to products
    if (searchQuery) {
      document.getElementById('products').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
  searchBtn.addEventListener('click', () => {
    searchQuery = searchInput.value.trim();
    renderProducts();
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  });
  searchInput.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      searchQuery = searchInput.value.trim();
      renderProducts();
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    }
  });

  // --- Category Cards ---
  document.querySelectorAll('.category-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.category-card').forEach(c => c.classList.remove('active-cat'));
      card.classList.add('active-cat');
      const filter = card.dataset.filter;

      // Map category to search
      if (filter === 'casual') searchQuery = 'casual';
      else if (filter === 'evening') searchQuery = 'evening';
      else if (filter === 'party') searchQuery = 'party';
      else if (filter === 'bridal') searchQuery = 'bridal';
      else if (filter === 'summer') searchQuery = 'summer';
      else searchQuery = '';

      renderProducts();
      document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });
  });

  // --- Size Filter Buttons ---
  document.querySelectorAll('.size-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.size-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeSize = btn.dataset.size;
      renderProducts();
    });
  });

  // --- Sort Select ---
  document.getElementById('sortSelect').addEventListener('change', e => {
    activeSort = e.target.value;
    renderProducts();
  });

  // --- Cart Toggle ---
  document.getElementById('cartToggle').addEventListener('click', openCart);
  document.getElementById('cartClose').addEventListener('click', closeCart);
  document.getElementById('cartOverlay').addEventListener('click', closeCart);
  document.getElementById('clearCartBtn').addEventListener('click', clearCart);
  document.getElementById('startShoppingBtn').addEventListener('click', () => {
    closeCart();
    document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
  });

  // --- Checkout ---
  document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
  document.getElementById('cancelCheckout').addEventListener('click', closeCheckout);
  document.getElementById('checkoutClose').addEventListener('click', closeCheckout);
  document.getElementById('checkoutOverlay').addEventListener('click', e => {
    if (e.target === document.getElementById('checkoutOverlay')) closeCheckout();
  });

  // Step 1 → 2
  document.getElementById('goToPayment').addEventListener('click', () => {
    if (validateStep1()) {
      customerData = {
        name: document.getElementById('custName').value.trim(),
        phone: document.getElementById('custPhone').value.trim(),
        email: document.getElementById('custEmail').value.trim(),
        address: document.getElementById('custAddress').value.trim(),
        city: document.getElementById('custCity').value.trim(),
        pin: document.getElementById('custPin').value.trim()
      };
      populateOrderSummary();
      showStep(2);
    }
  });

  // Step 2 → 1 (back)
  document.getElementById('backToDetails').addEventListener('click', () => showStep(1));
  document.getElementById('paymentClose').addEventListener('click', closeCheckout);

  // Payment option selection
  document.querySelectorAll('.payment-option').forEach(option => {
    option.addEventListener('click', () => {
      document.querySelectorAll('.payment-option').forEach(o => o.classList.remove('selected'));
      option.classList.add('selected');
    });
  });

  // Place order
  document.getElementById('placeOrderBtn').addEventListener('click', placeOrder);

  // Continue shopping (from confirmation)
  document.getElementById('continueShopping').addEventListener('click', () => {
    closeCheckout();
    document.getElementById('productsGrid').scrollIntoView({ behavior: 'smooth' });
  });

  // --- Back to Top ---
  document.getElementById('backToTop').addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // --- Scroll animations (IntersectionObserver for sections) ---
  const animateObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        animateObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  ['.categories-section', '.testimonials-section', '.mid-banner'].forEach(sel => {
    document.querySelectorAll(sel).forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      animateObserver.observe(el);
    });
  });

  console.log(
    '%c✦ ELEGANCE DRESS STORE ✦',
    'color: #c9547a; font-size: 20px; font-weight: bold; background: #fdf8fb; padding: 10px 20px; border-radius: 8px;'
  );
  console.log('%cE-commerce website loaded successfully!', 'color: #6b6b8a; font-size: 12px;');
});
