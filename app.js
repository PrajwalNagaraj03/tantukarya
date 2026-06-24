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

// Dynamic Catalog & Inventory State
let productsCatalog = [];
let inventoryStore = {}; // mapping of "product-id_size" to stock integer

// Orders & POS State
let ordersHistory = [];
let posCart = [];

// Checkout State
let checkoutStep = 1;
let appliedPromo = false;
let customerDetails = { name: "", email: "", phone: "", address: "", city: "", zip: "" };
let currentCustomer = null;
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
document.addEventListener("DOMContentLoaded", async () => {
    loadCartFromLocalStorage();
    loadCustomerSession();
    await initializeAppCatalogAndInventory();
    renderProducts();
    setupEventListeners();
    updateCartUI();
});

// --- DYNAMIC CATALOG & INVENTORY APIs ---

async function fetchProducts() {
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        try {
            const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/products?select=*`, {
                headers: {
                    apikey: SUPABASE_CONFIG.anonKey,
                    Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`
                }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status} error`);
            }
            return await response.json();
        } catch (error) {
            console.error("Supabase fetch products error, falling back to LocalStorage:", error);
            return getLocalStorageProducts();
        }
    } else {
        return getLocalStorageProducts();
    }
}

function getLocalStorageProducts() {
    try {
        const stored = localStorage.getItem("tantukarya_products");
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

async function fetchInventory() {
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        try {
            const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/inventory?select=*`, {
                headers: {
                    apikey: SUPABASE_CONFIG.anonKey,
                    Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`
                }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status} error`);
            }
            return await response.json();
        } catch (error) {
            console.error("Supabase fetch inventory error, falling back to LocalStorage:", error);
            return getLocalStorageInventory();
        }
    } else {
        return getLocalStorageInventory();
    }
}

function getLocalStorageInventory() {
    try {
        const stored = localStorage.getItem("tantukarya_inventory");
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

async function initializeAppCatalogAndInventory() {
    // 1. Fetch products catalog
    let dbProducts = await fetchProducts();
    
    // Seed default template if DB/LocalStorage is empty
    if (dbProducts.length === 0) {
        dbProducts = PRODUCTS.map(p => ({
            id: p.id,
            name: p.name,
            category: p.category,
            price: p.price,
            image: p.image,
            badge: p.badge || "",
            description: p.description,
            craft_specs: p.craftSpecs,
            sizes: p.sizes.join(",")
        }));
        
        if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
            try {
                await fetch(`${SUPABASE_CONFIG.url}/rest/v1/products`, {
                    method: "POST",
                    headers: {
                        apikey: SUPABASE_CONFIG.anonKey,
                        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal"
                    },
                    body: JSON.stringify(dbProducts)
                });
            } catch (err) {
                console.error("Failed to seed products catalog in Supabase:", err);
            }
        } else {
            localStorage.setItem("tantukarya_products", JSON.stringify(dbProducts));
        }
    }
    
    // Map to app objects and deduplicate by ID to prevent any duplicate rendering
    const uniqueProducts = [];
    const seenIds = new Set();
    dbProducts.forEach(p => {
        if (!seenIds.has(p.id)) {
            seenIds.add(p.id);
            uniqueProducts.push(p);
        }
    });

    productsCatalog = uniqueProducts.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        image: p.image,
        badge: p.badge,
        description: p.description,
        craftSpecs: p.craft_specs,
        sizes: typeof p.sizes === 'string' ? p.sizes.split(',').map(s => s.trim()) : p.sizes
    }));
    
    // 2. Fetch stock levels
    let dbInventory = await fetchInventory();
    const inventoryMap = {};
    const missingRows = [];
    
    dbInventory.forEach(row => {
        inventoryMap[`${row.product_id}_${row.size}`] = Number(row.stock);
    });
    
    productsCatalog.forEach(p => {
        p.sizes.forEach(sz => {
            const key = `${p.id}_${sz}`;
            if (inventoryMap[key] === undefined) {
                inventoryMap[key] = 10; // Default to 10
                missingRows.push({
                    product_id: p.id,
                    size: sz,
                    stock: 10
                });
            }
        });
    });
    
    if (missingRows.length > 0) {
        if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
            try {
                await fetch(`${SUPABASE_CONFIG.url}/rest/v1/inventory`, {
                    method: "POST",
                    headers: {
                        apikey: SUPABASE_CONFIG.anonKey,
                        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal"
                    },
                    body: JSON.stringify(missingRows)
                });
            } catch (err) {
                console.error("Failed to seed missing stock rows:", err);
            }
        } else {
            const currentStored = getLocalStorageInventory();
            localStorage.setItem("tantukarya_inventory", JSON.stringify([...currentStored, ...missingRows]));
        }
    }
    
    inventoryStore = inventoryMap;
}

