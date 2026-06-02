/**
 * Central State Management for Admin Dashboard
 */

class AdminState {
    constructor() {
        this.products = [];
        this.users = [];
        this.orders = [];
        this.leads = [];
        this.loading = false;
        this.error = null;
        this.subscribers = {};
    }

    /**
     * Get authorization headers
     */
    getHeaders() {
        const token = localStorage.getItem('metal_token');
        return {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : ''
        };
    }

    /**
     * Subscribe to a state change event
     * @param {string} event 
     * @param {Function} callback 
     */
    on(event, callback) {
        if (!this.subscribers[event]) {
            this.subscribers[event] = [];
        }
        this.subscribers[event].push(callback);
        
        // Return unsubscribe function
        return () => {
            this.subscribers[event] = this.subscribers[event].filter(cb => cb !== callback);
        };
    }

    /**
     * Emit an event to all subscribers
     * @param {string} event 
     * @param {any} data 
     */
    emit(event, data) {
        if (this.subscribers[event]) {
            this.subscribers[event].forEach(cb => {
                try {
                    cb(data);
                } catch (err) {
                    console.error(`Error in subscriber for ${event}:`, err);
                }
            });
        }
    }

    /**
     * Set loading state
     * @param {boolean} isLoading 
     */
    setLoading(isLoading) {
        this.loading = isLoading;
        this.emit('loading', isLoading);
    }

    /**
     * Generic fetch wrapper with auth
     */
    async authenticatedFetch(url, options = {}) {
        const headers = { ...this.getHeaders(), ...(options.headers || {}) };
        const response = await fetch(url, { ...options, headers });
        
        if (response.status === 401 || response.status === 403) {
            // Token expired - show re-login prompt instead of hard redirect
            this._showSessionExpired();
            throw new Error('Сессия истекла. Войдите снова.');
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        
        return response.json();
    }

    _showSessionExpired() {
        // Avoid showing multiple times
        if (document.getElementById('session-expired-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.id = 'session-expired-overlay';
        overlay.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,0.85);display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);';
        overlay.innerHTML = `
            <div style="background:#1d1b19;border:1px solid rgba(150, 69, 81, 0.2);border-radius:24px;padding:40px 48px;text-align:center;max-width:400px;box-shadow:0 40px 80px rgba(0,0,0,0.6);">
                <span style="font-family:'Material Symbols Outlined';font-size:48px;color:#964551;display:block;margin-bottom:16px;">lock</span>
                <h2 style="color:#e7e2dd;font-size:20px;font-weight:700;margin:0 0 8px;font-family:'Space Grotesk',sans-serif;">Сессия истекла</h2>
                <p style="color:#d7c1c7;font-size:14px;margin:0 0 28px;line-height:1.5;">Ваша сессия завершилась. Войдите снова чтобы продолжить работу.</p>
                <button onclick="localStorage.removeItem('metal_token');localStorage.removeItem('metal_user');window.location.href='/cp'" style="background:#964551;color:#0f0e0c;border:none;border-radius:12px;padding:12px 32px;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:0.1em;cursor:pointer;font-family:'Space Grotesk',sans-serif;">
                    Войти снова
                </button>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    /**
     * Fetch all products from API
     */
    async fetchProducts() {
        this.setLoading(true);
        try {
            const data = await this.authenticatedFetch(`/api/admin/products?t=${Date.now()}`);
            this.products = Array.isArray(data) ? data : [];
            this.emit('products:updated', this.products);
            return this.products;
        } catch (error) {
            this.error = error.message;
            this.emit('error', error.message);
            console.error('Error fetching products:', error);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Fetch all users
     */
    async fetchUsers() {
        this.setLoading(true);
        try {
            const data = await this.authenticatedFetch(`/api/admin/users?t=${Date.now()}`);
            this.users = Array.isArray(data) ? data : [];
            this.emit('users:updated', this.users);
            return this.users;
        } catch (error) {
            this.emit('error', error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Fetch all orders
     */
    async fetchOrders() {
        this.setLoading(true);
        try {
            const data = await this.authenticatedFetch(`/api/admin/orders?t=${Date.now()}`);
            this.orders = Array.isArray(data) ? data : [];
            console.log(`[STATE] Fetched ${this.orders.length} orders`);
            this.emit('orders:updated', this.orders);
            return this.orders;
        } catch (error) {
            this.emit('error', error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Update order in local state and emit change
     */
    updateOrderLocal(id, updates) {
        const idx = this.orders.findIndex(o => String(o.id) === String(id));
        if (idx !== -1) {
            this.orders[idx] = { ...this.orders[idx], ...updates };
            console.log(`[STATE] Updated order #${id} locally`, updates);
            this.emit('orders:updated', this.orders);
            return this.orders[idx];
        }
        return null;
    }

