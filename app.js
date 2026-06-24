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

// Checkout State
let checkoutStep = 1;
let appliedPromo = false;
let customerDetails = { name: "", email: "", address: "", city: "", zip: "" };
let selectedPaymentMethod = "card";

// Supabase Configuration for Cloud Sync
const SUPABASE_CONFIG = {
    url: "https://vvfdlohyqlailyvoctvk.supabase.co",      // Insert Supabase URL (e.g. "https://your-project-id.supabase.co")
    anonKey: "sb_publishable_lnffxVbMXYr40lCDiZi4Ig_RChDoCbS"   // Insert Supabase Anon Key
};

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
    const oldCount = parseInt(cartBadgeCount.textContent || "0");
    cartBadgeCount.textContent = count;
    cartBadgeCount.style.display = count > 0 ? "flex" : "none";

    if (count !== oldCount && count > 0) {
        cartBadgeCount.classList.remove("pop");
        void cartBadgeCount.offsetWidth; // Trigger layout reflow to restart CSS keyframe animation
        cartBadgeCount.classList.add("pop");
    }

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
    showToast(product, size);
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
    document.getElementById("admin-login-modal").classList.remove("active");
    document.getElementById("admin-panel-modal").classList.remove("active");
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

    // Checkout Start Button
    checkoutStartBtn.addEventListener("click", () => {
        closeCartDrawer();

        // Reset promo & step
        appliedPromo = false;
        const promoInput = document.getElementById("promo-code-input");
        if (promoInput) promoInput.value = "";
        const promoFeedback = document.getElementById("promo-feedback");
        if (promoFeedback) {
            promoFeedback.textContent = "";
            promoFeedback.className = "promo-msg";
        }

        // Restore split pane grid columns default
        document.getElementById("checkout-split-pane").style.gridTemplateColumns = "";

        // Populate inputs if customer details exist
        document.getElementById("shipping-name").value = customerDetails.name || "";
        document.getElementById("shipping-email").value = customerDetails.email || "";
        document.getElementById("shipping-address").value = customerDetails.address || "";
        document.getElementById("shipping-city").value = customerDetails.city || "";
        document.getElementById("shipping-zip").value = customerDetails.zip || "";

        changeCheckoutStep(1);
        updateCheckoutSummaryUI();
        checkoutModal.classList.add("active");
    });

    // Shipping Form Submission (Step 1 -> Step 2)
    const shippingForm = document.getElementById("shipping-form");
    if (shippingForm) {
        shippingForm.addEventListener("submit", (e) => {
            e.preventDefault();
            customerDetails.name = document.getElementById("shipping-name").value;
            customerDetails.email = document.getElementById("shipping-email").value;
            customerDetails.address = document.getElementById("shipping-address").value;
            customerDetails.city = document.getElementById("shipping-city").value;
            customerDetails.zip = document.getElementById("shipping-zip").value;

            changeCheckoutStep(2);
        });
    }

    // Payment Options Tabs switching
    const paymentTabs = document.querySelectorAll(".payment-tab");
    paymentTabs.forEach(tab => {
        tab.addEventListener("click", (e) => {
            const targetTab = e.currentTarget;
            paymentTabs.forEach(t => t.classList.remove("active"));
            targetTab.classList.add("active");

            const targetId = targetTab.getAttribute("data-target");
            const paymentViews = document.querySelectorAll(".payment-view");
            paymentViews.forEach(view => view.classList.remove("active"));
            document.getElementById(targetId).classList.add("active");

            // Update selected method
            if (targetId === "payment-card") selectedPaymentMethod = "card";
            else if (targetId === "payment-upi") selectedPaymentMethod = "upi";
            else if (targetId === "payment-cod") selectedPaymentMethod = "cod";

            updateCheckoutSummaryUI();
        });
    });

    // Step 2 Back Buttons
    const backButtons = ["card-back-btn", "upi-back-btn", "cod-back-btn"];
    backButtons.forEach(btnId => {
        const btn = document.getElementById(btnId);
        if (btn) {
            btn.addEventListener("click", () => {
                changeCheckoutStep(1);
            });
        }
    });

    // Payment Form Submissions
    const cardPaymentForm = document.getElementById("card-payment-form");
    if (cardPaymentForm) {
        cardPaymentForm.addEventListener("submit", (e) => {
            e.preventDefault();
            processOrderPayment();
        });
    }

    const upiPaymentForm = document.getElementById("upi-payment-form");
    if (upiPaymentForm) {
        upiPaymentForm.addEventListener("submit", (e) => {
            e.preventDefault();
            processOrderPayment();
        });
    }

    const codPaymentForm = document.getElementById("cod-payment-form");
    if (codPaymentForm) {
        codPaymentForm.addEventListener("submit", (e) => {
            e.preventDefault();
            processOrderPayment();
        });
    }

    // Card Input Auto Format
    setupCardInputFormatting();

    // Promo Code Apply Button
    const promoApplyBtn = document.getElementById("promo-apply-btn");
    if (promoApplyBtn) {
        promoApplyBtn.addEventListener("click", () => {
            const promoInput = document.getElementById("promo-code-input");
            const promoFeedback = document.getElementById("promo-feedback");
            const code = promoInput.value.trim().toUpperCase();

            if (code === "AJRAKH10") {
                if (appliedPromo) {
                    promoFeedback.textContent = "Promo code already applied!";
                    promoFeedback.className = "promo-msg error";
                } else {
                    appliedPromo = true;
                    promoFeedback.textContent = "10% discount applied successfully!";
                    promoFeedback.className = "promo-msg success";
                    updateCheckoutSummaryUI();
                }
            } else if (code === "") {
                promoFeedback.textContent = "Please enter a promo code.";
                promoFeedback.className = "promo-msg error";
            } else {
                promoFeedback.textContent = "Invalid promo code.";
                promoFeedback.className = "promo-msg error";
            }
        });
    }

    // --- ADMIN PORTAL EVENT LISTENERS ---

    // Secret trigger 1: double click on logo icon
    const logoIcon = document.querySelector(".logo-icon");
    if (logoIcon) {
        logoIcon.addEventListener("dblclick", () => {
            openAdminLogin();
        });
    }

    // Secret trigger 2: keyboard shortcut Ctrl + Shift + A
    window.addEventListener("keydown", (e) => {
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "a") {
            e.preventDefault();
            openAdminLogin();
        }
    });

    // Close admin login
    const adminLoginClose = document.getElementById("admin-login-close");
    if (adminLoginClose) {
        adminLoginClose.addEventListener("click", closeModals);
    }

    // Close admin panel
    const adminPanelClose = document.getElementById("admin-panel-close");
    if (adminPanelClose) {
        adminPanelClose.addEventListener("click", closeModals);
    }

    // Admin login form submission
    const adminLoginForm = document.getElementById("admin-login-form");
    if (adminLoginForm) {
        adminLoginForm.addEventListener("submit", handleAdminLoginSubmit);
    }

    // Expense form submission
    const adminExpenseForm = document.getElementById("admin-expense-form");
    if (adminExpenseForm) {
        adminExpenseForm.addEventListener("submit", handleExpenseSubmit);
    }

    // Sign out button click
    const adminSignOut = document.getElementById("admin-sign-out");
    if (adminSignOut) {
        adminSignOut.addEventListener("click", () => {
            closeModals();
            // Clear inputs
            document.getElementById("admin-username").value = "";
            document.getElementById("admin-password").value = "";
        });
    }

    // Export button click
    const expenseExportBtn = document.getElementById("expense-export-btn");
    if (expenseExportBtn) {
        expenseExportBtn.addEventListener("click", exportExpensesToCSV);
    }

    // Expense list delete button action (Delegated)
    const expenseTableBody = document.getElementById("expense-table-body");
    if (expenseTableBody) {
        expenseTableBody.addEventListener("click", (e) => {
            const deleteBtn = e.target.closest(".expense-delete-btn");
            if (deleteBtn) {
                const id = deleteBtn.getAttribute("data-id");
                deleteExpense(id);
            }
        });
    }
}