// --- RENDER FUNCTIONS ---
function renderProducts() {
    productGrid.innerHTML = "";

    const filteredProducts = activeFilter === "all"
        ? productsCatalog
        : productsCatalog.filter(p => p.category === activeFilter);

    filteredProducts.forEach(product => {
        const sizes = product.sizes;
        const totalStock = sizes.reduce((sum, sz) => sum + (inventoryStore[`${product.id}_${sz}`] || 0), 0);
        const isSoldOut = totalStock <= 0;

        const productCard = document.createElement("div");
        productCard.className = `product-card ${isSoldOut ? 'sold-out' : ''}`;
        productCard.innerHTML = `
            <div class="product-image-container">
                ${isSoldOut ? '<span class="product-badge sale" style="background-color: #8A8078;">SOLD OUT</span>' : (product.badge ? `<span class="product-badge ${product.badge.toLowerCase() === 'sale' ? 'sale' : ''}">${product.badge}</span>` : '')}
                <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy" style="${isSoldOut ? 'opacity: 0.5; filter: grayscale(100%);' : ''}">
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
                    <button class="product-add-cart-icon-btn product-quick-add-btn" data-id="${product.id}" aria-label="Add ${product.name} to cart" ${isSoldOut ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>
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
    const product = productsCatalog.find(p => p.id === productId);
    if (!product) return;

    selectedProductForModal = product;
    
    // Find first size in stock
    const sizes = product.sizes;
    let defaultSelectedSize = sizes[0];
    for (let sz of sizes) {
        if ((inventoryStore[`${product.id}_${sz}`] || 0) > 0) {
            defaultSelectedSize = sz;
            break;
        }
    }
    selectedSizeForModal = defaultSelectedSize;

    // Helper to get stock notice
    const getStockNotice = (sz) => {
        const stock = inventoryStore[`${product.id}_${sz}`] || 0;
        if (stock <= 0) return `<span style="color: var(--color-primary-madder); font-size: 0.72rem; display: block; margin-top: 0.2rem;">Out of Stock</span>`;
        if (stock <= 3) return `<span style="color: var(--color-accent-ochre-dark); font-size: 0.72rem; display: block; margin-top: 0.2rem; font-weight: bold;">Only ${stock} left!</span>`;
        return `<span style="color: #0F8040; font-size: 0.72rem; display: block; margin-top: 0.2rem;">In Stock</span>`;
    };

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
                ${product.sizes.map(size => {
                    const isOutOfStock = (inventoryStore[`${product.id}_${size}`] || 0) <= 0;
                    return `
                        <div class="size-chip-wrapper" style="text-align: center;">
                            <button class="size-chip ${size === selectedSizeForModal ? 'selected' : ''} ${isOutOfStock ? 'disabled' : ''}" 
                                    data-size="${size}" 
                                    ${isOutOfStock ? 'style="opacity: 0.4; text-decoration: line-through; cursor: not-allowed;"' : ''}>
                                ${size}
                            </button>
                            ${getStockNotice(size)}
                        </div>
                    `;
                }).join('')}
            </div>
            
            <button class="btn btn-primary modal-add-btn" id="modal-add-to-cart-action" style="margin-top: 1rem;">Add to Shopping Bag</button>
            
            <div class="modal-craft-notes">
                <strong>Craft Specifications:</strong><br>
                ${product.craftSpecs}
            </div>
        </div>
    `;

    updateModalAddToCartButtonState(product, selectedSizeForModal);

    // Hook size chip listeners inside modal
    const sizeChips = modalContentDetails.querySelectorAll(".size-chip");
    sizeChips.forEach(chip => {
        chip.addEventListener("click", (e) => {
            const btn = e.target.closest(".size-chip");
            if (btn.classList.contains("disabled")) return;
            
            sizeChips.forEach(c => c.classList.remove("selected"));
            btn.classList.add("selected");
            selectedSizeForModal = btn.getAttribute("data-size");
            updateModalAddToCartButtonState(product, selectedSizeForModal);
        });
    });

    // Add to cart action inside modal
    modalContentDetails.querySelector("#modal-add-to-cart-action").addEventListener("click", () => {
        const stock = inventoryStore[`${selectedProductForModal.id}_${selectedSizeForModal}`] || 0;
        if (stock <= 0) {
            alert("This item is currently out of stock!");
            return;
        }
        addToCart(selectedProductForModal.id, selectedSizeForModal);
        closeModals();
        openCartDrawer();
    });

    productModal.classList.add("active");
}

function updateModalAddToCartButtonState(product, size) {
    const stock = inventoryStore[`${product.id}_${size}`] || 0;
    const addBtn = document.getElementById("modal-add-to-cart-action");
    if (!addBtn) return;
    
    if (stock <= 0) {
        addBtn.textContent = "Out of Stock";
        addBtn.setAttribute("disabled", "true");
        addBtn.style.opacity = "0.5";
        addBtn.style.pointerEvents = "none";
    } else {
        addBtn.textContent = "Add to Shopping Bag";
        addBtn.removeAttribute("disabled");
        addBtn.style.opacity = "1";
        addBtn.style.pointerEvents = "auto";
    }
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
    const product = productsCatalog.find(p => p.id === productId);
    if (!product) return;

    // Check stock level limit
    const stock = inventoryStore[`${productId}_${size}`] || 0;
    const existingIndex = cart.findIndex(item => item.product.id === productId && item.size === size);
    const existingQty = existingIndex > -1 ? cart[existingIndex].quantity : 0;

    if (existingQty >= stock) {
        alert(`Cannot add more of this item. Only ${stock} units are in stock.`);
        return;
    }

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
        const item = cart[index];
        const newQty = item.quantity + change;

        if (change > 0) {
            // Check stock level limit
            const stock = inventoryStore[`${productId}_${size}`] || 0;
            if (newQty > stock) {
                alert(`Only ${stock} items are available in stock.`);
                return;
            }
        }

        item.quantity = newQty;
        if (item.quantity <= 0) {
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

        // Populate inputs if customer details exist, otherwise pre-fill from current logged in customer
        const nameVal = customerDetails.name || (currentCustomer ? currentCustomer.name : "");
        const emailVal = customerDetails.email || (currentCustomer ? currentCustomer.email : "");
        const phoneVal = customerDetails.phone || (currentCustomer ? currentCustomer.phone : "");

        document.getElementById("shipping-name").value = nameVal;
        document.getElementById("shipping-email").value = emailVal;
        document.getElementById("shipping-phone").value = phoneVal;
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

            const phoneInput = document.getElementById("shipping-phone");
            const phoneVal = phoneInput ? phoneInput.value.trim() : "";

            if (!phoneVal) {
                showNotification("Mobile number is required.", "error");
                if (phoneInput) phoneInput.focus();
                return;
            }

            // Validate it's exactly 10 digits
            const digitsOnly = phoneVal.replace(/[^0-9]/g, "");
            if (digitsOnly.length !== 10) {
                showNotification("Please enter a valid 10-digit mobile number.", "error");
                if (phoneInput) phoneInput.focus();
                return;
            }

            customerDetails.name = document.getElementById("shipping-name").value.trim();
            customerDetails.email = document.getElementById("shipping-email").value.trim();
            customerDetails.phone = digitsOnly;
            customerDetails.address = document.getElementById("shipping-address").value.trim();
            customerDetails.city = document.getElementById("shipping-city").value.trim();
            customerDetails.zip = document.getElementById("shipping-zip").value.trim();

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

    // Admin tab switching
    const tabBtnExpenses = document.getElementById("tab-btn-expenses");
    const tabBtnProducts = document.getElementById("tab-btn-products");
    const tabBtnStocks = document.getElementById("tab-btn-stocks");
    const tabBtnPOS = document.getElementById("tab-btn-pos");
    const tabBtnOrders = document.getElementById("tab-btn-orders");

    const tabExpensesContent = document.getElementById("tab-expenses-content");
    const tabProductsContent = document.getElementById("tab-products-content");
    const tabStocksContent = document.getElementById("tab-stocks-content");
    const tabPOSContent = document.getElementById("tab-pos-content");
    const tabOrdersContent = document.getElementById("tab-orders-content");

    const allTabBtns = [tabBtnExpenses, tabBtnProducts, tabBtnStocks, tabBtnPOS, tabBtnOrders];
    const allTabContents = [tabExpensesContent, tabProductsContent, tabStocksContent, tabPOSContent, tabOrdersContent];

    function switchTab(activeBtn, activeContent, displayMode = "grid") {
        allTabBtns.forEach(btn => { if (btn) btn.classList.remove("active"); });
        allTabContents.forEach(content => { if (content) content.style.display = "none"; });
        if (activeBtn) activeBtn.classList.add("active");
        if (activeContent) activeContent.style.display = displayMode;
    }

    if (tabBtnExpenses) {
        tabBtnExpenses.addEventListener("click", () => {
            switchTab(tabBtnExpenses, tabExpensesContent, "grid");
        });
    }
    if (tabBtnProducts) {
        tabBtnProducts.addEventListener("click", () => {
            switchTab(tabBtnProducts, tabProductsContent, "grid");
            renderAdminProductsTab();
        });
    }
    if (tabBtnStocks) {
        tabBtnStocks.addEventListener("click", () => {
            switchTab(tabBtnStocks, tabStocksContent, "flex");
            renderAdminStocksTab(true);
        });
    }
    if (tabBtnPOS) {
        tabBtnPOS.addEventListener("click", () => {
            switchTab(tabBtnPOS, tabPOSContent, "flex");
            renderPOSProductDropdown();
        });
    }
    if (tabBtnOrders) {
        tabBtnOrders.addEventListener("click", () => {
            switchTab(tabBtnOrders, tabOrdersContent, "flex");
            renderOrdersList();
        });
    }

    // Stock filtering events
    const stockSearch = document.getElementById("stock-search");
    const stockCategoryFilter = document.getElementById("stock-category-filter");
    const stockStatusFilter = document.getElementById("stock-status-filter");

    if (stockSearch) {
        stockSearch.addEventListener("input", () => {
            renderAdminStocksTab(false);
        });
    }
    if (stockCategoryFilter) {
        stockCategoryFilter.addEventListener("change", () => {
            renderAdminStocksTab(false);
        });
    }
    if (stockStatusFilter) {
        stockStatusFilter.addEventListener("change", () => {
            renderAdminStocksTab(false);
        });
    }

    // POS interactions
    const posProductSelect = document.getElementById("pos-product-select");
    if (posProductSelect) {
        posProductSelect.addEventListener("change", updatePOSSizeDropdown);
    }

    const posAddItemBtn = document.getElementById("pos-add-item-btn");
    if (posAddItemBtn) {
        posAddItemBtn.addEventListener("click", addPOSCartItem);
    }

    const adminPosForm = document.getElementById("admin-pos-form");
    if (adminPosForm) {
        adminPosForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            if (posCart.length === 0) {
                showNotification("Cannot place order. POS cart is empty.", "error");
                return;
            }
            
            const customerName = document.getElementById("pos-customer-name").value.trim() || "Walk-in Customer";
            const customerEmail = document.getElementById("pos-customer-email").value.trim();
            const paymentMethod = document.getElementById("pos-payment-method").value;
            
            const subtotal = posCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
            const taxes = Math.round(subtotal * 0.12);
            const total = subtotal + taxes;
            const orderNumber = "TK-" + Math.floor(100000 + Math.random() * 900000);
            
            const orderData = {
                id: orderNumber,
                created_at: new Date().toISOString(),
                customer_name: customerName,
                customer_email: customerEmail || null,
                customer_address: null,
                customer_city: null,
                customer_zip: null,
                items: posCart,
                subtotal: subtotal,
                discount: 0,
                shipping: 0,
                taxes: taxes,
                total_amount: total,
                payment_method: paymentMethod,
                type: "offline"
            };
            
            try {
                await createOrder(orderData);
                await decrementInventoryOnCheckout(posCart);
                showNotification(`Offline order ${orderNumber} created successfully!`, "success");
                
                // Automatically download invoice PDF
                const pdfBlob = generateInvoicePDF(orderData);
                downloadPDF(pdfBlob, `${orderNumber}.pdf`);
                
                posCart = [];
                renderPOSCart();
                document.getElementById("pos-customer-name").value = "Walk-in Customer";
                document.getElementById("pos-customer-email").value = "";
                
                await renderAdminProductsTab();
                await renderAdminStocksTab();
                renderProducts();
                await renderOrdersList();
                updatePOSSizeDropdown();
            } catch (err) {
                console.error("Error creating offline POS order:", err);
                showNotification("Failed to record offline order. Check logs for details.", "error");
            }
        });
    }

    // Admin product form submission
    const adminProductForm = document.getElementById("admin-product-form");
    if (adminProductForm) {
        adminProductForm.addEventListener("submit", handleProductSubmit);
    }

    // Admin product image preview
    const productImageFile = document.getElementById("product-image-file");
    const productImagePreview = document.getElementById("product-image-preview");
    const productImagePreviewContainer = document.getElementById("product-image-preview-container");
    if (productImageFile && productImagePreview && productImagePreviewContainer) {
        productImageFile.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    productImagePreview.src = event.target.result;
                    productImagePreviewContainer.style.display = "block";
                };
                reader.readAsDataURL(file);
            } else {
                productImagePreviewContainer.style.display = "none";
            }
        });
    }

    // Admin sign out buttons click handlers
    const signOutIds = [
        "admin-sign-out",
        "admin-sign-out-products",
        "admin-sign-out-stocks",
        "admin-sign-out-pos",
        "admin-sign-out-orders",
        "admin-sign-out-inv"
    ];
    signOutIds.forEach(id => {
        const btn = document.getElementById(id);
        if (btn) {
            btn.addEventListener("click", () => {
                closeModals();
                // Clear inputs
                const usernameInput = document.getElementById("admin-username");
                const passwordInput = document.getElementById("admin-password");
                if (usernameInput) usernameInput.value = "";
                if (passwordInput) passwordInput.value = "";
            });
        }
    });

    // --- CUSTOMER AUTHENTICATION EVENT LISTENERS ---
    const accountBtn = document.getElementById("account-btn");
    const custAuthModal = document.getElementById("customer-auth-modal");
    const authClose = document.getElementById("customer-auth-close");
    const profileCloseBtn = document.getElementById("customer-profile-close-btn");
    const goSignup = document.getElementById("go-to-signup");
    const goLogin = document.getElementById("go-to-login");
    const customerLoginView = document.getElementById("customer-login-view");
    const customerSignupView = document.getElementById("customer-signup-view");
    const customerProfileView = document.getElementById("customer-profile-view");

    if (accountBtn && custAuthModal) {
        accountBtn.addEventListener("click", () => {
            closeModals();
            custAuthModal.classList.add("active");

            if (currentCustomer) {
                // Show profile
                customerLoginView.style.display = "none";
                customerSignupView.style.display = "none";
                customerProfileView.style.display = "block";

                document.getElementById("profile-welcome-title").textContent = `Hello, ${currentCustomer.name.split(' ')[0]}`;
                document.getElementById("profile-email-text").textContent = currentCustomer.email;
                document.getElementById("profile-phone-text").textContent = currentCustomer.phone;

                renderCustomerOrdersProfile();
            } else {
                // Show login
                customerLoginView.style.display = "block";
                customerSignupView.style.display = "none";
                customerProfileView.style.display = "none";
                document.getElementById("customer-login-error").textContent = "";
            }
        });
    }

    if (authClose) {
        authClose.addEventListener("click", () => {
            custAuthModal.classList.remove("active");
        });
    }
    if (profileCloseBtn) {
        profileCloseBtn.addEventListener("click", () => {
            custAuthModal.classList.remove("active");
        });
    }
    if (custAuthModal) {
        custAuthModal.addEventListener("click", (e) => {
            if (e.target === custAuthModal) {
                custAuthModal.classList.remove("active");
            }
        });
    }

    if (goSignup && customerLoginView && customerSignupView) {
        goSignup.addEventListener("click", (e) => {
            e.preventDefault();
            customerLoginView.style.display = "none";
            customerSignupView.style.display = "block";
            customerProfileView.style.display = "none";
            document.getElementById("customer-signup-error").textContent = "";
        });
    }

    if (goLogin && customerLoginView && customerSignupView) {
        goLogin.addEventListener("click", (e) => {
            e.preventDefault();
            customerLoginView.style.display = "block";
            customerSignupView.style.display = "none";
            customerProfileView.style.display = "none";
            document.getElementById("customer-login-error").textContent = "";
        });
    }

    // Customer signup submit
    const customerSignupForm = document.getElementById("customer-signup-form");
    if (customerSignupForm) {
        customerSignupForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("cust-signup-name").value.trim();
            const email = document.getElementById("cust-signup-email").value.trim();
            const phone = document.getElementById("cust-signup-phone").value.trim();
            const password = document.getElementById("cust-signup-password").value;
            const errorEl = document.getElementById("customer-signup-error");

            errorEl.textContent = "";

            try {
                const exists = await checkCustomerExists(email, phone);
                if (exists) {
                    showNotification("Account already exists with this email or phone number. Redirecting to login...", "warning");
                    
                    // Redirect to login
                    customerSignupView.style.display = "none";
                    customerLoginView.style.display = "block";
                    
                    // Pre-fill email and clear password
                    document.getElementById("cust-login-email").value = email;
                    document.getElementById("cust-login-password").value = "";
                    document.getElementById("cust-login-password").focus();
                    
                    customerSignupForm.reset();
                    return;
                }

                const cust = await createCustomer(name, email, phone, password);
                showNotification("Registration successful! Logging you in...", "success");

                currentCustomer = cust;
                localStorage.setItem("tantukarya_logged_in_customer", JSON.stringify(cust));
                updateHeaderAccountButton();

                customerSignupForm.reset();
                custAuthModal.classList.remove("active");
            } catch (err) {
                console.error("Signup error:", err);
                errorEl.textContent = err.message || "Failed to create account.";
            }
        });
    }

    // Customer login submit
    const customerLoginForm = document.getElementById("customer-login-form");
    if (customerLoginForm) {
        customerLoginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("cust-login-email").value.trim();
            const password = document.getElementById("cust-login-password").value;
            const errorEl = document.getElementById("customer-login-error");

            errorEl.textContent = "";

            try {
                const cust = await authenticateCustomer(email, password);
                if (!cust) {
                    errorEl.textContent = "Invalid email or password.";
                    return;
                }

                showNotification(`Welcome back, ${cust.name.split(' ')[0]}!`, "success");
                currentCustomer = cust;
                localStorage.setItem("tantukarya_logged_in_customer", JSON.stringify(cust));
                updateHeaderAccountButton();

                customerLoginForm.reset();
                custAuthModal.classList.remove("active");
            } catch (err) {
                console.error("Login error:", err);
                errorEl.textContent = err.message || "Failed to log in.";
            }
        });
    }

    // Customer logout
    const customerLogoutBtn = document.getElementById("customer-logout-btn");
    if (customerLogoutBtn) {
        customerLogoutBtn.addEventListener("click", () => {
            currentCustomer = null;
            localStorage.removeItem("tantukarya_logged_in_customer");
            updateHeaderAccountButton();
            showNotification("Logged out successfully.", "success");
            custAuthModal.classList.remove("active");
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

async function completeAndRenderSuccess() {
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

    // Create order object for DB / storage
    const orderData = {
        id: orderNumber,
        created_at: new Date().toISOString(),
        customer_name: customerDetails.name,
        customer_email: customerDetails.email || null,
        customer_phone: customerDetails.phone || null,
        customer_address: customerDetails.address || null,
        customer_city: customerDetails.city || null,
        customer_zip: customerDetails.zip || null,
        items: [...cart], // copy current cart items
        subtotal: subtotal,
        discount: discount,
        shipping: shipping,
        taxes: taxes,
        total_amount: total,
        payment_method: selectedPaymentMethod,
        type: "online"
    };

    // Save order in database and storage asynchronously
    createOrder(orderData).catch(err => console.error("Error storing online order:", err));

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
                        ${customerDetails.address}, ${customerDetails.city} - ${customerDetails.zip}<br>
                        Phone: ${customerDetails.phone}
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
        const pdfBlob = generateInvoicePDF(orderData);
        downloadPDF(pdfBlob, `${orderNumber}.pdf`);
    });

    document.getElementById("success-continue-shopping-btn").addEventListener("click", () => {
        closeModals();
    });

    decrementInventoryOnCheckout(cart);

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

    // Reset tabs
    const tabBtnExpenses = document.getElementById("tab-btn-expenses");
    const tabBtnProducts = document.getElementById("tab-btn-products");
    const tabBtnStocks = document.getElementById("tab-btn-stocks");
    const tabBtnPOS = document.getElementById("tab-btn-pos");
    const tabBtnOrders = document.getElementById("tab-btn-orders");

    const tabExpensesContent = document.getElementById("tab-expenses-content");
    const tabProductsContent = document.getElementById("tab-products-content");
    const tabStocksContent = document.getElementById("tab-stocks-content");
    const tabPOSContent = document.getElementById("tab-pos-content");
    const tabOrdersContent = document.getElementById("tab-orders-content");

    const btns = [tabBtnExpenses, tabBtnProducts, tabBtnStocks, tabBtnPOS, tabBtnOrders];
    const contents = [tabExpensesContent, tabProductsContent, tabStocksContent, tabPOSContent, tabOrdersContent];

    btns.forEach(btn => { if (btn) btn.classList.remove("active"); });
    contents.forEach(content => { if (content) content.style.display = "none"; });

    if (tabBtnExpenses) tabBtnExpenses.classList.add("active");
    if (tabExpensesContent) tabExpensesContent.style.display = "grid";

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
    if (!str) return "";
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

async function decrementInventoryOnCheckout(cartItems) {
    for (const item of cartItems) {
        const key = `${item.product.id}_${item.size}`;
        const currentStock = inventoryStore[key] || 0;
        const newStock = Math.max(0, currentStock - item.quantity);
        
        inventoryStore[key] = newStock;
        
        if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
            try {
                const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/inventory?product_id=eq.${item.product.id}&size=eq.${item.size}`, {
                    method: "PATCH",
                    headers: {
                        apikey: SUPABASE_CONFIG.anonKey,
                        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal"
                    },
                    body: JSON.stringify({ stock: newStock })
                });
                if (!response.ok) {
                    console.error(`Failed to decrement stock in db for ${key}`);
                }
            } catch (err) {
                console.error(`Network error decrementing stock in db for ${key}:`, err);
            }
        } else {
            saveLocalStorageInventory();
        }
    }
}

function saveLocalStorageInventory() {
    const rows = Object.keys(inventoryStore).map(k => {
        const [pid, sz] = k.split('_');
        return { product_id: pid, size: sz, stock: inventoryStore[k] };
    });
    localStorage.setItem("tantukarya_inventory", JSON.stringify(rows));
}

async function renderAdminProductsTab() {
    const tableBody = document.getElementById("products-table-body");
    const emptyState = document.getElementById("products-empty-state");
    if (!tableBody) return;

    tableBody.innerHTML = `
        <tr>
            <td colspan="3" style="text-align: center; padding: 2rem; color: #8A8078;">
                <div style="display: inline-block; width: 18px; height: 18px; border: 2px solid var(--color-border); border-top-color: var(--color-primary-madder); border-radius: 50%; animation: cssSpin 0.8s linear infinite; margin-right: 0.5rem; vertical-align: middle;"></div>
                Loading products catalog...
            </td>
        </tr>
    `;
    emptyState.classList.remove("active");

    try {
        await refreshCatalogAndInventory();

        tableBody.innerHTML = "";

        if (productsCatalog.length === 0) {
            emptyState.classList.add("active");
            return;
        }

        emptyState.classList.remove("active");

        productsCatalog.forEach(p => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>
                    <div style="display: flex; align-items: center; gap: 0.75rem;">
                        <img src="${p.image}" class="admin-product-thumb" alt="${p.name}">
                        <div class="admin-product-meta-cell">
                            <strong style="color: var(--color-primary-indigo-dark);">${p.name}</strong>
                            <span>ID: ${p.id}</span>
                        </div>
                    </div>
                </td>
                <td>
                    <div class="admin-product-meta-cell">
                        <span>Category: ${p.category}</span>
                        <strong>₹${p.price.toLocaleString("en-IN")}</strong>
                    </div>
                </td>
                <td>
                    <button type="button" class="expense-delete-btn admin-product-delete-btn" data-id="${p.id}" aria-label="Delete product" style="color: var(--color-primary-madder);">✕</button>
                </td>
            `;
            tableBody.appendChild(tr);
        });

        const deleteButtons = tableBody.querySelectorAll(".admin-product-delete-btn");
        deleteButtons.forEach(btn => {
            btn.addEventListener("click", () => {
                const pid = btn.getAttribute("data-id");
                deleteProduct(pid);
            });
        });

    } catch (err) {
        console.error("Error rendering admin products catalog:", err);
        tableBody.innerHTML = `
            <tr>
                <td colspan="3" style="text-align: center; padding: 2rem; color: var(--color-primary-madder); font-weight: 600;">
                    Error loading catalog data. Please try again.
                </td>
            </tr>
        `;
    }
}

async function renderAdminStocksTab(refetch = true) {
    const cardsGrid = document.getElementById("stock-cards-grid");
    const emptyState = document.getElementById("stock-empty-state");
    if (!cardsGrid) return;

    if (refetch) {
        cardsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #8A8078;">
                <div style="display: inline-block; width: 24px; height: 24px; border: 2.5px solid var(--color-border); border-top-color: var(--color-primary-madder); border-radius: 50%; animation: cssSpin 0.8s linear infinite; margin-right: 0.5rem; vertical-align: middle;"></div>
                Loading catalog and stock levels...
            </div>
        `;
        if (emptyState) emptyState.classList.remove("active");
        try {
            await refreshCatalogAndInventory();
        } catch (err) {
            console.error("Error fetching inventory data:", err);
            cardsGrid.innerHTML = `
                <div style="grid-column: 1 / -1; text-align: center; padding: 2rem; color: var(--color-primary-madder); font-weight: 600;">
                    Error loading inventory data. Please try again.
                </div>
            `;
            return;
        }
    }

    cardsGrid.innerHTML = "";

    const searchTerm = (document.getElementById("stock-search")?.value || "").trim().toLowerCase();
    const categoryVal = document.getElementById("stock-category-filter")?.value || "all";
    const statusVal = document.getElementById("stock-status-filter")?.value || "all";

    // Filter products
    const filteredProducts = productsCatalog.filter(p => {
        // 1. Search term match (name or id)
        const matchesSearch = p.name.toLowerCase().includes(searchTerm) || p.id.toLowerCase().includes(searchTerm);
        if (!matchesSearch) return false;

        // 2. Category match
        if (categoryVal !== "all" && p.category !== categoryVal) return false;

        // 3. Status filter match
        if (statusVal !== "all") {
            const hasStatus = p.sizes.some(sz => {
                const key = `${p.id}_${sz}`;
                const stock = inventoryStore[key] !== undefined ? inventoryStore[key] : 10;
                if (statusVal === "low") {
                    return stock > 0 && stock <= 3;
                } else if (statusVal === "out") {
                    return stock <= 0;
                }
                return false;
            });
            if (!hasStatus) return false;
        }

        return true;
    });

    if (filteredProducts.length === 0) {
        if (emptyState) emptyState.classList.add("active");
        return;
    }

    if (emptyState) emptyState.classList.remove("active");

    filteredProducts.forEach(p => {
        const card = document.createElement("div");
        card.className = "stock-card";

        const sizesHtml = p.sizes.map(sz => {
            const key = `${p.id}_${sz}`;
            const stock = inventoryStore[key] !== undefined ? inventoryStore[key] : 10;

            let statusClass = "ok";
            let statusText = "In Stock";
            if (stock <= 0) {
                statusClass = "out";
                statusText = "Out of Stock";
            } else if (stock <= 3) {
                statusClass = "low";
                statusText = "Low Stock";
            }

            return `
                <div class="stock-size-row" data-id="${p.id}" data-size="${sz}">
                    <div class="stock-size-info">
                        <span class="stock-size-badge">${sz}</span>
                        <span class="stock-size-qty">Stock: <span class="stock-qty-val" data-id="${p.id}" data-size="${sz}">${stock}</span></span>
                    </div>
                    <div class="stock-size-controls">
                        <button type="button" class="stock-qty-btn stock-dec-btn" data-id="${p.id}" data-size="${sz}">-</button>
                        <div class="stock-qty-input-wrapper">
                            <input type="number" class="admin-stock-input" data-id="${p.id}" data-size="${sz}" value="${stock}" min="0">
                        </div>
                        <button type="button" class="stock-qty-btn stock-inc-btn" data-id="${p.id}" data-size="${sz}">+</button>
                        <span class="stock-warning-tag ${statusClass}">${statusText}</span>
                        <div class="stock-save-spinner" id="spinner-${p.id}-${sz}"></div>
                    </div>
                </div>
            `;
        }).join("");

        card.innerHTML = `
            <div class="stock-card-header">
                <img src="${p.image}" class="stock-card-img" alt="${p.name}">
                <div class="stock-card-info">
                    <h4 class="stock-card-title">${p.name}</h4>
                    <div class="stock-card-meta">
                        <span>ID: <strong>${p.id}</strong></span>
                        <span>Price: <strong>₹${p.price.toLocaleString("en-IN")}</strong></span>
                    </div>
                </div>
            </div>
            <div class="stock-card-sizes">
                ${sizesHtml}
            </div>
        `;

        cardsGrid.appendChild(card);
    });

    // Wire up events in the grid
    const decBtns = cardsGrid.querySelectorAll(".stock-dec-btn");
    const incBtns = cardsGrid.querySelectorAll(".stock-inc-btn");
    const stockInputs = cardsGrid.querySelectorAll(".admin-stock-input");

    decBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const pid = btn.getAttribute("data-id");
            const sz = btn.getAttribute("data-size");
            const input = cardsGrid.querySelector(`.admin-stock-input[data-id="${pid}"][data-size="${sz}"]`);
            const newVal = Math.max(0, parseInt(input.value || "0") - 1);
            input.value = newVal;
            triggerStockAutoSave(pid, sz, newVal);
        });
    });

    incBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const pid = btn.getAttribute("data-id");
            const sz = btn.getAttribute("data-size");
            const input = cardsGrid.querySelector(`.admin-stock-input[data-id="${pid}"][data-size="${sz}"]`);
            const newVal = parseInt(input.value || "0") + 1;
            input.value = newVal;
            triggerStockAutoSave(pid, sz, newVal);
        });
    });

    stockInputs.forEach(input => {
        input.addEventListener("change", () => {
            const pid = input.getAttribute("data-id");
            const sz = input.getAttribute("data-size");
            const newVal = Math.max(0, parseInt(input.value || "0"));
            input.value = newVal;
            triggerStockAutoSave(pid, sz, newVal);
        });
    });
}

async function refreshCatalogAndInventory() {
    const dbProducts = await fetchProducts();
    const dbInventory = await fetchInventory();

    const uniqueProducts = [];
    const seenIds = new Set();
    dbProducts.forEach(p => {
        if (!seenIds.has(p.id)) {
            seenIds.add(p.id);
            uniqueProducts.push(p);
        }
    });

    productsCatalog = uniqueProducts.map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        image: p.image,
        badge: p.badge,
        description: p.description,
        craftSpecs: p.craft_specs,
        sizes: typeof p.sizes === 'string' ? p.sizes.split(',').map(s => s.trim()) : p.sizes
    }));

    const inventoryMap = {};
    dbInventory.forEach(row => {
        inventoryMap[`${row.product_id}_${row.size}`] = Number(row.stock);
    });

    inventoryStore = inventoryMap;
}

const stockSaveDebounceTimers = {};

function triggerStockAutoSave(productId, size, stock) {
    const key = `${productId}_${size}`;
    
    inventoryStore[key] = stock;
    
    const stockGrid = document.getElementById("stock-cards-grid");
    if (stockGrid) {
        const input = stockGrid.querySelector(`.admin-stock-input[data-id="${productId}"][data-size="${size}"]`);
        if (input) {
            input.value = stock;
            
            const qtyVal = stockGrid.querySelector(`.stock-qty-val[data-id="${productId}"][data-size="${size}"]`);
            if (qtyVal) qtyVal.textContent = stock;

            const warningTag = input.closest(".stock-size-row").querySelector(".stock-warning-tag");
            if (warningTag) {
                warningTag.className = `stock-warning-tag ${stock <= 0 ? 'out' : (stock <= 3 ? 'low' : 'ok')}`;
                warningTag.textContent = stock <= 0 ? 'Out of Stock' : (stock <= 3 ? 'Low Stock' : 'In Stock');
            }
        }
    }

    const spinner = document.getElementById(`spinner-${productId}-${size}`);
    if (spinner) spinner.classList.add("active");

    if (stockSaveDebounceTimers[key]) {
        clearTimeout(stockSaveDebounceTimers[key]);
    }

    stockSaveDebounceTimers[key] = setTimeout(async () => {
        try {
            if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
                const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/inventory?product_id=eq.${productId}&size=eq.${size}`, {
                    method: "PATCH",
                    headers: {
                        apikey: SUPABASE_CONFIG.anonKey,
                        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal"
                    },
                    body: JSON.stringify({ stock })
                });
                if (!response.ok) {
                    throw new Error("HTTP " + response.status);
                }
            } else {
                saveLocalStorageInventory();
            }
        } catch (err) {
            console.error("Auto-save stock failed:", err);
        } finally {
            if (spinner) {
                spinner.classList.remove("active");
            }
        }
    }, 500);
}

