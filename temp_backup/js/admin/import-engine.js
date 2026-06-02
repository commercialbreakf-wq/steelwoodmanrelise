/**
 * Merges incoming price list data with current products
 * @param {Array} currentProducts 
 * @param {Array} incomingData - Array of { id, name, price_ton, vstatus }
 * @returns {Array} - Array of updates for bulkUpdateProducts
 */
export function mergePriceListData(currentProducts, incomingData) {
    const updates = [];
    
    incomingData.forEach(item => {
        let existing = null;
        if (item.id) {
            existing = currentProducts.find(p => String(p.id) === String(item.id));
        } else if (item.name) {
            existing = currentProducts.find(p => p.name === item.name);
        }
        
        if (existing) {
            const changes = {};
            let hasChanges = false;
            
            // Only update if value is provided and different
            if (item.price_ton !== undefined && item.price_ton !== null && item.price_ton !== '') {
                const newPrice = Number(item.price_ton);
                if (!isNaN(newPrice) && newPrice !== Number(existing.price_ton)) {
                    changes.price_ton = newPrice;
                    hasChanges = true;
                }
            }
            
            if (item.vstatus !== undefined && item.vstatus !== null && item.vstatus !== '' && item.vstatus !== existing.vstatus) {
                changes.vstatus = item.vstatus;
                hasChanges = true;
            }
            
            if (hasChanges) {
                updates.push({ id: existing.id, ...changes });
            }
        }
    });
    
    return updates;
}