// --- CHECKOUT PROCESS HELPERS ---
function changeCheckoutStep(step) {
    checkoutStep = step;

    // Hide all step sections
    document.getElementById("step-shipping-section").classList.remove("active");
    document.getElementById("step-payment-section").classList.remove("active");
    document.getElementById("step-success-section").classList.remove("active");

    // De-activate all stepper nodes
    document.getElementById("step-node-1").classList.remove("active", "completed");
    document.getElementById("step-node-2").classList.remove("active", "completed");
    document.getElementById("step-node-3").classList.remove("active", "completed");
    document.getElementById("step-line-1").classList.remove("completed");
    document.getElementById("step-line-2").classList.remove("completed");

    const splitPane = document.getElementById("checkout-split-pane");
    const rightSummary = document.getElementById("checkout-right-summary");

    if (step === 1) {
        document.getElementById("step-shipping-section").classList.add("active");
        document.getElementById("step-node-1").classList.add("active");
        splitPane.style.gridTemplateColumns = "";
        rightSummary.style.display = "flex";
    } else if (step === 2) {
        document.getElementById("step-payment-section").classList.add("active");
        document.getElementById("step-node-1").classList.add("completed");
        document.getElementById("step-line-1").classList.add("completed");
        document.getElementById("step-node-2").classList.add("active");
        splitPane.style.gridTemplateColumns = "";
        rightSummary.style.display = "flex";
        updateCardPreview();
    } else if (step === 3) {
        document.getElementById("step-success-section").classList.add("active");
        document.getElementById("step-node-1").classList.add("completed");
        document.getElementById("step-line-1").classList.add("completed");
        document.getElementById("step-node-2").classList.add("completed");
        document.getElementById("step-line-2").classList.add("completed");
        document.getElementById("step-node-3").classList.add("completed");

        splitPane.style.gridTemplateColumns = "1fr";
        rightSummary.style.display = "none";
    }
}