async function handleProductSubmit(e) {
    e.preventDefault();

    const idInput = document.getElementById("product-id-input");
    const nameInput = document.getElementById("product-name-input");
    const categorySelect = document.getElementById("product-category-input");
    const priceInput = document.getElementById("product-price-input");
    const fileInput = document.getElementById("product-image-file");
    const badgeInput = document.getElementById("product-badge-input");
    const sizesInput = document.getElementById("product-sizes-input");
    const descInput = document.getElementById("product-desc-input");
    const specsInput = document.getElementById("product-specs-input");
    const stockInput = document.getElementById("product-stock-input");

    const submitBtn = e.target.querySelector("button[type='submit']");
    const originalText = submitBtn.textContent;
    submitBtn.textContent = "Creating...";
    submitBtn.disabled = true;

    const id = idInput.value.trim().toLowerCase();
    const name = nameInput.value.trim();
    const category = categorySelect.value;
    const price = parseFloat(priceInput.value);
    const badge = badgeInput.value.trim();
    const sizesStr = sizesInput.value.trim();
    const description = descInput.value.trim();
    const craft_specs = specsInput.value.trim();
    const initialStock = parseInt(stockInput.value) || 0;

    const sizeArray = sizesStr.split(",").map(s => s.trim().toUpperCase()).filter(s => s.length > 0);

    if (!id || !name || !category || isNaN(price) || price <= 0 || sizeArray.length === 0 || !description || !craft_specs || !fileInput.files || fileInput.files.length === 0) {
        alert("Please fill all fields and upload a product image.");
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
    }

    if (productsCatalog.some(p => p.id === id)) {
        alert("A product with this ID already exists. Please choose a unique ID.");
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
    }

    try {
        const file = fileInput.files[0];
        
        // 1. Compress and resize image on client side
        submitBtn.textContent = "Compressing Image...";
        const compressedDataUrl = await compressAndResizeImage(file, 400, 400);

        let imagePath = "";

        // 2. Save image (upload to Supabase Storage or keep base64 data url for localStorage)
        if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
            submitBtn.textContent = "Uploading Image...";
            const fileBlob = dataURLtoBlob(compressedDataUrl);
            
            const fileExt = file.name.split('.').pop() || 'png';
            const fileName = `${id}-${Date.now()}.${fileExt}`;
            const storagePath = `products/${fileName}`;
            
            const uploadResponse = await fetch(`${SUPABASE_CONFIG.url}/storage/v1/object/product-images/${storagePath}`, {
                method: "POST",
                headers: {
                    apikey: SUPABASE_CONFIG.anonKey,
                    Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
                    "Content-Type": fileBlob.type
                },
                body: fileBlob
            });
            
            if (!uploadResponse.ok) {
                const errData = await uploadResponse.json().catch(() => ({}));
                console.error("Storage upload error details:", errData);
                throw new Error("Failed to upload image to Supabase Storage: " + (errData.message || uploadResponse.statusText));
            }
            
            imagePath = `${SUPABASE_CONFIG.url}/storage/v1/object/public/product-images/${storagePath}`;
        } else {
            imagePath = compressedDataUrl; // Store base64 data URL locally
        }

        const newProductDb = {
            id,
            name,
            category,
            price,
            image: imagePath,
            badge: badge || null,
            description,
            craft_specs,
            sizes: sizeArray.join(",")
        };

        submitBtn.textContent = "Saving Product...";
        if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
            const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/products`, {
                method: "POST",
                headers: {
                    apikey: SUPABASE_CONFIG.anonKey,
                    Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify(newProductDb)
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `HTTP ${response.status} error`);
            }
        } else {
            const stored = getLocalStorageProducts();
            stored.push(newProductDb);
            localStorage.setItem("tantukarya_products", JSON.stringify(stored));
        }

        submitBtn.textContent = "Initializing Inventory...";
        const invRows = sizeArray.map(sz => ({
            product_id: id,
            size: sz,
            stock: initialStock
        }));

        if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
            const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/inventory`, {
                method: "POST",
                headers: {
                    apikey: SUPABASE_CONFIG.anonKey,
                    Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify(invRows)
            });
            if (!response.ok) {
                console.error("Failed to seed inventory for new product");
            }
        } else {
            const stored = getLocalStorageInventory();
            const updated = [...stored, ...invRows];
            localStorage.setItem("tantukarya_inventory", JSON.stringify(updated));
        }

        // Reset form inputs
        idInput.value = "";
        nameInput.value = "";
        badgeInput.value = "";
        descInput.value = "";
        specsInput.value = "";
        fileInput.value = "";
        
        const previewContainer = document.getElementById("product-image-preview-container");
        if (previewContainer) previewContainer.style.display = "none";
        
        await refreshCatalogAndInventory();
        renderProducts();
        await renderAdminProductsTab();
        await renderAdminStocksTab();
        
        alert("Product added successfully!");

    } catch (err) {
        console.error("Error creating product:", err);
        alert("Error creating product: " + err.message);
    } finally {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

async function deleteProduct(productId) {
    if (confirm(`Are you sure you want to delete product "${productId}"? This will delete the product catalog item and all associated stock levels.`)) {
        try {
            if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
                const res1 = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/products?id=eq.${productId}`, {
                    method: "DELETE",
                    headers: {
                        apikey: SUPABASE_CONFIG.anonKey,
                        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`
                    }
                });
                if (!res1.ok) throw new Error("Could not delete product row: HTTP " + res1.status);

                const res2 = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/inventory?product_id=eq.${productId}`, {
                    method: "DELETE",
                    headers: {
                        apikey: SUPABASE_CONFIG.anonKey,
                        Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`
                    }
                });
                if (!res2.ok) console.error("Could not delete inventory rows");
            } else {
                const products = getLocalStorageProducts().filter(p => p.id !== productId);
                localStorage.setItem("tantukarya_products", JSON.stringify(products));

                const inventory = getLocalStorageInventory().filter(i => i.product_id !== productId);
                localStorage.setItem("tantukarya_inventory", JSON.stringify(inventory));
            }

            await refreshCatalogAndInventory();
            renderProducts();
            await renderAdminProductsTab();
            await renderAdminStocksTab();

        } catch (err) {
            console.error("Error deleting product:", err);
            alert("Error deleting product: " + err.message);
        }
    }
}

