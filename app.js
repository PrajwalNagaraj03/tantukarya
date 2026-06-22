// --- PRODUCTS DATABASE ---
const PRODUCTS = [
    {
        id: "top-aditi",
        name: "Aditi Indigo Peplum Top",
        category: "tops",
        price: 2450,
        image: "/assets/ajrakh_top.png",
        badge: "Best Seller",
        description: "An elegant, breezy peplum top with hand-pressed floral stars. Tailored with a gathered waistline and a flared hem, this Indigo-dyed cotton top transitions beautifully from workday elegance to relaxed weekends.",
        craftSpecs: "Dye: Fermented Organic Indigo & Madder Root; Material: 100% Handloom Cotton; Origin: Block printed by the Khatri family in Kutch, Gujarat.",
        sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
        id: "top-dhriti",
        name: "Dhriti Madder Red Tunic",
        category: "tops",
        price: 2800,
        image: "/assets/ajrakh_top.png", // sharing premium image asset
        badge: "Classic",
        description: "A traditional high-low tunic featuring intricate white resist lattices overlaid with rich madder root red dye. Offers a relaxed straight-fit shape with side slits for airy comfort.",
        craftSpecs: "Dye: Alizarin (Madder Root) & Iron Rust Black; Material: 100% Khadi Cotton; Origin: Block printed in Rajasthan.",
        sizes: ["S", "M", "L", "XL"]
    },
    {
        id: "shirt-meera",
        name: "Meera Oversized Linen Shirt",
        category: "shirts",
        price: 3200,
        image: "/assets/ajrakh_shirt.png",
        badge: "Premium",
        description: "Breezy and structured, this oversized women's shirt exhibits the iconic three-layered geometric print of Ajrakh. Crafted from an organic linen-cotton blend and finished with genuine coconut shell buttons.",
        craftSpecs: "Dye: Hard-water resist, Indigo & Pomegranate Rind; Material: 60% Linen, 40% Cotton; Details: Natural woodblock stamps, coconut buttons.",
        sizes: ["S", "M", "L"]
    },
    {
        id: "shirt-kavya",
        name: "Kavya Mandarin Collar Shirt",
        category: "shirts",
        price: 2950,
        image: "/assets/ajrakh_shirt.png", // sharing premium image asset
        badge: "New Arrival",
        description: "A sleek, contemporary shirt featuring a smart Mandarin collar and detailed cuffs. The fabric showcases a rich trellis print combining turmeric-gold accents with deep indigo grounds.",
        craftSpecs: "Dye: Fermented Indigo & Turmeric/Pomegranate shell; Material: 100% Fine Mercerized Cotton; Origin: Handcrafted in Barmer.",
        sizes: ["XS", "S", "M", "L", "XL"]
    },
    {
        id: "shorts-avani",
        name: "Avani Leisure Ochre Shorts",
        category: "shorts",
        price: 1850,
        image: "/assets/ajrakh_shorts.png",
        badge: "Heritage",
        description: "High-waisted luxury loungewear shorts printed in a stunning geometric mandala pattern. Complete with deep side pockets, a comfortable elasticated back waist, and a decorative tassel drawstring tie.",
        craftSpecs: "Dye: Turmeric (Yellow-Ochre) & Indigo outlines; Material: Soft Cotton-Linen; Fit: Regular high-waisted fit.",
        sizes: ["XS", "S", "M", "L"]
    },
    {
        id: "shorts-nisha",
        name: "Nisha High-Waisted Indigo Shorts",
        category: "shorts",
        price: 1650,
        image: "/assets/ajrakh_shorts.png", // sharing premium image asset
        badge: "Resort Wear",
        description: "Minimalist shorts displaying delicate repeating star-mesh stamps. Lightweight, breathable, and pre-washed for exceptional softness, these shorts are the perfect companion for sunny resort days.",
        craftSpecs: "Dye: Organic Indigo vat fermentation; Material: 100% Sustainable Cotton; Pockets: Two lateral slit pockets.",
        sizes: ["S", "M", "L", "XL"]
    }
];

