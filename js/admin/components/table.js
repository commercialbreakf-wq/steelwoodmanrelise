/**
 * Renders the product table
 * @param {HTMLElement} container 
 * @param {Array} products 
 * @param {Object} options - { onRowClick, onSelectionChange }
 */
export function renderProductTable(container, products, options = {}) {
    if (!container) return;
    
    container.innerHTML = `
        <div class="overflow-x-auto">
            <table class="w-full text-left border-collapse">
                <thead>
                    <tr class="border-b border-[#534347]/20 text-[10px] uppercase tracking-widest text-[#ffb0cc] font-['Space Grotesk']">
                        <th class="py-4 px-6 w-10">
                            <input type="checkbox" id="select-all-products" class="rounded border-[#534347]/50 bg-transparent text-[#ffb0cc] focus:ring-[#ffb0cc]/20">
                        </th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="vid">ID</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="vname">Наименование</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="vprice">Цена</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="vcat">Категория</th>
                        <th class="py-4 px-6 font-bold">Статус</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#534347]/10">
                    ${products.map(product => `
                        <tr class="group hover:bg-white/[0.02] transition-colors cursor-pointer" data-id="${product.vid}">
                            <td class="py-4 px-6">
                                <input type="checkbox" class="product-checkbox rounded border-[#534347]/50 bg-transparent text-[#ffb0cc] focus:ring-[#ffb0cc]/20" data-id="${product.vid}">
                            </td>
                            <td class="py-4 px-6 text-xs font-mono text-[#d7c1c7]">${product.vid}</td>
                            <td class="py-4 px-6 font-medium">${product.vname}</td>
                            <td class="py-4 px-6 text-[#ffb0cc] font-bold">${Number(product.vprice).toLocaleString()} ₽</td>
                            <td class="py-4 px-6 text-sm text-[#d7c1c7]">${product.vcat}</td>
                            <td class="py-4 px-6">
                                <span class="px-2 py-1 rounded-full text-[10px] uppercase tracking-tighter font-bold ${product.vstatus === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}">
                                    ${product.vstatus === 'active' ? 'Активен' : 'Черновик'}
                                </span>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    // Add event listeners
    const rows = container.querySelectorAll('tbody tr');
    rows.forEach(row => {
        row.addEventListener('click', (e) => {
            if (e.target.type === 'checkbox') return;
            const id = row.dataset.id;
            const product = products.find(p => p.vid === id);
            if (options.onRowClick) options.onRowClick(product);
        });
    });

    // Sorting logic
    const headers = container.querySelectorAll('th[data-sort]');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const sortKey = header.dataset.sort;
            const currentOrder = header.dataset.order || 'asc';
            const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
            
            // Clear other headers
            headers.forEach(h => {
                h.dataset.order = '';
                const icon = h.querySelector('.sort-icon');
                if (icon) icon.remove();
            });

            header.dataset.order = newOrder;
            header.innerHTML = `${header.textContent.split(' ')[0]} <span class="sort-icon material-symbols-outlined text-[10px] align-middle">${newOrder === 'asc' ? 'expand_less' : 'expand_more'}</span>`;

            const sortedProducts = [...products].sort((a, b) => {
                let valA = a[sortKey];
                let valB = b[sortKey];
                
                if (sortKey === 'vprice') {
                    valA = Number(valA);
                    valB = Number(valB);
                }
                
                if (valA < valB) return newOrder === 'asc' ? -1 : 1;
                if (valA > valB) return newOrder === 'asc' ? 1 : -1;
                return 0;
            });

            renderProductTable(container, sortedProducts, options);
        });
    });

    const selectAll = container.querySelector('#select-all-products');
    const checkboxes = container.querySelectorAll('.product-checkbox');
    
    selectAll?.addEventListener('change', () => {
        checkboxes.forEach(cb => cb.checked = selectAll.checked);
        if (options.onSelectionChange) {
            const selectedIds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.dataset.id);
            options.onSelectionChange(selectedIds);
        }
    });

    checkboxes.forEach(cb => {
        cb.addEventListener('change', () => {
            if (options.onSelectionChange) {
                const selectedIds = Array.from(checkboxes).filter(cb => cb.checked).map(cb => cb.dataset.id);
                options.onSelectionChange(selectedIds);
            }
            
            if (selectAll) {
                selectAll.checked = Array.from(checkboxes).every(cb => cb.checked);
                selectAll.indeterminate = Array.from(checkboxes).some(cb => cb.checked) && !selectAll.checked;
            }
        });
    });
}