function compressAndResizeImage(file, maxWidth = 400, maxHeight = 400) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL(file.type || "image/png", 0.7));
            };
        };
        reader.onerror = error => reject(error);
    });
}

function dataURLtoBlob(dataurl) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
}

// --- PDF BILLING, ORDERS & POS HELPER FUNCTIONS ---

function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

function downloadPDF(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function generateInvoicePDF(order) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Set font
    doc.setFont("helvetica", "normal");
    
    // Design colors
    const primaryColor = [30, 41, 59]; // #1E293B
    const accentColor = [127, 23, 31]; // #7F171F (Madder Red)
    const textColor = [55, 65, 81]; // #374151
    const lightGray = [156, 163, 175]; // #9CA3AF
    const borderGray = [229, 231, 235]; // #E5E7EB
    
    // Title Banner
    doc.setTextColor(...primaryColor);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.text("TANTUKARYA", 15, 25);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.text("Handcrafted Artisan Apparel", 15, 30);
    
    // Company contact details on the right
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.text("Tantukarya Handlooms", 195, 20, { align: "right" });
    doc.text("Kutch, Gujarat - Rajasthan, India", 195, 24, { align: "right" });
    doc.text("Email: hello@tantukarya.com", 195, 28, { align: "right" });
    doc.text("Web: www.tantukarya.com", 195, 32, { align: "right" });
    
    // Horizontal separator line
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.5);
    doc.line(15, 37, 195, 37);
    
    // Metadata block
    // Left: Billed To
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...lightGray);
    doc.text("BILLED TO:", 15, 45);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...primaryColor);
    doc.text(order.customer_name || "Walk-in Customer", 15, 50);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    let customerY = 55;
    if (order.customer_email) {
        doc.text(order.customer_email, 15, customerY);
        customerY += 4;
    }
    if (order.customer_phone) {
        doc.text(`Phone: ${order.customer_phone}`, 15, customerY);
        customerY += 4;
    }
    if (order.customer_address) {
        doc.text(order.customer_address, 15, customerY);
        customerY += 4;
    }
    if (order.customer_city || order.customer_zip) {
        const cityZip = [order.customer_city, order.customer_zip].filter(Boolean).join(" - ");
        doc.text(cityZip, 15, customerY);
    }
    
    // Right: Invoice details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...lightGray);
    doc.text("INVOICE DETAILS:", 130, 45);
    
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(...primaryColor);
    doc.text(`Order No: ${order.id}`, 130, 50);
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    
    const formattedDate = new Date(order.created_at || new Date()).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
    doc.text(`Date: ${formattedDate}`, 130, 54);
    doc.text(`Channel: ${order.type === 'online' ? 'Online Store' : 'POS (Offline)'}`, 130, 58);
    
    const methodMap = {
        card: "Credit/Debit Card",
        upi: "UPI / VPA",
        cod: "Cash on Delivery",
        cash: "Cash"
    };
    doc.text(`Payment: ${methodMap[order.payment_method] || order.payment_method}`, 130, 62);
    
    // Line separator
    doc.line(15, 70, 195, 70);
    
    // Table Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...primaryColor);
    doc.text("Item Description", 15, 76);
    doc.text("Size", 110, 76);
    doc.text("Qty", 130, 76);
    doc.text("Price", 150, 76);
    doc.text("Amount", 175, 76);
    
    doc.line(15, 80, 195, 80);
    
    // Table body
    doc.setFont("helvetica", "normal");
    let Y = 86;
    
    const itemsList = Array.isArray(order.items) ? order.items : (order.items.cart || []);
    
    itemsList.forEach(item => {
        doc.setFont("helvetica", "bold");
        doc.setTextColor(...primaryColor);
        doc.text(item.product.name, 15, Y);
        
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...textColor);
        doc.text(item.size, 110, Y);
        doc.text(String(item.quantity), 130, Y);
        doc.text(`INR ${Number(item.product.price).toLocaleString("en-IN")}`, 150, Y);
        
        const lineTotal = Number(item.product.price) * Number(item.quantity);
        doc.text(`INR ${lineTotal.toLocaleString("en-IN")}`, 175, Y);
        
        Y += 8;
    });
    
    // Separator line before totals
    doc.setDrawColor(...borderGray);
    doc.line(15, Y - 2, 195, Y - 2);
    Y += 4;
    
    // Totals calculations
    const totalsXLabel = 135;
    const totalsXVal = 175;
    
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...textColor);
    doc.text("Subtotal:", totalsXLabel, Y);
    doc.text(`INR ${Number(order.subtotal).toLocaleString("en-IN")}`, totalsXVal, Y);
    Y += 6;
    
    if (order.discount && Number(order.discount) > 0) {
        doc.setTextColor(22, 101, 52); // green text
        doc.text("Discount (Promo):", totalsXLabel, Y);
        doc.text(`-INR ${Number(order.discount).toLocaleString("en-IN")}`, totalsXVal, Y);
        Y += 6;
    }
    
    doc.setTextColor(...textColor);
    const shippingVal = Number(order.shipping ?? 0);
    doc.text("Shipping Fee:", totalsXLabel, Y);
    doc.text(shippingVal === 0 ? "FREE" : `INR ${shippingVal.toLocaleString("en-IN")}`, totalsXVal, Y);
    Y += 6;
    
    const taxesVal = Number(order.taxes ?? 0);
    doc.text("GST & Taxes (12%):", totalsXLabel, Y);
    doc.text(`INR ${taxesVal.toLocaleString("en-IN")}`, totalsXVal, Y);
    Y += 8;
    
    // Draw thick total line
    doc.setDrawColor(...primaryColor);
    doc.setLineWidth(0.5);
    doc.line(totalsXLabel - 5, Y - 4, 195, Y - 4);
    
    // Grand Total
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(...accentColor);
    doc.text("Amount Paid:", totalsXLabel, Y);
    doc.text(`INR ${Number(order.total_amount).toLocaleString("en-IN")}`, totalsXVal, Y);
    
    // Footer
    Y = Math.max(Y + 20, 240);
    
    doc.setDrawColor(...borderGray);
    doc.setLineWidth(0.5);
    doc.line(15, Y, 195, Y);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(9);
    doc.setTextColor(...textColor);
    doc.text("Thank you for supporting handloom weavers and sustainable slow fashion!", 105, Y + 6, { align: "center" });
    
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(...lightGray);
    doc.text("This is a computer-generated invoice. No physical signature required.", 105, Y + 10, { align: "center" });
    
    return doc.output("blob");
}

