
/* ===========================================================
   Shadow Strength – Main JS
   Handles cart, filters, forms, checkout, UI interactions
   =========================================================== */

// -------------------------------
// CART STORAGE
// -------------------------------
const CART_KEY = "shadowstrength_cart";
const COOKIE_KEY = "shadowstrength_cookie_consent";

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function formatPrice(num) {
  return "$" + num.toFixed(2);
}

function cartTotal(cart) {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

// -------------------------------
// UPDATE CART BADGE (NAV ICON)
// -------------------------------
function updateCartBadge() {
  const badge = document.getElementById("cartCount");
  if (!badge) return;

  const cart = loadCart();
  const qty = cart.reduce((s, i) => s + i.quantity, 0);
  badge.textContent = qty;
}

// -------------------------------
// RENDER CART OVERLAY
// -------------------------------
function renderCart() {
  const container = document.getElementById("cartItems");
  const totalEl = document.getElementById("cartTotal");
  if (!container || !totalEl) return;

  const cart = loadCart();
  container.innerHTML = "";

  if (cart.length === 0) {
    container.innerHTML = `<p style="color:#ccc; margin-top:20px;">Your cart is empty.</p>`;
    totalEl.textContent = "$0.00";
    return;
  }

  cart.forEach(item => {
    const div = document.createElement("div");
    div.className = "cart-item";

    div.innerHTML = `
      <div class="cart-thumb">SS</div>

      <div class="cart-item-info">
        <div class="cart-item-title">${item.name}</div>
        <div class="cart-item-meta">x${item.quantity}</div>
        <div class="cart-item-price">${formatPrice(item.price)}</div>
      </div>

      <div class="qty-controls">
        <button class="qty-minus" data-id="${item.id}">−</button>
        <span>${item.quantity}</span>
        <button class="qty-plus" data-id="${item.id}">+</button>
      </div>

      <button class="cart-remove-btn" data-id="${item.id}">🗑</button>
    `;

    container.appendChild(div);
  });

  totalEl.textContent = formatPrice(cartTotal(cart));
}

// -------------------------------
// OPEN / CLOSE CART
// -------------------------------
function openCart() {
  const overlay = document.getElementById("cartOverlay");
  if (!overlay) return;
  overlay.classList.add("open");
  renderCart();
}

function closeCart() {
  const overlay = document.getElementById("cartOverlay");
  if (!overlay) return;
  overlay.classList.remove("open");
}

// -------------------------------
// ADD TO CART
// -------------------------------
function addToCart(btn) {
  const id = btn.dataset.id;
  const name = btn.dataset.name;
  const price = parseFloat(btn.dataset.price);

  if (!id || !name || !price) return;

  const cart = loadCart();
  const existing = cart.find(i => i.id === id);

  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ id, name, price, quantity: 1 });
  }

  saveCart(cart);
  updateCartBadge();
  renderCart();
  openCart();
}

// -------------------------------
// MODIFY CART ITEMS
// -------------------------------
function handleCartClick(e) {
  const cart = loadCart();
  let changed = false;

  if (e.target.classList.contains("qty-plus")) {
    const id = e.target.dataset.id;
    const item = cart.find(i => i.id === id);
    if (item) item.quantity++;
    changed = true;
  }

  if (e.target.classList.contains("qty-minus")) {
    const id = e.target.dataset.id;
    const item = cart.find(i => i.id === id);
    if (item && item.quantity > 1) item.quantity--;
    changed = true;
  }

  if (e.target.classList.contains("cart-remove-btn")) {
    const id = e.target.dataset.id;
    const index = cart.findIndex(i => i.id === id);
    if (index >= 0) cart.splice(index, 1);
    changed = true;
  }

  if (changed) {
    saveCart(cart);
    updateCartBadge();
    renderCart();
  }
}

// -------------------------------
// SHOP FILTERS
// -------------------------------
function setupFilters() {
  const chips = document.querySelectorAll(".chip, .filter-pill");
  const items = document.querySelectorAll("[data-category]");

  if (!chips.length || !items.length) return;

  chips.forEach(chip => {
    chip.addEventListener("click", () => {
      chips.forEach(c => c.classList.remove("active"));
      chip.classList.add("active");

      const filter = chip.dataset.filter;

      items.forEach(item => {
        const cat = item.dataset.category;
        item.style.display = (filter === "all" || filter === cat) ? "" : "none";
      });
    });
  });
}

