/**
 * Renders the product table
 * @param {HTMLElement} container 
 * @param {Array} products 
 * @param {Object} options - { onRowClick, onSelectionChange, onDelete }
 */
export function renderProductTable(container, products, options = {}) {
    if (!container) return;
    
    // Inject animation styles if not already present
    if (!document.getElementById('product-table-flash-styles')) {
        const style = document.createElement('style');
        style.id = 'product-table-flash-styles';
        style.textContent = `
            .row-flash-active, .row-flash-active td {
                animation: row-flash-active-kf 2.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards !important;
            }
            .row-flash-archived, .row-flash-archived td {
                animation: row-flash-archived-kf 2.5s cubic-bezier(0.25, 0.8, 0.25, 1) forwards !important;
            }
            @keyframes row-flash-active-kf {
                0% { background-color: rgba(34, 197, 94, 0.25) !important; }
                100% { background-color: transparent !important; }
            }
            @keyframes row-flash-archived-kf {
                0% { background-color: rgba(239, 68, 68, 0.2) !important; }
                100% { background-color: transparent !important; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Get current sort settings from container dataset or set defaults
    const currentSortKey = container.dataset.sortKey || '';
    const currentSortOrder = container.dataset.sortOrder || '';

    // Sort products if there is an active sort key
    let sortedProducts = [...products];
    if (currentSortKey) {
        sortedProducts.sort((a, b) => {
            let valA = a[currentSortKey] === undefined || a[currentSortKey] === null ? '' : a[currentSortKey];
            let valB = b[currentSortKey] === undefined || b[currentSortKey] === null ? '' : b[currentSortKey];

            if (currentSortKey === 'price_ton') {
                valA = Number(valA || 0);
                valB = Number(valB || 0);
            } else if (currentSortKey === 'created_at') {
                valA = valA ? new Date(valA).getTime() : 0;
                valB = valB ? new Date(valB).getTime() : 0;
            } else {
                valA = String(valA).toLowerCase();
                valB = String(valB).toLowerCase();
            }

            if (valA < valB) return currentSortOrder === 'asc' ? -1 : 1;
            if (valA > valB) return currentSortOrder === 'asc' ? 1 : -1;
            return 0;
        });
    }
    
    container.innerHTML = `
        <!-- Desktop Table View -->
        <div class="overflow-x-auto custom-scrollbar hidden md:block">
            <table class="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                    <tr class="border-b border-outline/10 text-[10px] uppercase tracking-widest text-primary font-label-caps bg-surface-container-low/30">
                        <th class="py-4 px-6 w-10 header-select-cell cursor-pointer">
                            <input type="checkbox" id="select-all-products" class="w-6 h-6 rounded border-outline/30 bg-transparent text-primary focus:ring-primary/20 cursor-pointer">
                        </th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-on-surface transition-colors" data-sort="name">
                            Товар ${currentSortKey === 'name' ? `<span class="sort-icon material-symbols-outlined text-[10px] align-middle">${currentSortOrder === 'asc' ? 'expand_less' : 'expand_more'}</span>` : ''}
                        </th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-on-surface transition-colors" data-sort="parent_category">
                            Категория (L1) ${currentSortKey === 'parent_category' ? `<span class="sort-icon material-symbols-outlined text-[10px] align-middle">${currentSortOrder === 'asc' ? 'expand_less' : 'expand_more'}</span>` : ''}
                        </th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-on-surface transition-colors" data-sort="category">
                            Подкатегория (L2) ${currentSortKey === 'category' ? `<span class="sort-icon material-symbols-outlined text-[10px] align-middle">${currentSortOrder === 'asc' ? 'expand_less' : 'expand_more'}</span>` : ''}
                        </th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-on-surface transition-colors" data-sort="vstatus">
                            Наличие ${currentSortKey === 'vstatus' ? `<span class="sort-icon material-symbols-outlined text-[10px] align-middle">${currentSortOrder === 'asc' ? 'expand_less' : 'expand_more'}</span>` : ''}
                        </th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-on-surface transition-colors" data-sort="price_ton">
                            Цена (тонна) ${currentSortKey === 'price_ton' ? `<span class="sort-icon material-symbols-outlined text-[10px] align-middle">${currentSortOrder === 'asc' ? 'expand_less' : 'expand_more'}</span>` : ''}
                        </th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-on-surface transition-colors" data-sort="created_at">
                            Создан ${currentSortKey === 'created_at' ? `<span class="sort-icon material-symbols-outlined text-[10px] align-middle">${currentSortOrder === 'asc' ? 'expand_less' : 'expand_more'}</span>` : ''}
                        </th>
                        <th class="py-4 px-6 font-bold text-right">Действия</th>
                     </tr>
                </thead>
                <tbody class="divide-y divide-outline/5">
                    ${sortedProducts.map(product => {
                        const recentlyUpdated = window.recentlyUpdatedProducts && window.recentlyUpdatedProducts[product.id];
                        let animationClass = '';
                        if (recentlyUpdated && (Date.now() - recentlyUpdated.timestamp < 3500)) {
                            animationClass = recentlyUpdated.status === 'active' ? ' row-flash-active' : ' row-flash-archived';
                        }
                        return `
                        <tr class="group hover:bg-on-surface/[0.02] transition-colors cursor-pointer${animationClass}" data-id="${product.id}">
                            <td class="py-4 px-6 product-select-cell" data-id="${product.id}">
                                <input type="checkbox" class="product-checkbox w-6 h-6 rounded border-outline/30 bg-transparent text-primary focus:ring-primary/20 cursor-pointer" data-id="${product.id}">
                            </td>
                            <td class="py-4 px-6">
                                <div class="font-bold text-sm uppercase transition-colors group-hover:text-primary ${product.vstatus === 'archived' ? 'text-red-500 dark:text-red-400' : 'text-on-surface'}">${product.name}</div>
                                <div class="text-[10px] opacity-30 font-mono mt-0.5 text-on-surface-variant">ID: ${product.id}</div>
                            </td>
                            <td class="py-4 px-6 product-l1-cell" data-id="${product.id}">
                                <span class="product-l1-badge cursor-pointer px-2 py-1 rounded-md bg-surface-container border border-outline/10 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all text-[10px] text-on-surface-variant uppercase tracking-wider font-label-caps inline-block select-none">
                                    ${product.parent_category || 'Без категории'}
                                </span>
                            </td>
                            <td class="py-4 px-6 product-l2-cell" data-id="${product.id}">
                                <span class="product-l2-badge cursor-pointer hover:text-primary hover:underline transition-all text-xs text-on-surface-variant opacity-60 italic inline-block select-none">
                                    ${product.category || 'Без подкатегории'}
                                </span>
                            </td>
                            <td class="py-4 px-6 product-status-cell" data-id="${product.id}">
                                <span class="cursor-pointer px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider font-label-caps transition-all hover:scale-105 inline-block ${product.vstatus === 'archived' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}">
                                    ${product.vstatus === 'archived' ? 'Нет в наличии' : 'В наличии'}
                                </span>
                            </td>
                            <td class="py-4 px-6">
                                <div class="text-primary font-bold font-display-xl text-sm">${Number(product.price_ton || 0).toLocaleString()} ₽</div>
                                <div class="text-[10px] opacity-30 uppercase font-label-caps text-on-surface-variant">${product.unit_label || 'тонна'}</div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="text-[10px] text-on-surface-variant opacity-60 font-mono">${product.created_at ? new Date(product.created_at).toLocaleDateString('ru-RU', {day:'2-digit',month:'2-digit',year:'2-digit'}) : '—'}</div>
                                <div class="text-[9px] text-on-surface-variant opacity-40 mt-0.5">${product.created_at ? new Date(product.created_at).toLocaleTimeString('ru-RU', {hour:'2-digit',minute:'2-digit'}) : ''}</div>
                            </td>
                            <td class="py-4 px-6 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <button type="button" class="preview-row p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-primary/10 hover:scale-110 active:scale-90 transition-all duration-300 opacity-0 group-hover:opacity-100 group/btn flex items-center justify-center hover:shadow-md hover:shadow-primary/10" title="Предпросмотр карточки">
                                        <span class="material-symbols-outlined text-lg">visibility</span>
                                    </button>
                                    <button type="button" class="edit-row p-2 rounded-xl text-primary hover:text-on-primary hover:bg-primary hover:scale-110 active:scale-90 transition-all duration-300 opacity-0 group-hover:opacity-100 group/btn flex items-center justify-center hover:shadow-md hover:shadow-primary/10">
                                        <span class="material-symbols-outlined text-lg transition-transform duration-300 group-hover/btn:rotate-12">edit</span>
                                    </button>
                                    <button type="button" class="delete-row p-2 rounded-xl text-error hover:text-white hover:bg-error hover:scale-110 active:scale-90 transition-all duration-300 opacity-0 group-hover:opacity-100 group/btn flex items-center justify-center hover:shadow-md hover:shadow-error/10">
                                        <span class="material-symbols-outlined text-lg transition-transform duration-300 group-hover/btn:-rotate-12">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>

        <!-- Mobile Card View -->
        <div class="grid grid-cols-1 gap-4 md:hidden">
            ${sortedProducts.map(product => {
                const recentlyUpdated = window.recentlyUpdatedProducts && window.recentlyUpdatedProducts[product.id];
                let animationClass = '';
                if (recentlyUpdated && (Date.now() - recentlyUpdated.timestamp < 3500)) {
                    animationClass = recentlyUpdated.status === 'active' ? ' row-flash-active' : ' row-flash-archived';
                }
                return `
                <div class="product-mobile-card liquid-glass rounded-2xl p-5 border border-outline/5 bg-surface-container-lowest space-y-4 relative group cursor-pointer${animationClass}" data-id="${product.id}">
                    <div class="flex items-center justify-between gap-3 border-b border-outline/5 pb-3">
                        <div class="flex items-center gap-3 product-select-cell-mobile cursor-pointer" data-id="${product.id}">
                            <input type="checkbox" class="product-checkbox w-6 h-6 rounded border-outline/30 bg-transparent text-primary focus:ring-primary/20 cursor-pointer" data-id="${product.id}">
                            <div>
                                <div class="font-bold text-sm uppercase transition-colors group-hover:text-primary ${product.vstatus === 'archived' ? 'text-red-500 dark:text-red-400' : 'text-on-surface'}">${product.name}</div>
                                <div class="text-[10px] opacity-30 font-mono mt-0.5 text-on-surface-variant">ID: ${product.id}</div>
                            </div>
                        </div>
                        <div class="text-right shrink-0">
                            <div class="text-primary font-bold font-display-xl text-sm">${Number(product.price_ton || 0).toLocaleString()} ₽</div>
                            <div class="text-[10px] opacity-30 uppercase font-label-caps text-on-surface-variant">${product.unit_label || 'тонна'}</div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between text-xs text-on-surface-variant opacity-80 pt-1">
                        <div class="flex flex-col gap-1.5">
                            <span class="product-l1-badge cursor-pointer px-2 py-0.5 rounded-md bg-surface-container border border-outline/10 hover:border-primary/50 hover:bg-primary/5 hover:text-primary transition-all text-[10px] uppercase tracking-wider w-fit font-label-caps select-none" data-id="${product.id}">${product.parent_category || 'Без категории'}</span>
                            <span class="product-l2-badge cursor-pointer hover:text-primary hover:underline transition-all text-[10px] opacity-60 italic select-none" data-id="${product.id}">${product.category || 'Без подкатегории'}</span>
                            <span class="product-status-badge cursor-pointer px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider w-fit font-label-caps transition-all hover:scale-105 inline-block ${product.vstatus === 'archived' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-green-500/10 text-green-500 border border-green-500/20'}" data-id="${product.id}">
                                ${product.vstatus === 'archived' ? 'Нет в наличии' : 'В наличии'}
                            </span>
                        </div>
                        <div class="flex items-center gap-2">
                            <button type="button" class="preview-row p-2.5 rounded-xl bg-surface-container hover:bg-primary/10 hover:text-primary hover:scale-110 active:scale-90 text-on-surface-variant border border-outline/10 transition-all flex items-center justify-center min-w-[44px] min-h-[44px] shadow-sm hover:shadow-primary/10" title="Предпросмотр карточки">
                                <span class="material-symbols-outlined text-base">visibility</span>
                            </button>
                            <button type="button" class="edit-row p-2.5 rounded-xl bg-surface-container hover:bg-primary hover:text-on-primary hover:scale-110 active:scale-90 text-primary border border-outline/10 transition-all flex items-center justify-center min-w-[44px] min-h-[44px] shadow-sm hover:shadow-primary/10">
                                <span class="material-symbols-outlined text-base">edit</span>
                            </button>
                            <button type="button" class="delete-row p-2.5 rounded-xl bg-surface-container hover:bg-error hover:text-white hover:scale-110 active:scale-90 text-error border border-outline/10 transition-all flex items-center justify-center min-w-[44px] min-h-[44px] shadow-sm hover:shadow-error/10">
                                <span class="material-symbols-outlined text-base">delete</span>
                            </button>
                        </div>
                    </div>
                </div>
                `;
            }).join('')}
        </div>
    `;

    // Add event listeners for both desktop table rows and mobile cards
    const items = container.querySelectorAll('tbody tr, .product-mobile-card');
    items.forEach(item => {
        const id = item.dataset.id;
        const product = sortedProducts.find(p => String(p.id) === String(id));

        item.addEventListener('click', (e) => {
            if (e.target.closest('.product-select-cell') || e.target.closest('.product-select-cell-mobile') || e.target.closest('.product-status-cell') || e.target.closest('.product-status-badge') || e.target.closest('.product-l1-cell') || e.target.closest('.product-l1-badge') || e.target.closest('.product-l2-cell') || e.target.closest('.product-l2-badge') || e.target.closest('input[type="checkbox"]') || e.target.closest('button')) return;
            if (options.onRowClick) options.onRowClick(product);
        });

        item.querySelector('.preview-row')?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (window.openProductCardModal) {
                window.openProductCardModal(product.id);
            }
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

    // Make left cell area fully clickable for selecting products
    container.querySelectorAll('.product-select-cell, .product-select-cell-mobile').forEach(cell => {
        cell.addEventListener('click', (e) => {
            e.stopPropagation();
            const checkbox = cell.querySelector('.product-checkbox');
            if (checkbox && e.target !== checkbox) {
                checkbox.checked = !checkbox.checked;
                checkbox.dispatchEvent(new Event('change'));
            }
        });
    });

    // Make table header selection cell fully clickable to select all
    container.querySelectorAll('.header-select-cell').forEach(cell => {
        cell.addEventListener('click', (e) => {
            e.stopPropagation();
            const selectAll = cell.querySelector('#select-all-products');
            if (selectAll && e.target !== selectAll) {
                selectAll.checked = !selectAll.checked;
                selectAll.dispatchEvent(new Event('change'));
            }
        });
    });

    // Make product status cell/badge clickable to toggle status
    container.querySelectorAll('.product-status-cell, .product-status-badge').forEach(el => {
        el.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = el.dataset.id || el.closest('[data-id]')?.dataset.id;
            const product = sortedProducts.find(p => String(p.id) === String(id));
            if (product && options.onStatusToggle) {
                const span = el.tagName === 'SPAN' ? el : el.querySelector('span');
                if (span) {
                    span.innerHTML = `<span class="inline-block animate-spin mr-1">⌛</span>...`;
                }
                await options.onStatusToggle(id, product.vstatus);
            }
        });
    });

    // Make product category L1 and L2 cells/badges clickable to change category
    container.querySelectorAll('.product-l1-badge').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = el.dataset.id || el.closest('[data-id]')?.dataset.id;
            const product = sortedProducts.find(p => String(p.id) === String(id));
            if (product && options.onCategoryClick) {
                options.onCategoryClick(product, 'l1', el);
            }
        });
    });

    container.querySelectorAll('.product-l2-badge').forEach(el => {
        el.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = el.dataset.id || el.closest('[data-id]')?.dataset.id;
            const product = sortedProducts.find(p => String(p.id) === String(id));
            if (product && options.onCategoryClick) {
                options.onCategoryClick(product, 'l2', el);
            }
        });
    });

    // Sorting logic (desktop headers)
    const headers = container.querySelectorAll('th[data-sort]');
    headers.forEach(header => {
        header.addEventListener('click', () => {
            const sortKey = header.dataset.sort;
            let newOrder = 'asc';
            
            if (currentSortKey === sortKey) {
                newOrder = currentSortOrder === 'asc' ? 'desc' : 'asc';
            }
            
            // Set attributes on container
            container.dataset.sortKey = sortKey;
            container.dataset.sortOrder = newOrder;

            // Re-render
            renderProductTable(container, products, options);
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