function reconstructOrderFinancials(order) {
    const itemsList = Array.isArray(order.items) ? order.items : (order.items.cart || []);
    const subtotal = itemsList.reduce((sum, item) => sum + (Number(item.product.price) * Number(item.quantity)), 0);
    let discount = 0;
    let shipping = 0;
    let taxes = 0;
    let total = Number(order.total_amount);
    
    if (order.type === 'offline') {
        taxes = Math.round(subtotal * 0.12);
        discount = 0;
        shipping = 0;
    } else {
        const noPromoShipping = (subtotal >= 3000) ? 0 : 150;
        const codFee = (order.payment_method === 'cod') ? 50 : 0;
        const expectedNoPromoTotal = subtotal + noPromoShipping + codFee + Math.round(subtotal * 0.12);
        
        if (Math.abs(expectedNoPromoTotal - total) > 5) {
            discount = Math.round(subtotal * 0.10);
            shipping = (subtotal - discount >= 3000) ? 0 : 150;
            if (order.payment_method === 'cod') shipping += 50;
            taxes = Math.round((subtotal - discount) * 0.12);
        } else {
            discount = 0;
            shipping = noPromoShipping + codFee;
            taxes = Math.round(subtotal * 0.12);
        }
    }
    
    return {
        subtotal,
        discount,
        shipping,
        taxes,
        total
    };
}