// -------------------------------
// CHECKOUT PAGE LOGIC
// -------------------------------
function setupCheckout() {
  const nextBtn = document.getElementById("toPayment");
  const deliveryForm = document.getElementById("checkoutForm");
  const paymentForm = document.getElementById("paymentForm");

  if (!nextBtn || !deliveryForm || !paymentForm) return;

  const steps = document.querySelectorAll(".checkout-steps .step");

  nextBtn.addEventListener("click", () => {
    if (!deliveryForm.reportValidity()) return;

    // Switch step UI
    deliveryForm.classList.add("hidden");
    paymentForm.classList.remove("hidden");

    steps[0].classList.remove("active");
    steps[1].classList.add("active");

    // Fill order summary
    const cart = loadCart();
    document.getElementById("summaryItemsTotal").textContent = formatPrice(cartTotal(cart));
    document.getElementById("summaryOrderTotal").textContent = formatPrice(cartTotal(cart));
  });

  paymentForm.addEventListener("submit", e => {
    e.preventDefault();
    if (!paymentForm.reportValidity()) return;

    alert("Order placed successfully! (Demo — no real payment processed)");

    saveCart([]);
    updateCartBadge();
    window.location.href = "index.html";
  });
}

// -------------------------------
// DEMO FORMS (CONTACT + DESIGN)
// -------------------------------
function setupDemoForms() {
  const designForm = document.getElementById("designForm");
  const contactForm = document.getElementById("contactForm");

  if (designForm) {
    designForm.addEventListener("submit", e => {
      e.preventDefault();
      if (!designForm.reportValidity()) return;
      alert("Design submitted! (Demo only)");
      designForm.reset();
    });
  }

  if (contactForm) {
    contactForm.addEventListener("submit", e => {
      e.preventDefault();
      if (!contactForm.reportValidity()) return;
      alert("Message sent! (Demo only)");
      contactForm.reset();
    });
  }
}

// -------------------------------
// COOKIE / DATA CONSENT BANNER
// -------------------------------
function setupCookieBanner() {
  const banner = document.getElementById("cookieBanner");
  if (!banner) return;

  const stored = localStorage.getItem(COOKIE_KEY);
  // If user has already chosen, hide banner
  if (stored === "accepted" || stored === "rejected") {
    banner.classList.add("hidden-cookie");
    return;
  }

  const acceptBtn = document.getElementById("cookieAccept");
  const rejectBtn = document.getElementById("cookieReject");

  banner.classList.add("visible");

  if (acceptBtn) {
    acceptBtn.addEventListener("click", () => {
      localStorage.setItem(COOKIE_KEY, "accepted");
      banner.classList.remove("visible");
      banner.classList.add("hidden-cookie");

      // In a real site, you would initialise analytics / tracking here
      // if (typeof initAnalytics === "function") initAnalytics();
    });
  }

  if (rejectBtn) {
    rejectBtn.addEventListener("click", () => {
      localStorage.setItem(COOKIE_KEY, "rejected");
      banner.classList.remove("visible");
      banner.classList.add("hidden-cookie");
      // We simply don't load any non-essential scripts.
    });
  }
}

// -------------------------------
// YEAR FOOTER AUTO UPDATE
// -------------------------------
function updateYear() {
  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
}

// -------------------------------
// INITIALIZE EVERYTHING
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  updateYear();
  updateCartBadge();
  setupFilters();
  setupCheckout();
  setupDemoForms();
  setupCookieBanner();

  // Add-to-cart buttons
  document.addEventListener("click", e => {
    const btn = e.target.closest(".add-to-cart");
    if (btn) addToCart(btn);
  });

  // Cart overlay open/close
  const openBtn = document.getElementById("openCartBtn");
  const closeBtn = document.getElementById("closeCartBtn");
  const overlay = document.getElementById("cartOverlay");

  if (openBtn) openBtn.addEventListener("click", openCart);
  if (closeBtn) closeBtn.addEventListener("click", closeCart);

  // Clicking background closes cart
  if (overlay) {
    overlay.addEventListener("click", e => {
      if (e.target === overlay) closeCart();
    });
  }

  // Cart adjust/delete
  const cartContainer = document.getElementById("cartItems");
  if (cartContainer) {
    cartContainer.addEventListener("click", handleCartClick);
  }
});
