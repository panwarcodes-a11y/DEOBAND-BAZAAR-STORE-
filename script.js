const config = window.STORE_CONFIG;
const products = window.STORE_PRODUCTS;

const state = {
  query: "",
  cart: JSON.parse(localStorage.getItem("deoband-bazar-cart") || "[]"),
};

const productGrid = document.getElementById("product-grid");
const featuredGrid = document.getElementById("featured-grid");
const searchInput = document.getElementById("search-input");
const cartDrawer = document.getElementById("cart-drawer");
const cartItems = document.getElementById("cart-items");
const cartTotal = document.getElementById("cart-total");
const cartCount = document.getElementById("cart-count");
const openCartButton = document.getElementById("open-cart");
const closeCartButton = document.getElementById("close-cart");
const productModal = document.getElementById("product-modal");
const modalBody = document.getElementById("modal-body");
const closeModalButton = document.getElementById("close-modal");
const checkoutSheet = document.getElementById("checkout");
const closeCheckoutButton = document.getElementById("close-checkout");
const openCheckoutButton = document.getElementById("checkout-button");
const checkoutSummary = document.getElementById("checkout-summary");
const checkoutTotal = document.getElementById("checkout-total");
const checkoutForm = document.getElementById("checkout-form");
const whatsappCheckoutLink = document.getElementById("whatsapp-checkout");

function formatPrice(value) {
  if (!value) {
    return "Add price later";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: config.currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function saveCart() {
  localStorage.setItem("deoband-bazar-cart", JSON.stringify(state.cart));
}

function getProduct(id) {
  return products.find((product) => product.id === id);
}

function buildProductCard(product) {
  return `
    <article class="product-card">
      <div class="product-visual" style="background:${product.image}">
        <span class="product-badge">${product.badge}</span>
      </div>
      <div class="product-body">
        <p class="eyebrow">${product.category}</p>
        <h3 class="product-title">${product.name}</h3>
        <p class="product-meta">${product.shortNote}</p>
        <p class="product-size">Sizes: ${product.sizes.join(", ")}</p>
        <div class="stock-row">
          <span>${product.stock}</span>
          <span>${product.featured ? "Featured" : "Regular"}</span>
        </div>
        <div class="product-price-row">
          <div>
            <div class="price">${formatPrice(product.price)}</div>
            <small class="compare-price">${product.compareAtPrice ? formatPrice(product.compareAtPrice) : "Final price pending"}</small>
          </div>
          <div class="product-actions">
            <button type="button" class="ghost-button" data-view="${product.id}">View</button>
            <button type="button" ${product.price ? `data-add="${product.id}"` : "disabled"}>${product.price ? "Add to Cart" : "Add Later"}</button>
          </div>
        </div>
      </div>
    </article>
  `;
}

function renderFeatured() {
  const featured = products.filter((product) => product.featured).slice(0, 4);
  featuredGrid.innerHTML = featured.map(buildProductCard).join("");
}

function renderProducts() {
  const filtered = products.filter((product) => {
    const haystack = `${product.name} ${product.category} ${product.shortNote} ${product.description}`.toLowerCase();
    return haystack.includes(state.query.toLowerCase());
  });

  if (!filtered.length) {
    productGrid.innerHTML = `
      <article class="product-card">
        <div class="product-body">
          <h3 class="product-title">No products found</h3>
          <p class="product-meta">Try a different keyword or edit products in products.js.</p>
        </div>
      </article>
    `;
    return;
  }

  productGrid.innerHTML = filtered.map(buildProductCard).join("");
}

function renderCart() {
  if (!state.cart.length) {
    cartItems.innerHTML = `
      <div class="cart-item">
        <div>
          <h3>Your cart is empty</h3>
          <p>Add live products later after you set names and prices.</p>
        </div>
      </div>
    `;
    cartTotal.textContent = formatPrice(0);
    cartCount.textContent = "0";
    checkoutSummary.innerHTML = "<p class='checkout-empty'>Cart is empty.</p>";
    checkoutTotal.textContent = formatPrice(0);
    updateWhatsAppLink();
    return;
  }

  cartItems.innerHTML = state.cart
    .map(
      (item, index) => `
        <div class="cart-item">
          <div>
            <h3>${item.name}</h3>
            <p>${item.category}</p>
            <p>${formatPrice(item.price)}</p>
          </div>
          <button class="remove-item" type="button" data-remove="${index}">Remove</button>
        </div>
      `
    )
    .join("");

  checkoutSummary.innerHTML = state.cart
    .map(
      (item) => `
        <div class="summary-row">
          <span>${item.name}</span>
          <strong>${formatPrice(item.price)}</strong>
        </div>
      `
    )
    .join("");

  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  cartTotal.textContent = formatPrice(total);
  checkoutTotal.textContent = formatPrice(total);
  cartCount.textContent = String(state.cart.length);
  updateWhatsAppLink();
}

function addToCart(id) {
  const product = getProduct(id);
  if (!product || !product.price) return;
  state.cart.push(product);
  saveCart();
  renderCart();
  openCart();
}

function removeFromCart(index) {
  state.cart.splice(Number(index), 1);
  saveCart();
  renderCart();
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
}

function openModal(id) {
  const product = getProduct(id);
  if (!product) return;

  modalBody.innerHTML = `
    <div class="modal-visual" style="background:${product.image}">
      <span class="product-badge">${product.badge}</span>
    </div>
    <div class="modal-copy">
      <p class="eyebrow">${product.category}</p>
      <h2>${product.name}</h2>
      <p>${product.description}</p>
      <p><strong>Sizes:</strong> ${product.sizes.join(", ")}</p>
      <p><strong>Status:</strong> ${product.stock}</p>
      <p><strong>Model:</strong> Sourced after confirmed customer order</p>
      <div class="modal-price-row">
        <div>
          <div class="price">${formatPrice(product.price)}</div>
          <small class="compare-price">${product.compareAtPrice ? formatPrice(product.compareAtPrice) : "Price will be added later"}</small>
        </div>
        <button type="button" ${product.price ? `data-modal-add="${product.id}"` : "disabled"}>${product.price ? "Add to Cart" : "Add Price Later"}</button>
      </div>
    </div>
  `;

  productModal.classList.add("open");
  productModal.setAttribute("aria-hidden", "false");
}

function closeModal() {
  productModal.classList.remove("open");
  productModal.setAttribute("aria-hidden", "true");
}

function openCheckout() {
  checkoutSheet.classList.add("open");
  checkoutSheet.setAttribute("aria-hidden", "false");
}

function closeCheckout() {
  checkoutSheet.classList.remove("open");
  checkoutSheet.setAttribute("aria-hidden", "true");
}

function updateWhatsAppLink() {
  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  const lines = state.cart.map((item, index) => `${index + 1}. ${item.name} - ${formatPrice(item.price)}`);
  const message = [
    "Assalamualaikum, mujhe order place karna hai.",
    "",
    `Store: ${config.brandName}`,
    "Items:",
    ...(lines.length ? lines : ["Cart empty"]),
    "",
    `Total: ${formatPrice(total)}`,
    "Please share payment link and order confirmation steps.",
  ].join("\n");

  whatsappCheckoutLink.href = config.whatsappNumber
    ? `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`
    : "#";
}

function updateBranding() {
  const instagramUrl = config.instagramUrl || "#";
  const supportEmail = config.supportEmail || "Add email later";
  const whatsappUrl = config.whatsappNumber ? `https://wa.me/${config.whatsappNumber}` : "#";

  document.title = `${config.brandName} | Shop Online`;
  document.getElementById("brand-name").textContent = config.brandName;
  document.getElementById("brand-name-large").textContent = config.brandName;
  document.getElementById("hero-tagline").textContent = config.tagline;
  document.getElementById("announcement").textContent = config.announcement;
  document.getElementById("instagram-link").href = instagramUrl;
  document.getElementById("instagram-link-footer").href = instagramUrl;
  document.getElementById("support-email").textContent = supportEmail;
  document.getElementById("support-email").href = config.supportEmail ? `mailto:${config.supportEmail}` : "#";
  document.getElementById("support-email-footer").textContent = supportEmail;
  document.getElementById("support-email-footer").href = config.supportEmail ? `mailto:${config.supportEmail}` : "#";
  document.getElementById("whatsapp-link").href = whatsappUrl;
  document.getElementById("payment-note").textContent = config.paymentNote;
  document.getElementById("shipping-note").textContent = config.shippingNote;
  document.getElementById("return-note").textContent = config.returnNote;
  document.getElementById("owner-name").textContent = config.ownerName;
  document.getElementById("sourcing-note").textContent = config.sourcingNote;
  document.getElementById("support-message").textContent = config.supportMessage;
}

searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderProducts();
});

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const addId = target.getAttribute("data-add");
  const viewId = target.getAttribute("data-view");
  const removeIndex = target.getAttribute("data-remove");
  const modalAddId = target.getAttribute("data-modal-add");

  if (addId) addToCart(addId);
  if (viewId) openModal(viewId);
  if (removeIndex !== null && removeIndex !== "") removeFromCart(removeIndex);
  if (modalAddId) {
    addToCart(modalAddId);
    closeModal();
  }
});