async function createOrder(orderData) {
    // We do not save PDF URL or upload PDF to storage.
    orderData.pdf_url = null;
    
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        try {
            const dbOrder = {
                id: orderData.id,
                created_at: orderData.created_at,
                customer_name: orderData.customer_name,
                customer_email: orderData.customer_email || null,
                customer_phone: orderData.customer_phone || null,
                customer_address: orderData.customer_address || null,
                customer_city: orderData.customer_city || null,
                customer_zip: orderData.customer_zip || null,
                items: orderData.items,
                total_amount: Number(orderData.total_amount),
                payment_method: orderData.payment_method,
                type: orderData.type,
                pdf_url: null
            };
            
            const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/orders`, {
                method: "POST",
                headers: {
                    apikey: SUPABASE_CONFIG.anonKey,
                    Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
                    "Content-Type": "application/json",
                    "Prefer": "return=minimal"
                },
                body: JSON.stringify(dbOrder)
            });
            
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Supabase create order error:", errorData.message || response.statusText);
                saveOrderLocally(orderData);
            }
        } catch (error) {
            console.error("Network error creating order in Supabase, saving locally:", error);
            saveOrderLocally(orderData);
        }
    } else {
        saveOrderLocally(orderData);
    }
}

function saveOrderLocally(order) {
    const orders = getLocalStorageOrders();
    orders.push(order);
    localStorage.setItem("tantukarya_orders", JSON.stringify(orders));
}

function getLocalStorageOrders() {
    try {
        const stored = localStorage.getItem("tantukarya_orders");
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

async function loadAllOrders() {
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        try {
            const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/orders?select=*&order=created_at.desc`, {
                headers: {
                    apikey: SUPABASE_CONFIG.anonKey,
                    Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`
                }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || response.statusText);
            }
            return await response.json();
        } catch (error) {
            console.error("Supabase load orders error, falling back to LocalStorage:", error);
            return getLocalStorageOrders().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        }
    } else {
        return getLocalStorageOrders().sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
}

async function renderOrdersList() {
    const tableBody = document.getElementById("orders-table-body");
    const emptyState = document.getElementById("orders-empty-state");
    if (!tableBody) return;
    
    tableBody.innerHTML = `
        <tr>
            <td colspan="7" style="text-align: center; padding: 2rem; color: #8A8078;">
                <div style="display: inline-block; width: 18px; height: 18px; border: 2px solid var(--color-border); border-top-color: var(--color-primary-madder); border-radius: 50%; animation: cssSpin 0.8s linear infinite; margin-right: 0.5rem; vertical-align: middle;"></div>
                Loading orders...
            </td>
        </tr>
    `;
    emptyState.classList.remove("active");
    
    try {
        const orders = await loadAllOrders();
        ordersHistory = orders;
        
        tableBody.innerHTML = "";
        if (orders.length === 0) {
            emptyState.classList.add("active");
            return;
        }
        
        orders.forEach(order => {
            const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
            
            // Format items list
            const itemsList = Array.isArray(order.items) ? order.items : (order.items.cart || []);
            const itemsSummary = itemsList.map(item => {
                const pName = item.product ? item.product.name : (item.product_name || "Unknown Product");
                const pId = item.product ? (item.product.id || item.product_id) : (item.product_id || "N/A");
                return `${pName} (ID: ${pId}) (${item.size}) × ${item.quantity}`;
            }).join(', ');
            
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td><strong>${order.id}</strong></td>
                <td>
                    <div style="font-weight: 600;">${order.customer_name}</div>
                    <div style="font-size: 0.75rem; color: #8A8078;">
                        ${order.customer_email || 'No email'}<br>
                        ${order.customer_phone ? `Phone: ${order.customer_phone}` : ''}
                    </div>
                </td>
                <td>
                    <div style="font-size: 0.78rem; max-width: 320px; white-space: normal; line-height: 1.35; color: var(--color-neutral-charcoal); font-weight: 500;">
                        ${itemsSummary}
                    </div>
                </td>
                <td>${formattedDate}</td>
                <td>
                    <span class="order-type-tag ${order.type}">
                        ${order.type}
                    </span>
                </td>
                <td><strong>₹${Number(order.total_amount).toLocaleString("en-IN")}</strong></td>
                <td>
                    <button class="invoice-btn download-order-invoice-btn" data-id="${order.id}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px; vertical-align: middle;">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        PDF
                    </button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
        
        tableBody.querySelectorAll(".download-order-invoice-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const orderId = btn.getAttribute("data-id");
                const order = ordersHistory.find(o => o.id === orderId);
                if (order) {
                    downloadOrderInvoicePDF(order);
                }
            });
        });
        
    } catch (err) {
        console.error("Failed to render orders list:", err);
        tableBody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align: center; padding: 2rem; color: var(--color-primary-madder);">
                    Failed to load orders. Please see console logs for details.
                </td>
            </tr>
        `;
    }
}

function downloadOrderInvoicePDF(order) {
    const financials = reconstructOrderFinancials(order);
    const fullOrder = {
        ...order,
        ...financials
    };
    const pdfBlob = generateInvoicePDF(fullOrder);
    downloadPDF(pdfBlob, `${order.id}.pdf`);
}

function renderPOSProductDropdown() {
    const productSelect = document.getElementById("pos-product-select");
    if (!productSelect) return;
    
    productSelect.innerHTML = "";
    productsCatalog.forEach(p => {
        const opt = document.createElement("option");
        opt.value = p.id;
        opt.textContent = `${p.name} (INR ${p.price})`;
        productSelect.appendChild(opt);
    });
    
    updatePOSSizeDropdown();
}

function updatePOSSizeDropdown() {
    const productSelect = document.getElementById("pos-product-select");
    const sizeSelect = document.getElementById("pos-size-select");
    if (!productSelect || !sizeSelect) return;
    
    const productId = productSelect.value;
    const product = productsCatalog.find(p => p.id === productId);
    
    sizeSelect.innerHTML = "";
    if (product && product.sizes) {
        product.sizes.forEach(sz => {
            const key = `${product.id}_${sz}`;
            const stock = inventoryStore[key] || 0;
            const opt = document.createElement("option");
            opt.value = sz;
            opt.textContent = `${sz} (${stock} in stock)`;
            if (stock <= 0) {
                opt.disabled = true;
                opt.textContent += " - Sold Out";
            }
            sizeSelect.appendChild(opt);
        });
    }
}

function addPOSCartItem() {
    const productSelect = document.getElementById("pos-product-select");
    const sizeSelect = document.getElementById("pos-size-select");
    const qtyInput = document.getElementById("pos-qty-input");
    if (!productSelect || !sizeSelect || !qtyInput) return;
    
    const productId = productSelect.value;
    const size = sizeSelect.value;
    const quantity = parseInt(qtyInput.value, 10);
    
    if (!productId || !size || isNaN(quantity) || quantity <= 0) {
        showNotification("Please select a valid product, size, and quantity.", "error");
        return;
    }
    
    const product = productsCatalog.find(p => p.id === productId);
    if (!product) return;
    
    const key = `${productId}_${size}`;
    const stockAvailable = inventoryStore[key] || 0;
    
    const existingCartItem = posCart.find(item => item.product.id === productId && item.size === size);
    const totalRequestedQty = quantity + (existingCartItem ? existingCartItem.quantity : 0);
    
    if (totalRequestedQty > stockAvailable) {
        showNotification(`Cannot add ${quantity} item(s). Only ${stockAvailable} in stock.`, "error");
        return;
    }
    
    if (existingCartItem) {
        existingCartItem.quantity = totalRequestedQty;
    } else {
        posCart.push({
            product: product,
            size: size,
            quantity: quantity
        });
    }
    
    qtyInput.value = 1;
    renderPOSCart();
}

function renderPOSCart() {
    const container = document.getElementById("pos-cart-container");
    const totalEl = document.getElementById("pos-cart-total");
    if (!container || !totalEl) return;
    
    if (posCart.length === 0) {
        container.innerHTML = `<div style="text-align: center; color: #8A8078; font-size: 0.8rem; padding: 0.5rem 0;">No items added yet.</div>`;
        totalEl.textContent = "₹0.00";
        return;
    }
    
    container.innerHTML = "";
    let totalAmount = 0;
    
    posCart.forEach((item, index) => {
        const itemTotal = item.product.price * item.quantity;
        totalAmount += itemTotal;
        
        const div = document.createElement("div");
        div.className = "pos-cart-item";
        div.style.display = "flex";
        div.style.justifyContent = "space-between";
        div.style.alignItems = "center";
        div.style.padding = "0.25rem 0";
        div.style.borderBottom = "1px solid var(--color-border)";
        div.style.fontSize = "0.8rem";
        
        div.innerHTML = `
            <div style="flex-grow: 1;">
                <strong>${item.product.name}</strong> (${item.size})
                <div style="color: #6E6962;">${item.quantity} × ₹${item.product.price.toLocaleString("en-IN")}</div>
            </div>
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <span style="font-weight: 600;">₹${itemTotal.toLocaleString("en-IN")}</span>
                <button type="button" class="pos-item-remove-btn" data-index="${index}" style="background: none; border: none; color: var(--color-primary-madder); cursor: pointer; padding: 2px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                </button>
            </div>
        `;
        
        container.appendChild(div);
    });
    
    totalEl.textContent = `₹${totalAmount.toLocaleString("en-IN")}`;
    
    const removeButtons = container.querySelectorAll(".pos-item-remove-btn");
    removeButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            const index = parseInt(btn.getAttribute("data-index"), 10);
            posCart.splice(index, 1);
            renderPOSCart();
        });
    });
}