// --- APP STATE ---
let cart = [];
let activeFilter = "all";
let selectedProductForModal = null;
let selectedSizeForModal = null;

// --- DOM ELEMENTS ---
const header = document.getElementById("header");
const productGrid = document.getElementById("product-grid");
const filterChips = document.querySelectorAll(".filter-chip");

const productModal = document.getElementById("product-modal");
const modalCloseBtn = document.getElementById("modal-close-btn");
const modalContentDetails = document.getElementById("modal-content-details");

const cartToggleBtn = document.getElementById("cart-toggle-btn");
const cartDrawerOverlay = document.getElementById("cart-drawer-overlay");
const cartCloseBtn = document.getElementById("cart-close-btn");
const cartBadgeCount = document.getElementById("cart-badge-count");
const cartItemsContainer = document.getElementById("cart-items-container");
const cartTotalAmount = document.getElementById("cart-total-amount");
const checkoutStartBtn = document.getElementById("checkout-start-btn");

const checkoutModal = document.getElementById("checkout-modal");
const checkoutCloseBtn = document.getElementById("checkout-close-btn");
const checkoutForm = document.getElementById("checkout-form");
const checkoutFormContent = document.getElementById("checkout-form-content");

// --- INITIALIZATION ---
document.addEventListener("DOMContentLoaded", () => {
    loadCartFromLocalStorage();
    renderProducts();
    setupEventListeners();
    updateCartUI();
});