openCartButton.addEventListener("click", openCart);
closeCartButton.addEventListener("click", closeCart);
closeModalButton.addEventListener("click", closeModal);
openCheckoutButton.addEventListener("click", openCheckout);
closeCheckoutButton.addEventListener("click", closeCheckout);

cartDrawer.addEventListener("click", (event) => {
  if (event.target === cartDrawer) closeCart();
});

productModal.addEventListener("click", (event) => {
  if (event.target === productModal) closeModal();
});

checkoutSheet.addEventListener("click", (event) => {
  if (event.target === checkoutSheet) closeCheckout();
});

checkoutForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!config.whatsappNumber) {
    window.alert("WhatsApp number abhi add nahi hai. Baad me config.js me add kar dena.");
    return;
  }

  const formData = new FormData(checkoutForm);
  const customerName = formData.get("name")?.toString().trim() || "";
  const phone = formData.get("phone")?.toString().trim() || "";
  const city = formData.get("city")?.toString().trim() || "";
  const address = formData.get("address")?.toString().trim() || "";
  const note = formData.get("note")?.toString().trim() || "";
  const total = state.cart.reduce((sum, item) => sum + item.price, 0);
  const lines = state.cart.map((item, index) => `${index + 1}. ${item.name} - ${formatPrice(item.price)}`);
  const message = [
    "Assalamualaikum, main order confirm karna chahta/chahti hoon.",
    "",
    `Name: ${customerName}`,
    `Phone: ${phone}`,
    `City: ${city}`,
    `Address: ${address}`,
    `Note: ${note || "N/A"}`,
    "",
    "Products:",
    ...(lines.length ? lines : ["Cart empty"]),
    "",
    `Total: ${formatPrice(total)}`,
    "Please send payment link for prepaid confirmation.",
  ].join("\n");

  window.open(`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
});

updateBranding();
renderFeatured();
renderProducts();
renderCart();
