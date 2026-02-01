// ===== App State =====
const state = {
    currentLocation: null,
    currentShop: null,
    shops: [],
    orders: []
};

// ===== DOM Elements =====
const elements = {
    // Screens
    welcomeScreen: document.getElementById('welcome-screen'),
    shopScreen: document.getElementById('shop-screen'),
    dashboardScreen: document.getElementById('dashboard-screen'),

    // Welcome screen
    getLocationBtn: document.getElementById('get-location-btn'),
    locationStatus: document.getElementById('location-status'),
    statusText: document.getElementById('status-text'),
    coordinates: document.getElementById('coordinates'),
    latValue: document.getElementById('lat-value'),
    lngValue: document.getElementById('lng-value'),
    previousShopsSection: document.getElementById('previous-shops-section'),
    previousShopsList: document.getElementById('previous-shops-list'),

    // Shop screen
    backToWelcome: document.getElementById('back-to-welcome'),
    shopLocationDisplay: document.getElementById('shop-location-display'),
    shopNameInput: document.getElementById('shop-name'),
    saveShopBtn: document.getElementById('save-shop-btn'),

    // Dashboard
    currentShopName: document.getElementById('current-shop-name'),
    currentShopLocation: document.getElementById('current-shop-location'),
    changeShopBtn: document.getElementById('change-shop-btn'),
    totalOrders: document.getElementById('total-orders'),
    totalValue: document.getElementById('total-value'),
    ordersList: document.getElementById('orders-list'),
    newOrderBtn: document.getElementById('new-order-btn'),

    // Modal
    orderModal: document.getElementById('order-modal'),
    closeModalBtn: document.getElementById('close-modal-btn'),
    orderItems: document.getElementById('order-items'),
    addItemBtn: document.getElementById('add-item-btn'),
    orderTotalValue: document.getElementById('order-total-value'),
    saveOrderBtn: document.getElementById('save-order-btn')
};

// ===== Utility Functions =====
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const options = {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    };
    return date.toLocaleDateString('en-IN', options);
}

function formatCurrency(amount) {
    return '₹' + amount.toLocaleString('en-IN');
}

// Calculate distance between two coordinates in meters (Haversine formula)
function getDistanceInMeters(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Earth's radius in meters
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

// Find shops near a given location (within radius in meters)
function findNearbyShops(lat, lng, radiusMeters = 500) {
    return state.shops.filter(shop => {
        const distance = getDistanceInMeters(lat, lng, shop.lat, shop.lng);
        shop.distance = distance; // Store distance for display
        return distance <= radiusMeters;
    }).sort((a, b) => a.distance - b.distance);
}

// ===== LocalStorage Functions =====
function saveToStorage(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        console.log(`✅ Saved ${key}:`, data);
    } catch (e) {
        console.error(`❌ Failed to save ${key}:`, e);
    }
}

function loadFromStorage(key) {
    try {
        const data = localStorage.getItem(key);
        const parsed = data ? JSON.parse(data) : null;
        console.log(`📂 Loaded ${key}:`, parsed);
        return parsed;
    } catch (e) {
        console.error(`❌ Failed to load ${key}:`, e);
        return null;
    }
}

function loadAppData() {
    state.shops = loadFromStorage('shops') || [];
    state.orders = loadFromStorage('orders') || [];
    console.log('📊 App state loaded:', state);
}

function saveShops() {
    saveToStorage('shops', state.shops);
}

function saveOrders() {
    saveToStorage('orders', state.orders);
}

// ===== Screen Navigation =====
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// ===== Location Functions =====
function updateLocationStatus(status, message) {
    const statusIcon = elements.locationStatus.querySelector('.status-icon');
    statusIcon.className = 'status-icon ' + status;

    // Update icon based on status
    let iconPath = '';
    switch (status) {
        case 'loading':
            iconPath = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z"/></svg>';
            break;
        case 'success':
            iconPath = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
            break;
        case 'error':
            iconPath = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>';
            break;
        default:
            iconPath = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>';
    }
    statusIcon.innerHTML = iconPath;
    elements.statusText.textContent = message;
}

