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
     * Fetch all products from API
     */
    async fetchProducts() {
        this.setLoading(true);
        try {
            const response = await fetch('/api/admin/products');
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const data = await response.json();
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
     * Update a single product
     * @param {string} id 
     * @param {Object} data 
     */
    async updateProduct(id, data) {
        try {
            const response = await fetch(`/api/admin/products/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const updatedProduct = await response.json();
            
            // Update local state
            this.products = this.products.map(p => p.vid === id ? updatedProduct : p);
            this.emit('products:updated', this.products);
            this.emit('product:updated', updatedProduct);
            
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
            const response = await fetch('/api/admin/bulk-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ updates })
            });
            
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            
            const result = await response.json();
            
            if (result.success) {
                // To keep state consistent, refetch all products
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
}

// Export as a singleton
export const state = new AdminState();