function updateCheckoutSummaryUI() {
    const summaryList = document.getElementById("checkout-summary-list");
    if (!summaryList) return;

    summaryList.innerHTML = "";
    cart.forEach(item => {
        const div = document.createElement("div");
        div.className = "checkout-summary-item";
        div.innerHTML = `
            <img src="${item.product.image}" alt="${item.product.name}" class="summary-item-img">
            <div class="summary-item-details">
                <h4 class="summary-item-name">${item.product.name}</h4>
                <div class="summary-item-meta">Size: ${item.size} × ${item.quantity}</div>
            </div>
            <span class="summary-item-price">₹${(item.product.price * item.quantity).toLocaleString("en-IN")}</span>
        `;
        summaryList.appendChild(div);
    });

    const subtotal = getCartTotal();
    const discount = appliedPromo ? (subtotal * 0.10) : 0;

    let shipping = (subtotal - discount >= 3000) ? 0 : 150;
    if (selectedPaymentMethod === "cod") {
        shipping += 50; // COD Handling fee
    }

    const taxes = Math.round((subtotal - discount) * 0.12);
    const total = (subtotal - discount) + shipping + taxes;

    document.getElementById("summary-subtotal").textContent = `₹${subtotal.toLocaleString("en-IN")}`;

    const discountRow = document.getElementById("summary-discount-row");
    if (appliedPromo) {
        discountRow.style.display = "flex";
        document.getElementById("summary-discount").textContent = `-₹${discount.toLocaleString("en-IN")}`;
    } else {
        discountRow.style.display = "none";
    }

    const shippingEl = document.getElementById("summary-shipping");
    if (shipping === 0) {
        shippingEl.textContent = "FREE";
        shippingEl.style.color = "var(--color-success)";
    } else {
        shippingEl.style.color = "";
        if (selectedPaymentMethod === "cod") {
            shippingEl.textContent = `₹${shipping.toLocaleString("en-IN")} (incl. COD)`;
        } else {
            shippingEl.textContent = `₹${shipping.toLocaleString("en-IN")}`;
        }
    }

    document.getElementById("summary-taxes").textContent = `₹${taxes.toLocaleString("en-IN")}`;
    document.getElementById("summary-total").textContent = `₹${total.toLocaleString("en-IN")}`;
}