function getLocation() {
    if (!navigator.geolocation) {
        updateLocationStatus('error', 'Geolocation is not supported by your browser');
        return;
    }

    updateLocationStatus('loading', 'Getting your location...');
    elements.getLocationBtn.disabled = true;
    elements.getLocationBtn.classList.remove('pulse');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            state.currentLocation = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            updateLocationStatus('success', 'Location captured successfully!');
            elements.coordinates.classList.remove('hidden');
            elements.latValue.textContent = state.currentLocation.lat.toFixed(6);
            elements.lngValue.textContent = state.currentLocation.lng.toFixed(6);

            // Update shop screen location display
            elements.shopLocationDisplay.textContent =
                `${state.currentLocation.lat.toFixed(4)}, ${state.currentLocation.lng.toFixed(4)}`;

            // Find nearby shops at this location
            const nearbyShops = findNearbyShops(
                state.currentLocation.lat,
                state.currentLocation.lng,
                500 // 500 meters radius
            );

            console.log('📍 Found nearby shops:', nearbyShops.length);

            if (nearbyShops.length > 0) {
                // Show nearby shops instead of going to register new shop
                updateLocationStatus('success', `Found ${nearbyShops.length} shop(s) nearby!`);
                renderNearbyShops(nearbyShops);
                // Don't auto-navigate, let user choose
            } else {
                // No nearby shops, go to register new shop
                updateLocationStatus('success', 'No shops here yet. Register a new shop!');
                setTimeout(() => {
                    showScreen('shop-screen');
                }, 1000);
            }
        },
        (error) => {
            let errorMessage = 'Unable to retrieve your location';
            switch (error.code) {
                case error.PERMISSION_DENIED:
                    errorMessage = 'Location permission denied';
                    break;
                case error.POSITION_UNAVAILABLE:
                    errorMessage = 'Location information unavailable';
                    break;
                case error.TIMEOUT:
                    errorMessage = 'Location request timed out';
                    break;
            }
            updateLocationStatus('error', errorMessage);
            elements.getLocationBtn.disabled = false;
            elements.getLocationBtn.classList.add('pulse');
        },
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
}

// ===== Shop Functions =====
function registerShop() {
    const shopName = elements.shopNameInput.value.trim();

    console.log('🏪 Registering shop:', shopName, 'Location:', state.currentLocation);

    if (!shopName || !state.currentLocation) {
        console.log('⚠️ Cannot register: missing name or location');
        return;
    }

    const shop = {
        id: generateId(),
        name: shopName,
        lat: state.currentLocation.lat,
        lng: state.currentLocation.lng,
        createdAt: new Date().toISOString()
    };

    state.shops.push(shop);
    state.currentShop = shop;
    saveShops();

    console.log('✅ Shop registered:', shop);

    // Clear input
    elements.shopNameInput.value = '';
    elements.saveShopBtn.disabled = true;

    // Update dashboard and show it
    updateDashboard();
    showScreen('dashboard-screen');
}

function changeShop() {
    // Reset state for new shop
    state.currentLocation = null;
    state.currentShop = null;

    // Reset welcome screen
    updateLocationStatus('pending', 'Tap below to get your location');
    elements.coordinates.classList.add('hidden');
    elements.getLocationBtn.disabled = false;
    elements.getLocationBtn.classList.add('pulse');

    // Refresh previous shops list
    renderPreviousShops();

    showScreen('welcome-screen');
}

