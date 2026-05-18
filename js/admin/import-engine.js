/**
 * Merges incoming price list data with current products
 * @param {Array} currentProducts 
 * @param {Array} incomingData - Array of { vid, vname, vprice, vstatus }
 * @returns {Array} - Array of updates for bulkUpdateProducts
 */
export function mergePriceListData(currentProducts, incomingData) {
    const updates = [];
    
    incomingData.forEach(item => {
        let existing = null;
        if (item.vid) {
            existing = currentProducts.find(p => p.vid === item.vid);
        } else if (item.vname) {
            existing = currentProducts.find(p => p.vname === item.vname);
        }
        
        if (existing) {
            const changes = {};
            let hasChanges = false;
            
            // Only update if value is provided and different
            if (item.vprice !== undefined && item.vprice !== null && item.vprice !== '') {
                const newPrice = Number(item.vprice);
                if (!isNaN(newPrice) && newPrice !== Number(existing.vprice)) {
                    changes.vprice = newPrice;
                    hasChanges = true;
                }
            }
            
            if (item.vstatus !== undefined && item.vstatus !== null && item.vstatus !== '' && item.vstatus !== existing.vstatus) {
                changes.vstatus = item.vstatus;
                hasChanges = true;
            }
            
            if (hasChanges) {
                updates.push({ vid: existing.vid, ...changes });
            }
        }
    });
    
    return updates;
}