function showNotification(message, type = "success") {
    const toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
        alert(message);
        return;
    }
    
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.style.display = "flex";
    toast.style.alignItems = "center";
    toast.style.padding = "0.75rem 1rem";
    toast.style.gap = "0.75rem";
    
    const isError = type === "error";
    const bg = isError ? "#FEE2E2" : "#ECFDF5";
    const border = isError ? "#EF4444" : "#10B981";
    const color = isError ? "#991B1B" : "#065F46";
    
    toast.style.backgroundColor = bg;
    toast.style.borderColor = border;
    toast.style.borderWidth = "1px";
    toast.style.borderStyle = "solid";
    toast.style.color = color;
    toast.style.borderRadius = "6px";
    toast.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
    
    toast.innerHTML = `
        <span style="font-weight: 500; font-size: 0.85rem; flex-grow: 1;">${message}</span>
        <button class="toast-close-btn" style="color: ${color}; background: none; border: none; cursor: pointer; font-size: 1rem; line-height: 1;">✕</button>
    `;
    
    toastContainer.appendChild(toast);
    
    setTimeout(() => {
        toast.classList.add("active");
    }, 10);
    
    const autoDismiss = setTimeout(() => {
        dismissToast(toast);
    }, 4000);
    
    toast.querySelector(".toast-close-btn").addEventListener("click", () => {
        clearTimeout(autoDismiss);
        dismissToast(toast);
    });
}