    /**
     * Fetch all leads
     */
    async fetchLeads() {
        this.setLoading(true);
        try {
            const data = await this.authenticatedFetch(`/api/admin/leads?t=${Date.now()}`);
            this.leads = Array.isArray(data) ? data : [];
            this.emit('leads:updated', this.leads);
            return this.leads;
        } catch (error) {
            this.emit('error', error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Create a new product
     * @param {Object} data 
     */
    async createProduct(data) {
        this.setLoading(true);
        try {
            // Generate a temporary ID or let backend handle it
            const created = await this.authenticatedFetch('/api/admin/products', {
                method: 'POST',
                body: JSON.stringify(data)
            });
            
            this.products.unshift(created);
            this.emit('products:updated', this.products);
            window.showToast(`Товар "${created.name}" успешно создан`, 'success', 'Создание товара');
            return created;
        } catch (error) {
            this.emit('error', error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Delete a product
     * @param {string} id 
     */
    async deleteProduct(id) {
        this.setLoading(true);
        try {
            await this.authenticatedFetch(`/api/admin/products/${id}`, {
                method: 'DELETE'
            });
            
            this.products = this.products.filter(p => String(p.id) !== String(id));
            this.emit('products:updated', this.products);
            window.showToast(`Товар #${id} успешно удален`, 'success', 'Удаление товара');
            return true;
        } catch (error) {
            this.emit('error', error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Update a single product
     * @param {string} id 
     * @param {Object} data 
     */
    async updateProduct(id, data) {
        try {
            const updatedProduct = await this.authenticatedFetch(`/api/admin/products/${id}`, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
            
            // Update local state
            this.products = this.products.map(p => String(p.id) === String(id) ? updatedProduct : p);
            this.emit('products:updated', this.products);
            this.emit('product:updated', updatedProduct);
            window.showToast(`Товар "${updatedProduct.name}" успешно обновлен`, 'success', 'Обновление товара');
            
            return updatedProduct;
        } catch (error) {
            this.emit('error', error.message);
            console.error('Error updating product:', error);
            throw error;
        }
    }

    /**
     * Bulk update products
     * @param {Array} updates - Array of { id, ...changes }
     */
    async bulkUpdateProducts(updates) {
        this.setLoading(true);
        try {
            const result = await this.authenticatedFetch('/api/admin/bulk-update', {
                method: 'POST',
                body: JSON.stringify({ updates })
            });
            
            if (result.success) {
                // To keep state consistent, refetch all products
                window.showToast(`Успешно обновлено товаров: ${updates.length}`, 'success', 'Массовое обновление');
                return await this.fetchProducts();
            } else {
                throw new Error(result.error || 'Bulk update failed');
            }
        } catch (error) {
            this.emit('error', error.message);
            console.error('Error bulk updating products:', error);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Bulk insert products
     * @param {Array} products - Array of product objects to insert
     */
    async bulkInsertProducts(products) {
        this.setLoading(true);
        try {
            const result = await this.authenticatedFetch('/api/admin/bulk-insert', {
                method: 'POST',
                body: JSON.stringify({ products })
            });
            
            if (result.success) {
                window.showToast(`Успешно создано товаров: ${products.length}`, 'success', 'Массовое создание');
                return await this.fetchProducts();
            } else {
                throw new Error(result.error || 'Bulk insert failed');
            }
        } catch (error) {
            this.emit('error', error.message);
            console.error('Error bulk inserting products:', error);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    /**
     * Bulk delete products
     * @param {Array} ids - Array of product ids to delete
     */
    async bulkDeleteProducts(ids) {
        this.setLoading(true);
        try {
            const result = await this.authenticatedFetch('/api/admin/bulk-delete', {
                method: 'POST',
                body: JSON.stringify({ ids })
            });
            
            if (result.success) {
                // To keep state consistent, refetch all products
                window.showToast(`Успешно удалено товаров: ${ids.length}`, 'success', 'Массовое удаление');
                return await this.fetchProducts();
            } else {
                throw new Error(result.error || 'Bulk delete failed');
            }
        } catch (error) {
            this.emit('error', error.message);
            console.error('Error bulk deleting products:', error);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }
}

// Export as a singleton
export const state = new AdminState();