function setupCardInputFormatting() {
    const cardNumberInput = document.getElementById("card-number");
    const cardNameInput = document.getElementById("card-name");
    const cardExpiryInput = document.getElementById("card-expiry");

    if (!cardNumberInput) return;

    cardNumberInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
        let formattedValue = "";
        for (let i = 0; i < value.length; i++) {
            if (i > 0 && i % 4 === 0) {
                formattedValue += " ";
            }
            formattedValue += value[i];
        }
        e.target.value = formattedValue.slice(0, 19);

        const displayNo = document.getElementById("card-display-number");
        displayNo.textContent = formattedValue || "•••• •••• •••• ••••";

        const cardLogo = document.getElementById("card-logo");
        if (value.startsWith("4")) {
            cardLogo.textContent = "Visa";
            cardLogo.style.backgroundColor = "#1A1F71";
        } else if (value.startsWith("5")) {
            cardLogo.textContent = "Mastercard";
            cardLogo.style.backgroundColor = "#EB001B";
        } else if (value.startsWith("6")) {
            cardLogo.textContent = "RuPay";
            cardLogo.style.backgroundColor = "#0F8040";
        } else if (value.startsWith("3")) {
            cardLogo.textContent = "Amex";
            cardLogo.style.backgroundColor = "#017CCC";
        } else {
            cardLogo.textContent = "CARD";
            cardLogo.style.backgroundColor = "rgba(255, 255, 255, 0.1)";
        }
    });

    cardNameInput.addEventListener("input", (e) => {
        const displayName = document.getElementById("card-display-name");
        displayName.textContent = e.target.value.toUpperCase() || "CARDHOLDER NAME";
    });

    cardExpiryInput.addEventListener("input", (e) => {
        let value = e.target.value.replace(/[^0-9]/g, "");
        if (value.length > 2) {
            value = value.slice(0, 2) + "/" + value.slice(2, 4);
        }
        e.target.value = value.slice(0, 5);

        const displayExpiry = document.getElementById("card-display-expiry");
        displayExpiry.textContent = e.target.value || "MM/YY";
    });
}

function updateCardPreview() {
    const cardNumber = document.getElementById("card-number").value || "•••• •••• •••• ••••";
    const cardName = document.getElementById("card-name").value.toUpperCase() || "CARDHOLDER NAME";
    const cardExpiry = document.getElementById("card-expiry").value || "MM/YY";

    document.getElementById("card-display-number").textContent = cardNumber;
    document.getElementById("card-display-name").textContent = cardName;
    document.getElementById("card-display-expiry").textContent = cardExpiry;
}

function processOrderPayment() {
    const loader = document.getElementById("payment-loader");
    const loaderTitle = document.getElementById("loader-title");
    const loaderSubtitle = document.getElementById("loader-subtitle");

    loader.classList.add("active");

    loaderTitle.textContent = "Authorizing Transaction...";
    loaderSubtitle.textContent = "Connecting securely to payment gateway...";

    setTimeout(() => {
        loaderTitle.textContent = "Verifying Details...";
        loaderSubtitle.textContent = "Securing transaction with bank servers...";
    }, 1200);

    setTimeout(() => {
        loaderTitle.textContent = "Finalizing Order...";
        loaderSubtitle.textContent = "Generating invoice and receipt details...";
    }, 2400);

    setTimeout(() => {
        loader.classList.remove("active");
        completeAndRenderSuccess();
    }, 3600);
}