// --- RENDER FUNCTIONS ---
function renderProducts() {
    productGrid.innerHTML = "";
    
    const filteredProducts = activeFilter === "all" 
        ? PRODUCTS 
        : PRODUCTS.filter(p => p.category === activeFilter);
        
    filteredProducts.forEach(product => {
        const productCard = document.createElement("div");
        productCard.className = "product-card";
        productCard.innerHTML = `
            <div class="product-image-container">
                <span class="product-badge ${product.badge.toLowerCase() === 'sale' ? 'sale' : ''}">${product.badge}</span>
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
                <div class="product-overlay-actions">
                    <button class="product-quick-view-btn" data-id="${product.id}">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        Quick View
                    </button>
                </div>
            </div>
            <div class="product-details">
                <span class="product-category">${product.category}</span>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-meta">
                    <span class="product-price">₹${product.price.toLocaleString("en-IN")}</span>
                    <button class="product-add-cart-icon-btn product-quick-add-btn" data-id="${product.id}" aria-label="Add ${product.name} to cart">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        productGrid.appendChild(productCard);
    });
}

function openProductModal(productId) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    
    selectedProductForModal = product;
    selectedSizeForModal = product.sizes[0]; // Default selection is first size
    
    // Structure modal markup
    modalContentDetails.innerHTML = `
        <div class="modal-image-pane">
            <img src="${product.image}" alt="${product.name}" class="modal-image">
        </div>
        <div class="modal-info-pane">
            <span class="modal-category">${product.category}</span>
            <h2 class="modal-title">${product.name}</h2>
            <div class="modal-price">₹${product.price.toLocaleString("en-IN")}</div>
            
            <p class="modal-desc">${product.description}</p>
            
            <div class="modal-options-title">Select Size</div>
            <div class="modal-size-selector" id="modal-size-chips">
                ${product.sizes.map(size => `
                    <button class="size-chip ${size === selectedSizeForModal ? 'selected' : ''}" data-size="${size}">${size}</button>
                `).join('')}
            </div>
            
            <button class="btn btn-primary modal-add-btn" id="modal-add-to-cart-action">Add to Shopping Bag</button>
            
            <div class="modal-craft-notes">
                <strong>Craft Specifications:</strong><br>
                ${product.craftSpecs}
            </div>
        </div>
    `;
    
    // Hook size chip listeners inside modal
    const sizeChips = modalContentDetails.querySelectorAll(".size-chip");
    sizeChips.forEach(chip => {
        chip.addEventListener("click", (e) => {
            sizeChips.forEach(c => c.classList.remove("selected"));
            e.target.classList.add("selected");
            selectedSizeForModal = e.target.getAttribute("data-size");
        });
    });
    
    // Add to cart action inside modal
    modalContentDetails.querySelector("#modal-add-to-cart-action").addEventListener("click", () => {
        addToCart(selectedProductForModal.id, selectedSizeForModal);
        closeModals();
        openCartDrawer();
    });
    
    productModal.classList.add("active");
}

function updateCartUI() {
    // Badge counter
    const count = getCartCount();
    cartBadgeCount.textContent = count;
    cartBadgeCount.style.display = count > 0 ? "flex" : "none";
    
    // Cart container contents
    cartItemsContainer.innerHTML = "";
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart-message">
                <div class="empty-cart-icon">✦</div>
                <p>Your shopping bag is currently empty.</p>
                <a href="#shop" class="btn btn-outline" id="cart-empty-shop-btn" style="padding: 0.6rem 1.5rem; font-size: 0.8rem;">Explore Shop</a>
            </div>
        `;
        document.getElementById("cart-empty-shop-btn")?.addEventListener("click", () => {
            closeCartDrawer();
        });
        checkoutStartBtn.setAttribute("disabled", "true");
        checkoutStartBtn.style.opacity = "0.5";
        checkoutStartBtn.style.pointerEvents = "none";
    } else {
        cart.forEach(item => {
            const cartItem = document.createElement("div");
            cartItem.className = "cart-item";
            cartItem.innerHTML = `
                <div class="cart-item-image-wrapper">
                    <img src="${item.product.image}" alt="${item.product.name}" class="cart-item-image">
                </div>
                <div class="cart-item-details">
                    <h4 class="cart-item-name">${item.product.name}</h4>
                    <span class="cart-item-size">Size: ${item.size}</span>
                    <div class="cart-item-actions">
                        <div class="quantity-controls">
                            <button class="qty-btn qty-minus-btn" data-id="${item.product.id}" data-size="${item.size}">-</button>
                            <span class="qty-value">${item.quantity}</span>
                            <button class="qty-btn qty-plus-btn" data-id="${item.product.id}" data-size="${item.size}">+</button>
                        </div>
                        <span class="cart-item-price">₹${(item.product.price * item.quantity).toLocaleString("en-IN")}</span>
                    </div>
                </div>
                <button class="cart-item-remove-btn" data-id="${item.product.id}" data-size="${item.size}" aria-label="Remove item">✕</button>
            `;
            cartItemsContainer.appendChild(cartItem);
        });
        checkoutStartBtn.removeAttribute("disabled");
        checkoutStartBtn.style.opacity = "1";
        checkoutStartBtn.style.pointerEvents = "auto";
    }
    
    // Total price
    cartTotalAmount.textContent = `₹${getCartTotal().toLocaleString("en-IN")}`;
}

// --- STATE ACTIONS ---
function addToCart(productId, size) {
    const product = PRODUCTS.find(p => p.id === productId);
    if (!product) return;
    
    // Check if item already exists in cart with same size
    const existingIndex = cart.findIndex(item => item.product.id === productId && item.size === size);
    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ product, size, quantity: 1 });
    }
    
    saveCartToLocalStorage();
    updateCartUI();
}

function updateQuantity(productId, size, change) {
    const index = cart.findIndex(item => item.product.id === productId && item.size === size);
    if (index > -1) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        saveCartToLocalStorage();
        updateCartUI();
    }
}

function removeFromCart(productId, size) {
    cart = cart.filter(item => !(item.product.id === productId && item.size === size));
    saveCartToLocalStorage();
    updateCartUI();
}

function getCartTotal() {
    return cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
}

function getCartCount() {
    return cart.reduce((count, item) => count + item.quantity, 0);
}

function saveCartToLocalStorage() {
    localStorage.setItem("tantukarya_cart", JSON.stringify(cart));
}