// --- CUSTOMER SESSIONS & DB APIS ---

function loadCustomerSession() {
    try {
        const stored = localStorage.getItem("tantukarya_logged_in_customer");
        if (stored) {
            currentCustomer = JSON.parse(stored);
            updateHeaderAccountButton();
        }
    } catch (e) {
        console.error("Error loading customer session:", e);
    }
}

function updateHeaderAccountButton() {
    const textEl = document.getElementById("account-btn-text");
    if (!textEl) return;
    if (currentCustomer) {
        textEl.textContent = `Hello, ${currentCustomer.name.split(' ')[0]}`;
    } else {
        textEl.textContent = "Login";
    }
}

function getLocalStorageCustomers() {
    try {
        const stored = localStorage.getItem("tantukarya_customers");
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

async function checkCustomerExists(email, phone) {
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        try {
            const url = `${SUPABASE_CONFIG.url}/rest/v1/customers?or=(email.eq.${encodeURIComponent(email)},phone.eq.${encodeURIComponent(phone)})`;
            const response = await fetch(url, {
                headers: {
                    apikey: SUPABASE_CONFIG.anonKey,
                    Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                return data.length > 0;
            }
        } catch (e) {
            console.error("Supabase checkCustomerExists error, falling back to local:", e);
        }
    }
    const localCusts = getLocalStorageCustomers();
    return localCusts.some(c => c.email.toLowerCase() === email.toLowerCase() || c.phone === phone);
}

async function createCustomer(name, email, phone, password) {
    const newCust = { name, email, phone, password };
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        const response = await fetch(`${SUPABASE_CONFIG.url}/rest/v1/customers`, {
            method: "POST",
            headers: {
                apikey: SUPABASE_CONFIG.anonKey,
                Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`,
                "Content-Type": "application/json",
                "Prefer": "return=representation"
            },
            body: JSON.stringify(newCust)
        });
        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || "Failed to register in Supabase");
        }
        const created = await response.json();
        return created[0];
    } else {
        const localCusts = getLocalStorageCustomers();
        newCust.id = 'cust_' + Date.now();
        localCusts.push(newCust);
        localStorage.setItem("tantukarya_customers", JSON.stringify(localCusts));
        return newCust;
    }
}

async function authenticateCustomer(email, password) {
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        try {
            const url = `${SUPABASE_CONFIG.url}/rest/v1/customers?email=eq.${encodeURIComponent(email)}&password=eq.${encodeURIComponent(password)}`;
            const response = await fetch(url, {
                headers: {
                    apikey: SUPABASE_CONFIG.anonKey,
                    Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                return data.length > 0 ? data[0] : null;
            }
        } catch (e) {
            console.error("Supabase authenticateCustomer error, falling back to local:", e);
        }
    }
    const localCusts = getLocalStorageCustomers();
    const found = localCusts.find(c => c.email.toLowerCase() === email.toLowerCase() && c.password === password);
    return found || null;
}

async function loadCustomerOrders(email) {
    if (SUPABASE_CONFIG.url && SUPABASE_CONFIG.anonKey) {
        try {
            const url = `${SUPABASE_CONFIG.url}/rest/v1/orders?customer_email=eq.${encodeURIComponent(email)}&order=created_at.desc`;
            const response = await fetch(url, {
                headers: {
                     apikey: SUPABASE_CONFIG.anonKey,
                     Authorization: `Bearer ${SUPABASE_CONFIG.anonKey}`
                }
            });
            if (response.ok) {
                return await response.json();
            }
        } catch (e) {
            console.error("Supabase customer orders error:", e);
        }
    }
    // Fallback to local
    const all = await loadAllOrders();
    return all.filter(o => o.customer_email && o.customer_email.toLowerCase() === email.toLowerCase());
}

async function renderCustomerOrdersProfile() {
    const container = document.getElementById("customer-profile-orders-container");
    if (!container || !currentCustomer) return;

    container.innerHTML = `
        <div style="text-align: center; color: #8A8078; padding: 2rem; font-size: 0.85rem;">
            <div style="display: inline-block; width: 14px; height: 14px; border: 2px solid var(--color-border); border-top-color: var(--color-primary-indigo); border-radius: 50%; animation: cssSpin 0.8s linear infinite; margin-right: 0.5rem; vertical-align: middle;"></div>
            Loading your orders...
        </div>
    `;

    try {
        const orders = await loadCustomerOrders(currentCustomer.email);
        
        if (orders.length === 0) {
            container.innerHTML = `<div style="text-align: center; color: #8A8078; padding: 2rem; font-size: 0.85rem;">No orders found.</div>`;
            return;
        }

        container.innerHTML = "";
        orders.forEach(order => {
            const row = document.createElement("div");
            row.className = "cust-order-row";

            const formattedDate = new Date(order.created_at).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });

            const itemsList = Array.isArray(order.items) ? order.items : (order.items.cart || []);
            const itemsText = itemsList.map(item => {
                const pName = item.product ? item.product.name : (item.product_name || "Product");
                return `${pName} (${item.size}) × ${item.quantity}`;
            }).join(", ");

            row.innerHTML = `
                <div class="cust-order-info">
                    <div style="font-weight: 600; font-size: 0.82rem; color: var(--color-text-dark);">${order.id}</div>
                    <div class="cust-order-date">${formattedDate}</div>
                    <div class="cust-order-items" title="${itemsText}">${itemsText}</div>
                </div>
                <div class="cust-order-actions">
                    <span class="cust-order-total">₹${Number(order.total_amount).toLocaleString("en-IN")}</span>
                    <button type="button" class="invoice-btn cust-invoice-download-btn" data-id="${order.id}" title="Download Receipt">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    </button>
                </div>
            `;
            container.appendChild(row);
        });

        // Wire download button click
        const downloadBtns = container.querySelectorAll(".cust-invoice-download-btn");
        downloadBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const oid = btn.getAttribute("data-id");
                const matchedOrder = orders.find(o => o.id === oid);
                if (matchedOrder) {
                    const pdfBlob = generateInvoicePDF(matchedOrder);
                    downloadPDF(pdfBlob, `${oid}.pdf`);
                }
            });
        });

    } catch (err) {
        console.error("Error loading customer orders profile:", err);
        container.innerHTML = `<div style="text-align: center; color: var(--color-primary-madder); padding: 2rem; font-size: 0.85rem; font-weight: 600;">Error loading orders.</div>`;
    }
}