// ===== Dashboard Functions =====
function updateDashboard() {
    if (!state.currentShop) return;

    // Update shop info
    elements.currentShopName.textContent = state.currentShop.name;
    elements.currentShopLocation.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
        </svg>
        ${state.currentShop.lat.toFixed(4)}, ${state.currentShop.lng.toFixed(4)}
    `;

    // Get orders for current shop
    const shopOrders = state.orders.filter(order => order.shopId === state.currentShop.id);

    // Update stats
    const totalOrderCount = shopOrders.length;
    const totalOrderValue = shopOrders.reduce((sum, order) => sum + order.totalValue, 0);

    elements.totalOrders.textContent = totalOrderCount;
    elements.totalValue.textContent = formatCurrency(totalOrderValue);

    // Render orders and daily summary
    renderOrders(shopOrders);
    updateDailySummary(shopOrders);
}

// ===== Daily Summary Functions =====
function updateDailySummary(shopOrders) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter orders for today (only pending and delivered, not cancelled)
    const todayOrders = shopOrders.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime() && order.status !== 'cancelled';
    });

    // Calculate totals
    const dailyTotal = todayOrders.reduce((sum, order) => sum + order.totalValue, 0);
    const dailyOrderCount = todayOrders.length;

    // Aggregate all items
    const itemsMap = {};
    todayOrders.forEach(order => {
        order.items.forEach(item => {
            const key = item.name.toLowerCase();
            if (itemsMap[key]) {
                itemsMap[key].quantity += item.quantity;
                itemsMap[key].totalValue += item.price * item.quantity;
            } else {
                itemsMap[key] = {
                    name: item.name,
                    quantity: item.quantity,
                    price: item.price,
                    totalValue: item.price * item.quantity
                };
            }
        });
    });

    // Convert to array and sort by total value
    const itemsList = Object.values(itemsMap).sort((a, b) => b.totalValue - a.totalValue);
    const totalItemsCount = itemsList.reduce((sum, item) => sum + item.quantity, 0);

    // Update DOM
    document.getElementById('daily-total-value').textContent = formatCurrency(dailyTotal);
    document.getElementById('daily-order-count').textContent = dailyOrderCount;
    document.getElementById('daily-items-count').textContent = totalItemsCount;

    // Render items list
    const itemsListEl = document.getElementById('daily-items-list');
    if (itemsList.length === 0) {
        itemsListEl.innerHTML = '<p class="empty-daily">No orders today</p>';
    } else {
        itemsListEl.innerHTML = itemsList.map(item => `
            <div class="daily-item-row">
                <div class="daily-item-info">
                    <span class="daily-item-name">${item.name}</span>
                    <span class="daily-item-qty">×${item.quantity}</span>
                </div>
                <span class="daily-item-value">${formatCurrency(item.totalValue)}</span>
            </div>
        `).join('');
    }
}

function toggleDailySummary() {
    const summary = document.getElementById('daily-summary');
    summary.classList.toggle('expanded');
}

function renderOrders(orders) {
    if (orders.length === 0) {
        elements.ordersList.innerHTML = `
            <div class="empty-state">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <p>No orders yet</p>
                <span>Tap "New Order" to add your first order</span>
            </div>
        `;
        return;
    }

    // Sort orders by date (newest first)
    const sortedOrders = [...orders].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    elements.ordersList.innerHTML = sortedOrders.map(order => {
        const status = order.status || 'pending';
        const statusClass = status === 'delivered' ? 'status-delivered' :
            status === 'cancelled' ? 'status-cancelled' : 'status-pending';
        const statusText = status === 'delivered' ? 'Delivered' :
            status === 'cancelled' ? 'Cancelled' : 'Pending';

        return `
            <div class="order-card ${statusClass}" data-id="${order.id}">
                <div class="order-header">
                    <div class="order-header-left">
                        <span class="order-date">${formatDate(order.createdAt)}</span>
                        <span class="order-status-badge ${statusClass}">${statusText}</span>
                    </div>
                    <span class="order-value">${formatCurrency(order.totalValue)}</span>
                </div>
                <div class="order-items-list">
                    ${order.items.map(item => `
                        <div class="order-item-row">
                            <span class="order-item-name">
                                ${item.name}
                                <span class="order-item-qty">×${item.quantity}</span>
                            </span>
                            <span>${formatCurrency(item.price * item.quantity)}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="order-actions">
                    ${status === 'pending' ? `
                        <button class="btn-action btn-deliver" onclick="markOrderDelivered('${order.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                            Delivered
                        </button>
                        <button class="btn-action btn-cancel" onclick="markOrderCancelled('${order.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                            </svg>
                            Cancel
                        </button>
                    ` : `
                        <button class="btn-action btn-delete" onclick="deleteOrder('${order.id}')">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                            </svg>
                            Remove
                        </button>
                    `}
                </div>
            </div>
        `;
    }).join('');
}

// ===== Order Modal Functions =====
function openOrderModal() {
    elements.orderModal.classList.add('active');
    elements.orderItems.innerHTML = '';
    addOrderItem(); // Add first item by default
    updateOrderTotal();
}

function closeOrderModal() {
    elements.orderModal.classList.remove('active');
}

