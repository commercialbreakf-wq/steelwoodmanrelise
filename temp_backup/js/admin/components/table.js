/**
 * Renders the product table
 * @param {HTMLElement} container 
 * @param {Array} products 
 * @param {Object} options - { onRowClick, onSelectionChange, onDelete }
 */
export function renderProductTable(container, products, options = {}) {
    if (!container) return;
    
    container.innerHTML = `
        <!-- Desktop Table View -->
        <div class="overflow-x-auto custom-scrollbar hidden md:block">
            <table class="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                    <tr class="border-b border-[#534347]/20 text-[10px] uppercase tracking-widest text-[#ffb0cc] font-['Space Grotesk']">
                        <th class="py-4 px-6 w-10">
                            <input type="checkbox" id="select-all-products" class="rounded border-[#534347]/50 bg-transparent text-[#ffb0cc] focus:ring-[#ffb0cc]/20">
                        </th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="name">Товар</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="parent_category">Категория (L1)</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="category">Подкатегория (L2)</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="price_ton">Цена (тонна)</th>
                        <th class="py-4 px-6 font-bold text-right">Действия</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#534347]/10">
                    ${products.map(product => `
                        <tr class="group hover:bg-white/[0.02] transition-colors cursor-pointer" data-id="${product.id}">
                            <td class="py-4 px-6">
                                <input type="checkbox" class="product-checkbox rounded border-[#534347]/50 bg-transparent text-[#ffb0cc] focus:ring-[#ffb0cc]/20" data-id="${product.id}">
                            </td>
                            <td class="py-4 px-6">
                                <div class="font-bold text-sm uppercase text-[#e7e2dd] group-hover:text-[#ffb0cc] transition-colors">${product.name}</div>
                                <div class="text-[10px] opacity-30 font-mono mt-0.5">ID: ${product.id}</div>
                            </td>
                            <td class="py-4 px-6">
                                <span class="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-[#d7c1c7] uppercase tracking-wider">
                                    ${product.parent_category || 'Без категории'}
                                </span>
                            </td>
                            <td class="py-4 px-6">
                                <span class="text-xs text-[#d7c1c7] opacity-60 italic">
                                    ${product.category || 'Без подкатегории'}
                                </span>
                            </td>
                            <td class="py-4 px-6">
                                <div class="text-[#ffb0cc] font-bold font-['Space Grotesk'] text-sm">${Number(product.price_ton || 0).toLocaleString()} ₽</div>
                                <div class="text-[10px] opacity-30 uppercase">${product.unit_label || 'тонна'}</div>
                            </td>
                            <td class="py-4 px-6 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <button type="button" class="edit-row p-2 rounded-lg hover:bg-[#ffb0cc]/10 text-[#ffb0cc] transition-all opacity-0 group-hover:opacity-100">
                                        <span class="material-symbols-outlined text-lg">edit</span>
                                    </button>
                                    <button type="button" class="delete-row p-2 rounded-lg hover:bg-red-500/10 text-red-400 transition-all opacity-0 group-hover:opacity-100">
                                        <span class="material-symbols-outlined text-lg">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>

        <!-- Mobile Card View -->
        <div class="grid grid-cols-1 gap-4 md:hidden">
            ${products.map(product => `
                <div class="product-mobile-card glass rounded-2xl p-5 border border-white/5 bg-[#151311] space-y-4 relative group cursor-pointer" data-id="${product.id}">
                    <div class="flex items-center justify-between gap-3 border-b border-white/5 pb-3">
                        <div class="flex items-center gap-3">
                            <input type="checkbox" class="product-checkbox rounded border-[#534347]/50 bg-transparent text-[#ffb0cc] focus:ring-[#ffb0cc]/20" data-id="${product.id}">
                            <div>
                                <div class="font-bold text-sm uppercase text-[#e7e2dd] group-hover:text-[#ffb0cc] transition-colors">${product.name}</div>
                                <div class="text-[10px] opacity-30 font-mono mt-0.5">ID: ${product.id}</div>
                            </div>
                        </div>
                        <div class="text-right shrink-0">
                            <div class="text-[#ffb0cc] font-bold font-['Space Grotesk'] text-sm">${Number(product.price_ton || 0).toLocaleString()} ₽</div>
                            <div class="text-[10px] opacity-30 uppercase">${product.unit_label || 'тонна'}</div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between text-xs text-[#d7c1c7] opacity-80 pt-1">
                        <div class="flex flex-col gap-1">
                            <span class="px-2 py-0.5 rounded-md bg-white/5 border border-white/10 text-[10px] uppercase tracking-wider w-fit">${product.parent_category || 'Без категории'}</span>
                            <span class="text-[10px] opacity-60 italic">${product.category || 'Без подкатегории'}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button type="button" class="edit-row p-2.5 rounded-xl bg-white/5 hover:bg-[#ffb0cc]/10 text-[#ffb0cc] border border-white/10 transition-all flex items-center justify-center min-w-[44px] min-h-[44px]">
                                <span class="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button type="button" class="delete-row p-2.5 rounded-xl bg-white/5 hover:bg-red-500/10 text-red-400 border border-white/10 transition-all flex items-center justify-center min-w-[44px] min-h-[44px]">
                                <span class="material-symbols-outlined text-base">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    // Add event listeners for both desktop table rows and mobile cards
    const items = container.querySelectorAll('tbody tr, .product-mobile-card');
    items.forEach(item => {
        const id = item.dataset.id;
        const product = products.find(p => String(p.id) === String(id));

        item.addEventListener('click', (e) => {
            if (e.target.closest('input[type="checkbox"]') || e.target.closest('button')) return;
            if (options.onRowClick) options.onRowClick(product);
        });

        item.querySelector('.edit-row')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (options.onRowClick) options.onRowClick(product);
        });

        item.querySelector('.delete-row')?.addEventListener('click', async (e) => {
            e.stopPropagation();
            if (await confirm(`Удалить товар "${product.name}"?`)) {
                const btn = e.currentTarget;
                const icon = btn.querySelector('.material-symbols-outlined');
                if (icon) icon.textContent = 'hourglass_empty';
                btn.disabled = true;
                try {
                    if (options.onDelete) await options.onDelete(id);
                } catch (err) {
                    if (icon) icon.textContent = 'delete';
                    btn.disabled = false;
                }
            }
        });
    });

    // Sorting logic (desktop headers)
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
                let valA = a[sortKey] || '';
                let valB = b[sortKey] || '';
                
                if (sortKey === 'price_ton') {
                    valA = Number(valA || 0);
                    valB = Number(valB || 0);
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
            const uniqueIds = [...new Set(selectedIds)];
            options.onSelectionChange(uniqueIds);
        }
    });

    checkboxes.forEach(cb => {
        cb.addEventListener('change', (e) => {
            const id = cb.dataset.id;
            const isChecked = cb.checked;
            container.querySelectorAll(`.product-checkbox[data-id="${id}"]`).forEach(c => c.checked = isChecked);

            if (options.onSelectionChange) {
                const selectedIds = Array.from(checkboxes).filter(c => c.checked).map(c => c.dataset.id);
                const uniqueIds = [...new Set(selectedIds)];
                options.onSelectionChange(uniqueIds);
            }
            
            if (selectAll) {
                const allChecked = Array.from(checkboxes).every(c => c.checked);
                selectAll.checked = allChecked;
                selectAll.indeterminate = Array.from(checkboxes).some(c => c.checked) && !allChecked;
            }
        });
    });
}