function completeAndRenderSuccess() {
    const orderNumber = "TK-" + Math.floor(100000 + Math.random() * 900000);
    const subtotal = getCartTotal();
    const discount = appliedPromo ? (subtotal * 0.10) : 0;

    let shipping = (subtotal - discount >= 3000) ? 0 : 150;
    let paymentText = "";
    if (selectedPaymentMethod === "card") {
        const cardNum = document.getElementById("card-number").value.slice(-4);
        paymentText = `Credit Card (ending in •••• ${cardNum})`;
    } else if (selectedPaymentMethod === "upi") {
        const upiVal = document.getElementById("upi-id").value || "Quick Scan UPI QR";
        paymentText = `UPI / VPA (${upiVal})`;
    } else if (selectedPaymentMethod === "cod") {
        paymentText = "Cash on Delivery (COD)";
        shipping += 50;
    }

    const taxes = Math.round((subtotal - discount) * 0.12);
    const total = (subtotal - discount) + shipping + taxes;

    const successSection = document.getElementById("step-success-section");
    successSection.innerHTML = `
        <div class="checkout-success-pane" style="padding: 1rem 0;">
            <div class="success-stamp-circle">✦</div>
            <h2 style="font-family: var(--font-heading); font-size: 1.75rem; color: var(--color-primary-indigo-dark); margin-bottom: 0.5rem;">Order Placed!</h2>
            <p style="color: var(--color-accent-ochre-dark); font-weight: 700; font-size: 0.9rem; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 1.5rem;">
                Order ID: ${orderNumber}
            </p>
            
            <p class="text-muted" style="font-size: 0.9rem; line-height: 1.6; margin-bottom: 1.5rem;">
                Thank you, <strong>${customerDetails.name}</strong>. A receipt and shipping updates will be sent to <strong>${customerDetails.email}</strong>.<br>
                Our artisan weavers are preparing your handcrafted Ajrakh garments. We ship globally with care.
            </p>
            
            <div class="success-receipt-card">
                <div class="receipt-header">
                    <span>Order Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    <span>Status: Paid/Confirmed</span>
                </div>
                
                <div class="receipt-section">
                    <span class="receipt-section-title">Shipping Address</span>
                    <span class="receipt-text">
                        ${customerDetails.name}<br>
                        ${customerDetails.address}, ${customerDetails.city} - ${customerDetails.zip}
                    </span>
                </div>
                
                <div class="receipt-section">
                    <span class="receipt-section-title">Payment Method</span>
                    <span class="receipt-text">${paymentText}</span>
                </div>
                
                <div class="receipt-section">
                    <span class="receipt-section-title">Items Ordered</span>
                    <div class="receipt-text" style="display: flex; flex-direction: column; gap: 0.25rem;">
                        ${cart.map(item => `
                            <div style="display: flex; justify-content: space-between;">
                                <span>${item.product.name} (Size: ${item.size}) × ${item.quantity}</span>
                                <span>₹${(item.product.price * item.quantity).toLocaleString("en-IN")}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <div class="receipt-section">
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 600; color: #6E6962;">
                        <span>Subtotal</span>
                        <span>₹${subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    ${appliedPromo ? `
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--color-success); font-weight: 600;">
                        <span>Discount (Promo Code)</span>
                        <span>-₹${discount.toLocaleString("en-IN")}</span>
                    </div>` : ''}
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #6E6962;">
                        <span>Shipping Fee</span>
                        <span>${shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString("en-IN")}`}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: #6E6962;">
                        <span>Taxes & GST (12%)</span>
                        <span>₹${taxes.toLocaleString("en-IN")}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; font-size: 1.05rem; font-weight: 700; color: var(--color-primary-madder); border-top: 1px solid var(--color-border); padding-top: 0.5rem; margin-top: 0.25rem;">
                        <span>Amount Paid</span>
                        <span>₹${total.toLocaleString("en-IN")}</span>
                    </div>
                </div>
            </div>
            
            <div class="payment-submit-wrapper" style="width: 100%; margin-top: 1.5rem;">
                <button type="button" class="btn btn-outline" id="receipt-print-btn" style="flex: 1;">Print Invoice</button>
                <button type="button" class="btn btn-primary" id="success-continue-shopping-btn" style="flex: 1.5;">Continue Shopping</button>
            </div>
        </div>
    `;

    document.getElementById("receipt-print-btn").addEventListener("click", () => {
        window.print();
    });

    document.getElementById("success-continue-shopping-btn").addEventListener("click", () => {
        closeModals();
    });

    changeCheckoutStep(3);

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

// --- TOAST NOTIFICATION SYSTEM ---
function showToast(product, size) {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerHTML = `
        <div class="toast-img-wrapper">
            <img src="${product.image}" alt="${product.name}" class="toast-img">
        </div>
        <div class="toast-details">
            <span class="toast-message">Added to Shopping Bag!</span>
            <h4 class="toast-product-name">${product.name}</h4>
            <span class="toast-product-size">Size: ${size}</span>
        </div>
        <button class="toast-close-btn" aria-label="Close notification">✕</button>
    `;

    toastContainer.appendChild(toast);

    // Trigger slide-in animation
    setTimeout(() => {
        toast.classList.add("active");
    }, 10);

    // Auto dismiss after 4 seconds
    const autoDismiss = setTimeout(() => {
        dismissToast(toast);
    }, 4000);

    // Manual dismiss on click
    toast.querySelector(".toast-close-btn").addEventListener("click", () => {
        clearTimeout(autoDismiss);
        dismissToast(toast);
    });
}

function dismissToast(toast) {
    toast.classList.remove("active");
    toast.addEventListener("transitionend", () => {
        toast.remove();
    });
}

// --- ADMIN PORTAL LOGIC & HELPERS ---
function openAdminLogin() {
    closeModals();
    document.getElementById("admin-login-error").textContent = "";
    document.getElementById("admin-login-modal").classList.add("active");
    document.getElementById("admin-username").focus();
}

function handleAdminLoginSubmit(e) {
    e.preventDefault();
    const usernameInput = document.getElementById("admin-username");
    const passwordInput = document.getElementById("admin-password");
    const errorMsg = document.getElementById("admin-login-error");
    const loginCard = document.querySelector(".admin-login-card");

    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    // Hardcoded credentials check
    if (username === "admin" && password === "ajrakh_admin_99") {
        // Success
        closeModals();
        openAdminDashboard();
    } else {
        // Failure: shake modal card and show error
        errorMsg.textContent = "Access denied. Invalid credentials.";
        loginCard.classList.remove("shake");
        void loginCard.offsetWidth; // Trigger layout reflow to restart CSS keyframe animation
        loginCard.classList.add("shake");
        passwordInput.value = "";
        passwordInput.focus();
    }
}

function openAdminDashboard() {
    document.getElementById("admin-panel-modal").classList.add("active");

    // Set default date picker value to today
    const dateInput = document.getElementById("expense-date");
    if (dateInput) {
        dateInput.value = new Date().toISOString().split('T')[0];
    }

    renderExpenses();
}

async function loadExpenses() {
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        try {
            const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/expenses?select=*`, {
                headers: {
                    apikey: SUPABASE_CONFIG.anonKey,
                    Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`
                }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.message || `HTTP ${response.status} error`;
                throw new Error(errorMsg);
            }
            return await response.json();
        } catch (error) {
            console.error("Supabase load error, falling back to LocalStorage:", error);
            return getLocalStorageExpenses();
        }
    } else {
        return getLocalStorageExpenses();
    }
}