function loadCartFromLocalStorage() {
    const stored = localStorage.getItem("tantukarya_cart");
    if (stored) {
        try {
            cart = JSON.parse(stored);
        } catch (e) {
            cart = [];
        }
    }
}

// --- DRAWER & MODAL TOGGLES ---
function openCartDrawer() {
    cartDrawerOverlay.classList.add("active");
}

function closeCartDrawer() {
    cartDrawerOverlay.classList.remove("active");
}

function closeModals() {
    productModal.classList.remove("active");
    checkoutModal.classList.remove("active");
    selectedProductForModal = null;
    selectedSizeForModal = null;
}

// --- EVENT HANDLERS ---
function setupEventListeners() {
    // Header Scroll behavior
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            header.classList.add("scrolled");
        } else {
            header.classList.remove("scrolled");
        }
    });

    // Filter Chips
    filterChips.forEach(chip => {
        chip.addEventListener("click", (e) => {
            filterChips.forEach(c => c.classList.remove("active"));
            e.target.classList.add("active");
            activeFilter = e.target.getAttribute("data-filter");
            renderProducts();
        });
    });

    // Product Grid clicks (Delegated)
    productGrid.addEventListener("click", (e) => {
        // Quick view button
        const quickViewBtn = e.target.closest(".product-quick-view-btn");
        if (quickViewBtn) {
            const id = quickViewBtn.getAttribute("data-id");
            openProductModal(id);
            return;
        }
        
        // Quick add icon-button (opens modal directly to prompt size selection for clothing)
        const quickAddBtn = e.target.closest(".product-quick-add-btn");
        if (quickAddBtn) {
            const id = quickAddBtn.getAttribute("data-id");
            openProductModal(id);
            return;
        }
    });

    // Cart overlay/drawer events
    cartToggleBtn.addEventListener("click", openCartDrawer);
    cartCloseBtn.addEventListener("click", closeCartDrawer);
    cartDrawerOverlay.addEventListener("click", (e) => {
        if (e.target === cartDrawerOverlay) closeCartDrawer();
    });

    // Cart items delegation (quantity, remove)
    cartItemsContainer.addEventListener("click", (e) => {
        const productId = e.target.getAttribute("data-id");
        const size = e.target.getAttribute("data-size");
        
        if (e.target.classList.contains("qty-plus-btn")) {
            updateQuantity(productId, size, 1);
        } else if (e.target.classList.contains("qty-minus-btn")) {
            updateQuantity(productId, size, -1);
        } else if (e.target.classList.contains("cart-item-remove-btn")) {
            removeFromCart(productId, size);
        }
    });

    // Modal Close Button
    modalCloseBtn.addEventListener("click", closeModals);
    productModal.addEventListener("click", (e) => {
        if (e.target === productModal) closeModals();
    });

    // Checkout Close Button
    checkoutCloseBtn.addEventListener("click", closeModals);
    checkoutModal.addEventListener("click", (e) => {
        if (e.target === checkoutModal) closeModals();
    });

    // Checkout Flow buttons
    checkoutStartBtn.addEventListener("click", () => {
        closeCartDrawer();
        
        // Prepare original checkout form markup (in case we previously showed success screen)
        checkoutFormContent.innerHTML = `
            <form class="checkout-form" id="checkout-form">
                <h2 class="text-center" style="margin-bottom: 2rem; font-family: var(--font-heading);">Shipping & Delivery</h2>
                
                <div class="form-group">
                    <label for="checkout-name">Full Name</label>
                    <input type="text" id="checkout-name" class="form-input" required placeholder="Aarav Sharma">
                </div>
                
                <div class="form-group">
                    <label for="checkout-email">Email Address</label>
                    <input type="email" id="checkout-email" class="form-input" required placeholder="aarav@example.com">
                </div>
                
                <div class="form-group">
                    <label for="checkout-address">Shipping Address</label>
                    <input type="text" id="checkout-address" class="form-input" required placeholder="Flat 402, Block A, Green Meadows Apartments">
                </div>
                
                <div class="form-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
                    <div>
                        <label for="checkout-city">City</label>
                        <input type="text" id="checkout-city" class="form-input" required placeholder="Bengaluru">
                    </div>
                    <div>
                        <label for="checkout-zip">Postal Code</label>
                        <input type="text" id="checkout-zip" class="form-input" required placeholder="560001" pattern="[0-9]{6}">
                    </div>
                </div>
                
                <div class="form-group" style="margin-top: 2.5rem;">
                    <button type="submit" class="btn btn-primary" style="width: 100%;">Complete Order</button>
                </div>
            </form>
        `;
        
        // Re-hook checkout submit listener
        document.getElementById("checkout-form").addEventListener("submit", handleCheckoutSubmit);
        
        checkoutModal.classList.add("active");
    });

    // Contact Form submit
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactForm);
    }

    // Newsletter form
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Thank you for subscribing to tantukarya!');
            newsletterForm.reset();
        });
    }
}

function handleCheckoutSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById("checkout-name").value;
    const email = document.getElementById("checkout-email").value;
    const orderNumber = "TK-" + Math.floor(100000 + Math.random() * 900000);
    
    // Display Success screen
    checkoutFormContent.innerHTML = `
        <div class="checkout-success-pane">
            <div class="success-stamp-circle">✦</div>
            <h2 style="font-family: var(--font-heading); font-size: 1.75rem; color: var(--color-primary-indigo-dark);">Order Confirmed!</h2>
            <p style="color: var(--color-accent-ochre-dark); font-weight: 700; font-size: 0.95rem; letter-spacing: 0.1em; text-transform: uppercase;">
                Order ID: ${orderNumber}
            </p>
            <p class="text-muted" style="font-size: 0.95rem; line-height: 1.6;">
                Thank you, <strong>${name}</strong>. A receipt and shipping updates will be sent to <strong>${email}</strong>.<br><br>
                Our artisan weavers are preparing your hand block-printed apparel. We ship globally with care.
            </p>
            <button class="btn btn-secondary" id="checkout-success-continue-btn" style="margin-top: 1rem; width: 100%;">Continue Shopping</button>
        </div>
    `;
    
    // Add event listener to continue shopping button
    document.getElementById("checkout-success-continue-btn").addEventListener("click", () => {
        closeModals();
    });
    
    // Clear the cart state
    cart = [];
    saveCartToLocalStorage();
    updateCartUI();
}

// --- CONTACT FORM HANDLER (Formspree) ---
async function handleContactForm(e) {
    e.preventDefault();

    const form = document.getElementById('contact-form');
    const submitBtn = document.getElementById('contact-submit-btn');
    const successMsg = document.getElementById('contact-success-msg');

    // Show loading state
    const originalBtnHTML = submitBtn.innerHTML;
    submitBtn.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:0.5rem; animation: spin 1s linear infinite;">
            <line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line>
            <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
            <line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line>
            <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        </svg> Sending...`;
    submitBtn.disabled = true;
    successMsg.textContent = '';
    successMsg.style.color = '';

    // Add spinner animation if not present
    if (!document.getElementById('contact-spin-style')) {
        const style = document.createElement('style');
        style.id = 'contact-spin-style';
        style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
    }

    try {
        const formData = new FormData(form);
        const response = await fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
            successMsg.textContent = '✦ Your message has been sent! We\'ll get back to you within 24 hours.';
            successMsg.style.color = 'var(--color-success)';
            form.reset();
        } else {
            const data = await response.json();
            if (data && data.errors) {
                successMsg.textContent = data.errors.map(err => err.message).join(', ');
            } else {
                successMsg.textContent = 'Oops! Something went wrong. Please email us directly at hello@tantukarya.com';
            }
            successMsg.style.color = 'var(--color-primary-madder)';
        }
    } catch (error) {
        successMsg.textContent = 'Could not send message. Please try WhatsApp or email us directly.';
        successMsg.style.color = 'var(--color-primary-madder)';
    } finally {
        submitBtn.innerHTML = originalBtnHTML;
        submitBtn.disabled = false;
    }
}