function addOrderItem() {
    const itemId = generateId();
    const itemHtml = `
        <div class="order-item-form" data-item-id="${itemId}">
            <div class="input-group">
                <label>Item Name</label>
                <input type="text" class="item-name" placeholder="Enter item..." autocomplete="off">
            </div>
            <div class="input-group">
                <label>Qty</label>
                <input type="number" class="item-qty" value="1" min="1">
            </div>
            <div class="input-group">
                <label>Price (₹)</label>
                <input type="number" class="item-price" value="0" min="0">
            </div>
            <button type="button" class="btn-remove-item" onclick="removeOrderItem('${itemId}')">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                </svg>
            </button>
        </div>
    `;

    elements.orderItems.insertAdjacentHTML('beforeend', itemHtml);

    // Add event listeners for the new inputs
    const newItem = elements.orderItems.querySelector(`[data-item-id="${itemId}"]`);
    newItem.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            updateOrderTotal();
            validateOrder();
        });
    });

    // Focus on the new item name input
    newItem.querySelector('.item-name').focus();

    validateOrder();
}

function removeOrderItem(itemId) {
    const item = elements.orderItems.querySelector(`[data-item-id="${itemId}"]`);
    if (item) {
        item.remove();
        updateOrderTotal();
        validateOrder();
    }
}

function updateOrderTotal() {
    const items = elements.orderItems.querySelectorAll('.order-item-form');
    let total = 0;

    items.forEach(item => {
        const qty = parseFloat(item.querySelector('.item-qty').value) || 0;
        const price = parseFloat(item.querySelector('.item-price').value) || 0;
        total += qty * price;
    });

    elements.orderTotalValue.textContent = formatCurrency(total);
}

function validateOrder() {
    const items = elements.orderItems.querySelectorAll('.order-item-form');
    let isValid = items.length > 0;

    items.forEach(item => {
        const name = item.querySelector('.item-name').value.trim();
        const qty = parseFloat(item.querySelector('.item-qty').value) || 0;
        const price = parseFloat(item.querySelector('.item-price').value) || 0;

        if (!name || qty <= 0 || price <= 0) {
            isValid = false;
        }
    });

    elements.saveOrderBtn.disabled = !isValid;
}

function saveOrder() {
    console.log('📝 Saving order, current shop:', state.currentShop);

    if (!state.currentShop) {
        console.log('⚠️ Cannot save: no current shop');
        return;
    }

    const itemElements = elements.orderItems.querySelectorAll('.order-item-form');
    const items = [];
    let totalValue = 0;

    itemElements.forEach(item => {
        const name = item.querySelector('.item-name').value.trim();
        const quantity = parseFloat(item.querySelector('.item-qty').value) || 0;
        const price = parseFloat(item.querySelector('.item-price').value) || 0;

        console.log('📦 Item:', { name, quantity, price });

        if (name && quantity > 0 && price > 0) {
            items.push({ name, quantity, price });
            totalValue += quantity * price;
        }
    });

    if (items.length === 0) {
        console.log('⚠️ Cannot save: no valid items');
        return;
    }

    const order = {
        id: generateId(),
        shopId: state.currentShop.id,
        shopName: state.currentShop.name,
        items,
        totalValue,
        createdAt: new Date().toISOString()
    };

    state.orders.push(order);
    saveOrders();

    console.log('✅ Order saved:', order);

    closeOrderModal();
    updateDashboard();
}

// ===== Order Status Functions =====
function markOrderDelivered(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'delivered';
        order.deliveredAt = new Date().toISOString();
        saveOrders();
        updateDashboard();
        console.log('✅ Order marked as delivered:', orderId);
    }
}

function markOrderCancelled(orderId) {
    const order = state.orders.find(o => o.id === orderId);
    if (order) {
        order.status = 'cancelled';
        order.cancelledAt = new Date().toISOString();
        saveOrders();
        updateDashboard();
        console.log('❌ Order marked as cancelled:', orderId);
    }
}

function deleteOrder(orderId) {
    const index = state.orders.findIndex(o => o.id === orderId);
    if (index !== -1) {
        state.orders.splice(index, 1);
        saveOrders();
        updateDashboard();
        // Also refresh previous shops to update counts
        renderPreviousShops();
        console.log('🗑️ Order deleted:', orderId);
    }
}