function getLocalStorageExpenses() {
    try {
        return JSON.parse(localStorage.getItem("tantukarya_expenses") || "[]");
    } catch (e) {
        return [];
    }
}

async function renderExpenses() {
    const tableBody = document.getElementById("expense-table-body");
    const emptyState = document.getElementById("expense-empty-state");
    const totalIndicator = document.getElementById("admin-expenses-total");
    const statusBadge = document.getElementById("db-status-badge");

    if (!tableBody) return;

    // Update status badge UI
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        statusBadge.textContent = "Cloud Synced";
        statusBadge.className = "db-status-badge cloud";
    } else {
        statusBadge.textContent = "Local Mode";
        statusBadge.className = "db-status-badge local";
    }

    tableBody.innerHTML = `
        <tr>
            <td colspan="5" style="text-align: center; padding: 2rem; color: #8A8078;">
                <div style="display: inline-block; width: 18px; height: 18px; border: 2px solid var(--color-border); border-top-color: var(--color-primary-madder); border-radius: 50%; animation: cssSpin 0.8s linear infinite; margin-right: 0.5rem; vertical-align: middle;"></div>
                Loading expenses...
            </td>
        </tr>
    `;
    emptyState.classList.remove("active");

    try {
        const expenses = await loadExpenses();
        tableBody.innerHTML = "";

        let totalSum = 0;

        if (expenses.length === 0) {
            emptyState.classList.add("active");
        } else {
            emptyState.classList.remove("active");

            // Sort expenses by date descending
            const sortedExpenses = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date));

            sortedExpenses.forEach((exp) => {
                totalSum += parseFloat(exp.amount || 0);

                const tr = document.createElement("tr");

                // Format category class name for styling
                let catClass = "miscellaneous";
                if (exp.category === "Artisan Wages") catClass = "wages";
                else if (exp.category === "Raw Materials") catClass = "materials";
                else if (exp.category === "Shipping & Logistics") catClass = "shipping";
                else if (exp.category === "Utilities & Rents") catClass = "utilities";
                else if (exp.category === "Marketing & Brand") catClass = "marketing";

                // Format date to local
                const formattedDate = new Date(exp.date).toLocaleDateString('en-IN', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                });

                const deleteId = (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) ? exp.id : expenses.indexOf(exp);

                tr.innerHTML = `
                    <td>${formattedDate}</td>
                    <td><span class="expense-tag ${catClass}">${exp.category}</span></td>
                    <td>${escapeHTML(exp.description)}</td>
                    <td><strong>₹${parseFloat(exp.amount).toLocaleString("en-IN")}</strong></td>
                    <td>
                        <button type="button" class="expense-delete-btn" data-id="${deleteId}" aria-label="Delete expense">✕</button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }

        totalIndicator.textContent = `₹${totalSum.toLocaleString("en-IN")}`;
    } catch (error) {
        console.error("Error loading expenses:", error);
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; padding: 2rem; color: var(--color-primary-madder); font-weight: 600;">
                    Error loading expenses. Please try again.
                </td>
            </tr>
        `;
    }
}

async function handleExpenseSubmit(e) {
    e.preventDefault();
    const amountInput = document.getElementById("expense-amount");
    const dateInput = document.getElementById("expense-date");
    const categorySelect = document.getElementById("expense-category");
    const descInput = document.getElementById("expense-description");
    const submitBtn = e.target.querySelector("button[type='submit']");

    const amount = parseFloat(amountInput.value);
    const date = dateInput.value;
    const category = categorySelect.value;
    const description = descInput.value.trim();

    if (isNaN(amount) || amount <= 0 || !date || !category || !description) return;

    const newExpense = { amount, date, category, description };

    const originalBtnText = submitBtn.textContent;
    submitBtn.textContent = "Saving...";
    submitBtn.disabled = true;

    try {
        if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
            const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/expenses`, {
                method: "POST",
                headers: {
                    apikey: SUPABASE_CONFIG.anonKey,
                    Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify(newExpense)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                const errorMsg = errorData.message || `HTTP ${response.status} error`;
                throw new Error(errorMsg);
            }
        } else {
            const expenses = getLocalStorageExpenses();
            expenses.push(newExpense);
            localStorage.setItem("tantukarya_expenses", JSON.stringify(expenses));
        }

        // Reset form fields
        amountInput.value = "";
        descInput.value = "";
        dateInput.value = new Date().toISOString().split('T')[0];

        await renderExpenses();
        alert("Expense recorded successfully!");
    } catch (error) {
        console.error("Save expense error:", error);
        alert("Error saving expense. Please try again.");
    } finally {
        submitBtn.textContent = originalBtnText;
        submitBtn.disabled = false;
    }
}

async function deleteExpense(id) {
    if (confirm("Are you sure you want to delete this expense log?")) {
        try {
            if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
                const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/expenses?id=eq.${id}`, {
                    method: "DELETE",
                    headers: {
                        apikey: SUPABASE_CONFIG.anonKey,
                        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`
                    }
                });
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMsg = errorData.message || `HTTP ${response.status} error`;
                    throw new Error(errorMsg);
                }
            } else {
                const expenses = getLocalStorageExpenses();
                const index = parseInt(id);
                if (index > -1 && index < expenses.length) {
                    expenses.splice(index, 1);
                    localStorage.setItem("tantukarya_expenses", JSON.stringify(expenses));
                }
            }
            await renderExpenses();
        } catch (error) {
            console.error("Delete expense error:", error);
            alert("Error deleting expense. Please try again.");
        }
    }
}

async function exportExpensesToCSV() {
    const exportBtn = document.getElementById("expense-export-btn");
    const originalText = exportBtn.innerHTML;
    exportBtn.disabled = true;
    exportBtn.textContent = "Loading...";

    try {
        const expenses = await loadExpenses();
        if (expenses.length === 0) {
            alert("No expenses recorded to export.");
            return;
        }

        let csv = "Date,Category,Description,Amount (INR)\n";
        expenses.forEach(exp => {
            const escapedDesc = `"${(exp.description || "").replace(/"/g, '""')}"`;
            csv += `${exp.date},${exp.category},${escapedDesc},${exp.amount}\n`;
        });

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `tantukarya_expenses_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Export error:", error);
        alert("Error exporting expenses.");
    } finally {
        exportBtn.innerHTML = originalText;
        exportBtn.disabled = false;
    }
}

// Simple HTML escaping helper to prevent XSS in admin tables
function escapeHTML(str) {
    return str.replace(/[&<>'"]/g,
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