// ===== Event Listeners =====
function initEventListeners() {
    // Welcome screen
    elements.getLocationBtn.addEventListener('click', getLocation);

    // Shop screen
    elements.backToWelcome.addEventListener('click', () => {
        showScreen('welcome-screen');
    });

    elements.shopNameInput.addEventListener('input', () => {
        elements.saveShopBtn.disabled = !elements.shopNameInput.value.trim();
    });

    elements.saveShopBtn.addEventListener('click', registerShop);

    // Dashboard
    elements.changeShopBtn.addEventListener('click', changeShop);
    elements.newOrderBtn.addEventListener('click', openOrderModal);

    // Modal
    elements.closeModalBtn.addEventListener('click', closeOrderModal);
    elements.orderModal.querySelector('.modal-backdrop').addEventListener('click', closeOrderModal);
    elements.addItemBtn.addEventListener('click', addOrderItem);
    elements.saveOrderBtn.addEventListener('click', saveOrder);

    // Enter key to submit shop name
    elements.shopNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !elements.saveShopBtn.disabled) {
            registerShop();
        }
    });
}

// ===== Previous Shops Functions =====
function renderPreviousShops() {
    if (state.shops.length === 0) {
        elements.previousShopsSection.classList.add('hidden');
        return;
    }

    elements.previousShopsSection.classList.remove('hidden');

    // Sort shops by most recent first
    const sortedShops = [...state.shops].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
    );

    elements.previousShopsList.innerHTML = sortedShops.map(shop => {
        // Get orders for this shop
        const shopOrders = state.orders.filter(order => order.shopId === shop.id);
        const orderCount = shopOrders.length;
        const totalValue = shopOrders.reduce((sum, order) => sum + order.totalValue, 0);

        return `
            <button class="shop-card" onclick="selectShop('${shop.id}')">
                <div class="shop-card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    </svg>
                </div>
                <div class="shop-card-info">
                    <div class="shop-card-name">${shop.name}</div>
                    <div class="shop-card-meta">
                        <span>${shop.lat.toFixed(4)}, ${shop.lng.toFixed(4)}</span>
                    </div>
                </div>
                <div class="shop-card-orders">${orderCount} orders</div>
                <div class="shop-card-value">${formatCurrency(totalValue)}</div>
            </button>
        `;
    }).join('');
}

function selectShop(shopId) {
    const shop = state.shops.find(s => s.id === shopId);
    if (!shop) return;

    console.log('🏪 Selected existing shop:', shop);

    state.currentShop = shop;
    state.currentLocation = { lat: shop.lat, lng: shop.lng };

    updateDashboard();
    showScreen('dashboard-screen');
}

// Render nearby shops with distance info
function renderNearbyShops(nearbyShops) {
    elements.previousShopsSection.classList.remove('hidden');

    // Update the section title
    const divider = elements.previousShopsSection.querySelector('.section-divider span');
    if (divider) {
        divider.textContent = 'shops at this location';
    }

    let html = nearbyShops.map(shop => {
        // Get orders for this shop
        const shopOrders = state.orders.filter(order => order.shopId === shop.id);
        const orderCount = shopOrders.length;
        const totalValue = shopOrders.reduce((sum, order) => sum + order.totalValue, 0);

        // Format distance
        const distanceText = shop.distance < 1000
            ? `${Math.round(shop.distance)}m away`
            : `${(shop.distance / 1000).toFixed(1)}km away`;

        return `
            <button class="shop-card" onclick="selectShop('${shop.id}')">
                <div class="shop-card-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    </svg>
                </div>
                <div class="shop-card-info">
                    <div class="shop-card-name">${shop.name}</div>
                    <div class="shop-card-meta">
                        <span class="distance-badge">${distanceText}</span>
                    </div>
                </div>
                <div class="shop-card-orders">${orderCount} orders</div>
                <div class="shop-card-value">${formatCurrency(totalValue)}</div>
            </button>
        `;
    }).join('');

    // Add "Register New Shop" button at the end
    html += `
        <button class="shop-card new-shop-card" onclick="goToRegisterShop()">
            <div class="shop-card-icon new-shop-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
                </svg>
            </div>
            <div class="shop-card-info">
                <div class="shop-card-name">Register New Shop</div>
                <div class="shop-card-meta">
                    <span>Add a new shop at this location</span>
                </div>
            </div>
        </button>
    `;

    elements.previousShopsList.innerHTML = html;
}

function goToRegisterShop() {
    showScreen('shop-screen');
}

// ===== Initialize App =====
function init() {
    loadAppData();
    initEventListeners();
    renderPreviousShops();
    showScreen('welcome-screen');
}

// Start the app
document.addEventListener('DOMContentLoaded', init);

