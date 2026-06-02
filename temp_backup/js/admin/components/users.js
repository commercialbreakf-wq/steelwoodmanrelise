// ── Supabase Realtime for user modal chat ─────────────────────────────────
const SUPABASE_URL = 'https://drbknuvnsyonmeudoleo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYmtudXZuc3lvbm1ldWRvbGVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTA4MTYsImV4cCI6MjA5NDE4NjgxNn0.gEBVSWAOGZGB7IIVsVIs3MSO2UjZlG6UzTdOEK0grOc';
let usersSupabaseRT = null;
let activeUserChatChannel = null;
let activeStackedChatChannel = null;

try {
    const sb = window.supabase;
    if (sb && sb.createClient) {
        usersSupabaseRT = sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (e) { console.warn('Supabase client init failed in users.js:', e); }

/**
 * Renders the users table
 * @param {HTMLElement} container 
 * @param {Object} state 
 */
export async function renderUsersView(container, state) {
    if (!container) return;

    container.innerHTML = `
        <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-2xl font-bold font-['Space Grotesk'] tracking-tight text-[#e7e2dd]">Клиентская база</h3>
                    <p class="text-sm text-[#d7c1c7] mt-1">Управление профилями и ролями пользователей</p>
                </div>
                <button type="button" id="refresh-users-btn" class="flex items-center justify-center gap-2 px-4 py-4 bg-white/5 text-[#ffb0cc] rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#ffb0cc]/10 transition-all">
                    <span class="material-symbols-outlined text-sm">refresh</span>
                </button>
            </div>

            <div class="glass rounded-3xl overflow-hidden min-h-[400px]" id="users-table-container">
                <div class="flex items-center justify-center h-[400px]">
                    <div class="w-8 h-8 border-2 border-[#ffb0cc]/20 border-t-[#ffb0cc] rounded-full animate-spin"></div>
                </div>
            </div>
        </div>
    `;

    const tableContainer = document.getElementById('users-table-container');

    const loadUsers = async () => {
        tableContainer.innerHTML = `
            <div class="flex items-center justify-center h-[400px]">
                <div class="w-8 h-8 border-2 border-[#ffb0cc]/20 border-t-[#ffb0cc] rounded-full animate-spin"></div>
            </div>
        `;
        try {
            const users = await state.fetchUsers();
            let sortKey = 'created_at';
            let sortOrder = 'desc';

            const updateTable = () => {
                const rolePriority = {
                    'admin': 1,
                    'user': 2
                };

                const sortedUsers = [...users].sort((a, b) => {
                    let valA = a[sortKey];
                    let valB = b[sortKey];

                    if (sortKey === 'role') {
                        valA = rolePriority[valA] || 99;
                        valB = rolePriority[valB] || 99;
                    } else if (sortKey === 'created_at') {
                        valA = new Date(valA);
                        valB = new Date(valB);
                    } else if (sortKey === 'name' || sortKey === 'company_name') {
                        valA = (valA || '').toLowerCase();
                        valB = (valB || '').toLowerCase();
                    }

                    if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                    if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                    return 0;
                });

                renderUsersTable(tableContainer, sortedUsers, state, { sortKey, sortOrder, onSort: (key) => {
                    if (sortKey === key) {
                        sortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                    } else {
                        sortKey = key;
                        sortOrder = 'asc';
                    }
                    updateTable();
                }});
            };

            updateTable();
        } catch (err) {
            tableContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center h-[400px] text-red-400 gap-4">
                    <span class="material-symbols-outlined text-4xl">error</span>
                    <div class="text-sm font-medium">${err.message}</div>
                    <button onclick="location.reload()" class="text-xs uppercase tracking-widest font-bold underline">Повторить попытку</button>
                </div>
            `;
        }
    };

    document.getElementById('refresh-users-btn').onclick = loadUsers;
    await loadUsers();
}

function renderUsersTable(container, users, state, sortOptions = {}) {
    if (users.length === 0) {
        container.innerHTML = `
            <div class="flex flex-col items-center justify-center h-[400px] text-[#d7c1c7] opacity-40">
                <span class="material-symbols-outlined text-6xl mb-4">group_off</span>
                <div class="font-['Space Grotesk'] uppercase tracking-widest">Клиентов пока нет</div>
            </div>
        `;
        return;
    }

    const { sortKey, sortOrder, onSort } = sortOptions;

    const getSortIcon = (key) => {
        if (sortKey !== key) return '<span class="material-symbols-outlined text-[10px] opacity-20 ml-1">sort</span>';
        return sortOrder === 'asc' 
            ? '<span class="material-symbols-outlined text-[10px] text-white ml-1">expand_less</span>' 
            : '<span class="material-symbols-outlined text-[10px] text-white ml-1">expand_more</span>';
    };

    container.innerHTML = `
        <div class="overflow-x-auto custom-scrollbar">
            <table class="w-full text-left border-collapse min-w-[900px]">
                <thead>
                    <tr class="border-b border-[#534347]/20 text-[10px] uppercase tracking-widest text-[#ffb0cc] font-['Space Grotesk']">
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="name">Пользователь ${getSortIcon('name')}</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="company_name">Компания ${getSortIcon('company_name')}</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-white transition-colors" data-sort="role">Роль ${getSortIcon('role')}</th>
                        <th class="py-4 px-6 font-bold text-right cursor-pointer hover:text-white transition-colors" data-sort="created_at">Дата ${getSortIcon('created_at')}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-[#534347]/10">
                    ${users.map(user => `
                        <tr class="group hover:bg-white/[0.02] transition-colors cursor-pointer user-row" data-id="${user.id}">
                            <td class="py-5 px-6">
                                <div class="font-bold text-base uppercase text-[#e7e2dd] group-hover:text-[#ffb0cc] transition-colors tracking-tight">${user.name || 'Без имени'}</div>
                                <div class="text-sm text-[#ffb0cc] font-mono font-medium mt-1 flex items-center gap-1.5 select-all">
                                    <span class="material-symbols-outlined text-sm">mail</span>
                                    ${user.email}
                                </div>
                                <div class="text-sm text-[#d7c1c7] font-mono mt-0.5 flex items-center gap-1.5 select-all">
                                    <span class="material-symbols-outlined text-sm">call</span>
                                    ${user.phone || 'Телефон не указан'}
                                </div>
                            </td>
                            <td class="py-4 px-6">
                                <div class="text-sm text-[#d7c1c7] font-medium">${user.company_name || '—'}</div>
                                <div class="text-[10px] text-[#d7c1c7] opacity-50">ИНН: ${user.inn || '—'}</div>
                            </td>
                            <td class="py-4 px-6" onclick="event.stopPropagation()">
                                ${(() => {
                                    const roleObj = window.USER_ROLE_OPTIONS.find(r => r.value === user.role) || { label: user.role || 'USER', color: '#3b82f6', icon: 'person' };
                                    return `<button type="button" data-id="${user.id}" data-role="${user.role}" class="role-modal-btn flex items-center justify-between gap-2 bg-[#151311] border border-white/10 hover:border-white/20 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all shadow-md group/btn w-[150px] shrink-0" style="border-left: 4px solid ${roleObj.color};">
                                        <span class="flex items-center gap-1.5 truncate" style="color: ${roleObj.color};">
                                            <span class="material-symbols-outlined text-sm shrink-0">${roleObj.icon}</span>
                                            <span class="truncate">${roleObj.label}</span>
                                        </span>
                                        <span class="material-symbols-outlined text-xs text-[#d7c1c7] opacity-40 group-hover/btn:opacity-100 transition-opacity shrink-0 ml-1">expand_more</span>
                                    </button>`;
                                })()}
                            </td>
                            <td class="py-4 px-6 text-right">
                                <div class="flex items-center justify-end gap-2">
                                    <div class="text-[10px] text-[#d7c1c7] opacity-30 font-mono">
                                        ${new Date(user.created_at).toLocaleDateString()}
                                    </div>
                                    <button type="button" data-id="${user.id}" class="delete-user-btn p-2 rounded-lg hover:bg-red-500/10 text-red-400/50 hover:text-red-400 transition-all opacity-0 group-hover:opacity-100" title="Удалить пользователя">
                                        <span class="material-symbols-outlined text-base">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;

    // Add sort listeners
    container.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            if (onSort) onSort(th.dataset.sort);
        });
    });

    // Event listeners
    container.querySelectorAll('.role-modal-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const currentRole = btn.dataset.role;
            const newRole = await window.openStatusSelectModal(window.USER_ROLE_OPTIONS, currentRole, `Изменение роли пользователя #${id}`);
            if (!newRole || newRole === currentRole) return;
            
            try {
                await state.authenticatedFetch(`/api/admin/users/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ role: newRole })
                });
                window.showToast(`Роль пользователя #${id} успешно изменена на ${newRole.toUpperCase()}`, 'success', 'Изменение роли');
                state.fetchUsers(); // refresh view
            } catch (err) {
                alert('Ошибка: ' + err.message);
            }
        });
    });

    // Delete user button
    container.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (await confirm(`Вы уверены, что хотите удалить пользователя #${id}? Это действие необратимо.`)) {
                const icon = btn.querySelector('.material-symbols-outlined');
                if (icon) icon.textContent = 'hourglass_empty';
                btn.disabled = true;
                try {
                    await state.authenticatedFetch(`/api/admin/users/${id}`, {
                        method: 'DELETE'
                    });
                    document.getElementById('refresh-users-btn')?.click();
                    window.showToast(`Пользователь #${id} успешно удален`, 'success', 'Удаление пользователя');
                } catch (err) {
                    alert('Ошибка при удалении пользователя: ' + err.message);
                    if (icon) icon.textContent = 'delete';
                    btn.disabled = false;
                }
            }
        });
    });

    container.querySelectorAll('.user-row').forEach(row => {
        row.addEventListener('click', () => {
            const id = row.dataset.id;
            const user = users.find(u => String(u.id) === String(id));
            if (user) {
                openUserModal(user, state);
            }
        });
    });
}

async function openUserModal(user, state) {
    let modalWrapper = document.getElementById('admin-user-modal-wrapper');
    if (!modalWrapper) {
        modalWrapper = document.createElement('div');
        modalWrapper.id = 'admin-user-modal-wrapper';
        modalWrapper.className = 'fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 opacity-0 transition-opacity duration-300';
        document.body.appendChild(modalWrapper);
    }

    // Always fetch fresh orders and leads from the server to ensure chat messages and statuses are 100% up to date
    try { await state.fetchOrders(); } catch(e) { console.error(e); }
    try { await state.fetchLeads(); } catch(e) { console.error(e); }

    let userOrders = state.orders.filter(o => 
        String(o.user_id) === String(user.id) || 
        (o.customer_email && o.customer_email.toLowerCase() === user.email.toLowerCase()) ||
        (o.customer_inn && user.inn && o.customer_inn === user.inn)
    );

    let userLeads = state.leads.filter(l => 
        (l.email && l.email.toLowerCase() === user.email.toLowerCase()) ||
        (l.phone && user.phone && l.phone === user.phone)
    );

    let activeTab = 'info'; // info, orders, leads, chat

    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    };

    const totalMsgCount = userOrders.reduce((sum, o) => {
        let cnt = 0;
        try {
            if (Array.isArray(o.messages)) cnt = o.messages.length;
            else if (typeof o.messages === 'string') cnt = JSON.parse(o.messages).length;
        } catch(e) {}
        return sum + cnt;
    }, 0);

    const renderModalContent = () => {
        let tabContent = '';
        if (activeTab === 'info') {
            tabContent = `
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                    <!-- Контакты -->
                    <div class="glass p-6 rounded-3xl border-white/5 space-y-4 bg-[#151311]">
                        <div class="flex items-center gap-3 text-[#ffb0cc]">
                            <span class="material-symbols-outlined text-xl">contact_mail</span>
                            <h4 class="text-xs uppercase font-bold tracking-widest font-['Space Grotesk']">Контактные данные</h4>
                        </div>
                        <div class="space-y-3">
                            <div>
                                <div class="text-[10px] uppercase text-[#d7c1c7] opacity-40">Email адрес</div>
                                <div class="flex items-center justify-between gap-2 mt-1 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span class="text-sm font-mono text-[#e7e2dd] select-all">${user.email}</span>
                                    <button type="button" onclick="navigator.clipboard.writeText('${user.email}'); window.showToast('Email скопирован в буфер обмена', 'success', 'Копирование');" class="text-[#ffb0cc] hover:text-white transition-colors" title="Скопировать">
                                        <span class="material-symbols-outlined text-sm">content_copy</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <div class="text-[10px] uppercase text-[#d7c1c7] opacity-40">Телефон</div>
                                <div class="flex items-center justify-between gap-2 mt-1 bg-white/5 p-3 rounded-xl border border-white/5">
                                    <span class="text-sm font-mono text-[#e7e2dd] select-all">${user.phone || 'Не указан'}</span>
                                    ${user.phone ? `
                                        <a href="tel:${user.phone}" class="text-[#ffb0cc] hover:text-white transition-colors" title="Позвонить">
                                            <span class="material-symbols-outlined text-sm">call</span>
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Реквизиты компании -->
                    <div class="glass p-6 rounded-3xl border-white/5 space-y-4 bg-[#151311]">
                        <div class="flex items-center gap-3 text-[#ffb0cc]">
                            <span class="material-symbols-outlined text-xl">domain</span>
                            <h4 class="text-xs uppercase font-bold tracking-widest font-['Space Grotesk']">Реквизиты компании</h4>
                        </div>
                        <div class="space-y-3 text-xs">
                            <div class="flex justify-between py-1.5 border-b border-white/5">
                                <span class="text-[#d7c1c7] opacity-50 uppercase text-[10px]">Компания</span>
                                <span class="font-bold text-[#e7e2dd] text-right">${user.company_name || '—'}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-white/5">
                                <span class="text-[#d7c1c7] opacity-50 uppercase text-[10px]">Должность</span>
                                <span class="font-bold text-[#e7e2dd] text-right">${user.position || '—'}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-white/5">
                                <span class="text-[#d7c1c7] opacity-50 uppercase text-[10px]">ИНН</span>
                                <span class="font-mono text-[#e7e2dd] text-right">${user.inn || '—'}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-white/5">
                                <span class="text-[#d7c1c7] opacity-50 uppercase text-[10px]">КПП</span>
                                <span class="font-mono text-[#e7e2dd] text-right">${user.kpp || '—'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Адреса -->
                    <div class="glass p-6 rounded-3xl border-white/5 space-y-4 bg-[#151311] md:col-span-2">
                        <div class="flex items-center gap-3 text-[#ffb0cc]">
                            <span class="material-symbols-outlined text-xl">location_on</span>
                            <h4 class="text-xs uppercase font-bold tracking-widest font-['Space Grotesk']">Адреса</h4>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                            <div class="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                                <div class="text-[10px] uppercase text-[#d7c1c7] opacity-40 font-bold">Юридический адрес</div>
                                <div class="text-[#e7e2dd] leading-relaxed">${user.legal_address || 'Не указан'}</div>
                            </div>
                            <div class="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                                <div class="text-[10px] uppercase text-[#d7c1c7] opacity-40 font-bold">Фактический адрес</div>
                                <div class="text-[#e7e2dd] leading-relaxed">${user.actual_address || 'Не указан'}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Системная информация -->
                    <div class="glass p-6 rounded-3xl border-white/5 space-y-4 bg-[#151311] md:col-span-2">
                        <div class="flex items-center gap-3 text-[#ffb0cc]">
                            <span class="material-symbols-outlined text-xl">dns</span>
                            <h4 class="text-xs uppercase font-bold tracking-widest font-['Space Grotesk']">Системная информация</h4>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                            <div class="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                                <div class="text-[10px] uppercase text-[#d7c1c7] opacity-40 font-bold">ID профиля</div>
                                <div class="font-mono text-[#ffb0cc] text-xs truncate select-all">${user.id}</div>
                            </div>
                            <div class="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                                <div class="text-[10px] uppercase text-[#d7c1c7] opacity-40 font-bold">Auth ID (Supabase)</div>
                                <div class="font-mono text-[#ffb0cc] text-xs truncate select-all">${user.auth_id || '—'}</div>
                            </div>
                            <div class="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-1">
                                <div class="text-[10px] uppercase text-[#d7c1c7] opacity-40 font-bold">Дата регистрации</div>
                                <div class="font-mono text-[#e7e2dd] text-xs">${new Date(user.created_at).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (activeTab === 'orders') {
            if (userOrders.length === 0) {
                tabContent = `
                    <div class="flex flex-col items-center justify-center py-16 text-[#d7c1c7] opacity-40 animate-in fade-in duration-300">
                        <span class="material-symbols-outlined text-6xl mb-4">shopping_cart_off</span>
                        <div class="font-['Space Grotesk'] uppercase tracking-widest text-sm">У пользователя нет заказов</div>
                    </div>
                `;
            } else {
                tabContent = `
                    <div class="space-y-3 animate-in fade-in duration-300">
                        ${userOrders.map(order => {
                            const items = order.order_items || [];
                            const msgCount = Array.isArray(order.messages) ? order.messages.length : (typeof order.messages === 'string' ? (() => { try { return JSON.parse(order.messages).length; } catch(e) { return 0; } })() : 0);
                            const statusColors = {
                                new: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
                                processing: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
                                completed: 'bg-green-500/10 text-green-400 border-green-500/20',
                                cancelled: 'bg-red-500/10 text-red-400 border-red-500/20'
                            };
                            const statusNames = {
                                new: 'Новый',
                                processing: 'В обработке',
                                completed: 'Завершен',
                                cancelled: 'Отменен'
                            };
                            const badgeClass = statusColors[order.status] || 'bg-white/10 text-[#d7c1c7] border-white/20';
                            const statusName = statusNames[order.status] || order.status;

                            return `
                                <div class="user-order-card group flex items-center justify-between gap-4 p-4 bg-[#151311] rounded-2xl border border-[#534347]/20 hover:border-[#ffb0cc]/30 hover:bg-[#ffb0cc]/5 transition-all cursor-pointer" data-order-id="${order.id}">
                                    <div class="flex items-center gap-4 min-w-0">
                                        <div class="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#ffb0cc]/10 transition-colors">
                                            <span class="material-symbols-outlined text-[#ffb0cc] text-base">shopping_bag</span>
                                        </div>
                                        <div class="min-w-0">
                                            <div class="flex items-center gap-2">
                                                <span class="font-mono font-bold text-sm text-[#e7e2dd] group-hover:text-[#ffb0cc] transition-colors">#${order.id}</span>
                                                ${msgCount > 0 ? `<span class="flex items-center gap-1 text-[9px] text-[#ffb0cc] bg-[#ffb0cc]/10 px-2 py-0.5 rounded-full"><span class="w-1.5 h-1.5 rounded-full bg-[#ffb0cc] inline-block animate-pulse"></span>${msgCount} сообщ.</span>` : ''}
                                                ${order.invoice_url ? `<span class="text-[9px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">📎 счёт</span>` : ''}
                                            </div>
                                            <div class="text-[10px] text-[#d7c1c7] opacity-50 mt-0.5">
                                                ${new Date(order.created_at).toLocaleDateString()} • 
                                                ${items.length > 0 ? items.map(i => `${i.product_name} x${i.quantity}`).join(', ') : 'Нет позиций'}
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-3 shrink-0">
                                        <div class="text-right">
                                            <div class="font-['Space Grotesk'] font-bold text-sm text-[#ffb0cc]">${Number(order.total).toLocaleString()} ₽</div>
                                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badgeClass}">${statusName}</span>
                                        </div>
                                        <span class="material-symbols-outlined text-[#d7c1c7] opacity-30 group-hover:opacity-80 group-hover:text-[#ffb0cc] transition-all text-base">chevron_right</span>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `;
            }
        } else if (activeTab === 'chat') {
            if (userOrders.length === 0) {
                tabContent = `
                    <div class="flex flex-col items-center justify-center py-16 text-[#d7c1c7] opacity-40 animate-in fade-in duration-300">
                        <span class="material-symbols-outlined text-6xl mb-4">forum</span>
                        <div class="font-['Space Grotesk'] uppercase tracking-widest text-sm text-center">У пользователя нет заказов</div>
                        <div class="text-xs mt-2 max-w-md text-center opacity-70">СМС-чат привязывается к конкретному заказу для сохранения истории и контекста сделки.</div>
                    </div>
                `;
            } else {
                let selectedOrderId = modalWrapper.dataset.chatOrderId || userOrders[0].id;
                const selectedOrder = userOrders.find(o => String(o.id) === String(selectedOrderId)) || userOrders[0];
                selectedOrderId = selectedOrder.id;
                modalWrapper.dataset.chatOrderId = selectedOrderId;

                let chatMsgs = [];
                try {
                    if (typeof selectedOrder.messages === 'string') chatMsgs = JSON.parse(selectedOrder.messages);
                    else if (Array.isArray(selectedOrder.messages)) chatMsgs = selectedOrder.messages;
                } catch(e) {}

                const rChatMsgs = () => chatMsgs.map(m => {
                    const isAdmin = m.sender === 'admin';
                    const timeStr = new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
                    const dateStr = new Date(m.timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });

                    if (isAdmin) {
                        return `
                            <div class="flex flex-col items-end mb-4 animate-in fade-in duration-300">
                                <div class="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                                    <div class="px-5 py-3 rounded-3xl text-sm bg-[#ffb0cc] text-[#0f0e0c] rounded-br-none shadow-md font-medium leading-relaxed">
                                        ${m.text}
                                    </div>
                                </div>
                                <div class="text-[10px] text-[#d7c1c7] opacity-50 font-mono mt-1.5 flex items-center gap-1 mr-1">
                                    <span class="material-symbols-outlined text-[12px] text-[#ffb0cc]">done_all</span>
                                    Вы (Менеджер) • ${dateStr} ${timeStr}
                                </div>
                            </div>
                        `;
                    } else {
                        return `
                            <div class="flex flex-col items-start mb-4 animate-in fade-in duration-300">
                                <div class="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                                    <div class="px-5 py-3 rounded-3xl text-sm bg-[#2a2624] border border-[#ffb0cc]/40 text-[#e7e2dd] rounded-bl-none shadow-xl leading-relaxed">
                                        ${m.text}
                                    </div>
                                </div>
                                <div class="text-[10px] text-[#ffb0cc] font-mono mt-1.5 flex items-center gap-1 ml-1 font-bold">
                                    <span class="material-symbols-outlined text-[12px]">person</span>
                                    Клиент • ${dateStr} ${timeStr}
                                </div>
                            </div>
                        `;
                    }
                }).join('');

                tabContent = `
                    <div class="flex flex-col h-[500px] animate-in fade-in duration-300">
                        <!-- Выбор заказа -->
                        <div class="flex items-center justify-between bg-[#151311] p-4 rounded-2xl border border-[#534347]/30 mb-4 shrink-0">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-xl bg-[#ffb0cc]/10 flex items-center justify-center">
                                    <span class="material-symbols-outlined text-[#ffb0cc] text-sm">receipt_long</span>
                                </div>
                                <span class="text-xs font-bold uppercase tracking-widest text-[#e7e2dd] font-['Space Grotesk']">Чат по заказу:</span>
                            </div>
                            <select id="user-modal-chat-order-select" class="bg-[#1d1b19] border border-[#534347]/40 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#ffb0cc] outline-none focus:border-[#ffb0cc] transition-all cursor-pointer">
                                ${userOrders.map(o => `<option value="${o.id}" ${String(o.id) === String(selectedOrderId) ? 'selected' : ''}>Заказ #${o.id} (${o.status === 'new' ? 'Новый' : o.status === 'processing' ? 'В обработке' : o.status === 'completed' ? 'Завершен' : 'Отменен'}) — ${Number(o.total).toLocaleString()} ₽</option>`).join('')}
                            </select>
                        </div>

                        <!-- Окно чата -->
                        <div class="flex-1 bg-black/40 rounded-3xl border border-white/10 flex flex-col min-h-0 overflow-hidden shadow-2xl">
                            <div class="bg-white/5 px-6 py-3.5 border-b border-white/10 flex items-center justify-between shrink-0">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-[#ffb0cc]/20 flex items-center justify-center text-[#ffb0cc] border border-[#ffb0cc]/30">
                                        <span class="material-symbols-outlined text-base">forum</span>
                                    </div>
                                    <div>
                                        <span class="text-xs font-bold text-[#e7e2dd] uppercase tracking-widest font-['Space Grotesk'] block">История сообщений</span>
                                        <span class="text-[9px] text-[#d7c1c7] opacity-60 block">Синхронизация Supabase Realtime</span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-[9px] text-[#ffb0cc] bg-[#ffb0cc]/10 border border-[#ffb0cc]/20 px-2.5 py-1 rounded-full uppercase tracking-widest font-bold">Telegram style</span>
                                    <span class="flex items-center gap-1 text-[9px] text-green-400 font-bold"><span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>live</span>
                                </div>
                            </div>
                            <div id="user-modal-chat-messages" class="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                                ${chatMsgs.length ? rChatMsgs() : '<div class="flex flex-col items-center justify-center h-full text-[#d7c1c7] opacity-40 text-center p-6"><span class="material-symbols-outlined text-4xl mb-3 opacity-50">forum</span><span class="text-xs uppercase tracking-widest font-bold font-[\'Space Grotesk\'] text-[#e7e2dd]">Нет сообщений в этом заказе</span></div>'}
                            </div>
                            <div class="p-4 border-t border-white/10 flex gap-3 shrink-0 bg-white/5 items-center">
                                <input id="user-modal-chat-input" type="text" placeholder="Написать клиенту в заказ #${selectedOrderId}..." class="flex-1 bg-black/50 border border-white/10 rounded-2xl px-5 py-3 text-sm outline-none focus:border-[#ffb0cc] transition-all text-[#e7e2dd] placeholder:opacity-40 shadow-inner">
                                <button id="user-modal-chat-send" class="w-12 h-12 rounded-2xl bg-[#ffb0cc] text-[#0f0e0c] hover:brightness-110 flex items-center justify-center transition-all shrink-0 shadow-lg shadow-[#ffb0cc]/20">
                                    <span class="material-symbols-outlined text-base">send</span>
                                </button>
                            </div>
                        </div>
                    </div>
                `;

                if (usersSupabaseRT) {
                    if (activeUserChatChannel) {
                        usersSupabaseRT.removeChannel(activeUserChatChannel);
                        activeUserChatChannel = null;
                    }
                    activeUserChatChannel = usersSupabaseRT
                        .channel(`user-modal-chat-${selectedOrderId}`)
                        .on('postgres_changes', {
                            event: 'UPDATE',
                            schema: 'public',
                            table: 'orders',
                            filter: `id=eq.${selectedOrderId}`
                        }, (payload) => {
                            const newMsgs = payload.new.messages;
                            if (!newMsgs) return;
                            let updated = [];
                            try { updated = typeof newMsgs === 'string' ? JSON.parse(newMsgs) : newMsgs; } catch(e) { return; }
                            if (updated.length > chatMsgs.length) {
                                chatMsgs = updated;
                                selectedOrder.messages = chatMsgs;
                                const chatBox = modalWrapper.querySelector('#user-modal-chat-messages');
                                if (chatBox) {
                                    chatBox.innerHTML = rChatMsgs();
                                    chatBox.scrollTop = chatBox.scrollHeight;
                                    chatBox.style.transition = 'background 0.3s';
                                    chatBox.style.background = 'rgba(255,176,204,0.05)';
                                    setTimeout(() => { chatBox.style.background = ''; }, 600);
                                }
                            }
                        })
                        .subscribe();
                }

                setTimeout(() => {
                    const orderSelect = modalWrapper.querySelector('#user-modal-chat-order-select');
                    const sendBtn = modalWrapper.querySelector('#user-modal-chat-send');
                    const chatInput = modalWrapper.querySelector('#user-modal-chat-input');
                    const chatBox = modalWrapper.querySelector('#user-modal-chat-messages');

                    if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;

                    if (orderSelect) {
                        orderSelect.onchange = async (e) => {
                            modalWrapper.dataset.chatOrderId = e.target.value;
                            try { await state.fetchOrders(); } catch(err) { console.error(err); }
                            userOrders = state.orders.filter(o => 
                                String(o.user_id) === String(user.id) || 
                                (o.customer_email && o.customer_email.toLowerCase() === user.email.toLowerCase()) ||
                                (o.customer_inn && user.inn && o.customer_inn === user.inn)
                            );
                            renderModalContent();
                        };
                    }

                    const sendMsg = async () => {
                        const text = chatInput ? chatInput.value.trim() : '';
                        if (!text) return;
                        chatMsgs.push({ sender: 'admin', text, timestamp: new Date().toISOString() });
                        if (chatInput) chatInput.value = '';
                        if (chatBox) {
                            chatBox.innerHTML = rChatMsgs();
                            chatBox.scrollTop = chatBox.scrollHeight;
                        }
                        try {
                            await state.authenticatedFetch(`/api/admin/orders/${selectedOrderId}`, {
                                method: 'PUT',
                                body: JSON.stringify({ messages: chatMsgs })
                            });
                            selectedOrder.messages = chatMsgs;
                        } catch(err) {
                            alert(err.message);
                            chatMsgs.pop();
                            if (chatBox) chatBox.innerHTML = rChatMsgs();
                        }
                    };

                    if (sendBtn) sendBtn.onclick = sendMsg;
                    if (chatInput) chatInput.onkeydown = (e) => { if (e.key === 'Enter') sendMsg(); };
                }, 0);
            }
        } else if (activeTab === 'leads') {
            if (userLeads.length === 0) {
                tabContent = `
                    <div class="flex flex-col items-center justify-center py-16 text-[#d7c1c7] opacity-40 animate-in fade-in duration-300">
                        <span class="material-symbols-outlined text-6xl mb-4">forum</span>
                        <div class="font-['Space Grotesk'] uppercase tracking-widest text-sm">У пользователя нет обращений</div>
                    </div>
                `;
            } else {
                tabContent = `
                    <div class="space-y-4 animate-in fade-in duration-300">
                        ${userLeads.map(lead => `
                            <div class="glass p-6 rounded-3xl border-white/5 space-y-3 bg-[#151311]">
                                <div class="flex items-center justify-between border-b border-white/5 pb-3">
                                    <div class="flex items-center gap-2">
                                        <span class="material-symbols-outlined text-[#ffb0cc] text-lg">mark_email_unread</span>
                                        <span class="font-bold text-xs uppercase tracking-widest text-[#e7e2dd] font-['Space Grotesk']">${lead.type === 'callback' ? 'Обратный звонок' : lead.type}</span>
                                    </div>
                                    <span class="text-[10px] font-mono text-[#d7c1c7] opacity-40">${new Date(lead.created_at).toLocaleString()}</span>
                                </div>
                                <div class="text-xs text-[#d7c1c7] leading-relaxed bg-white/5 p-4 rounded-2xl border border-white/5">
                                    ${lead.message || 'Без сообщения'}
                                </div>
                                <div class="flex justify-between items-center pt-1 text-[10px]">
                                    <span class="text-[#d7c1c7] opacity-50">Телефон: ${lead.phone || '—'}</span>
                                    <span class="px-3 py-1 rounded-full uppercase tracking-widest font-bold ${lead.status === 'completed' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}">
                                        ${lead.status === 'completed' ? 'Обработано' : 'Новое'}
                                    </span>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `;
            }
        }

        modalWrapper.innerHTML = `
            <!-- Backdrop -->
            <div id="user-modal-backdrop" class="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"></div>
            
            <!-- Modal Container -->
            <div id="user-modal-container" class="relative w-full max-w-4xl max-h-[90vh] bg-[#1d1b19] border border-[#534347]/30 rounded-[2.5rem] shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 min-h-0 overflow-hidden">
                <!-- Header -->
                <div class="p-6 lg:p-8 border-b border-[#534347]/20 flex items-center justify-between shrink-0 bg-[#151311]">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#ffb0cc] to-[#ffb0cc]/50 flex items-center justify-center text-[#0f0e0c] font-bold text-2xl shadow-lg shadow-[#ffb0cc]/20 shrink-0 font-['Space Grotesk']">
                            ${getInitials(user.name || user.email)}
                        </div>
                        <div class="min-w-0">
                            <div class="flex items-center gap-3">
                                <h3 class="font-['Space Grotesk'] text-xl font-bold uppercase tracking-tight text-[#e7e2dd] truncate">
                                    ${user.name || 'Без имени'}
                                </h3>
                                <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shrink-0 ${user.role === 'admin' ? 'bg-[#ffb0cc] text-[#0f0e0c]' : 'bg-white/10 text-[#d7c1c7]'}">
                                    ${user.role === 'admin' ? 'ADMIN' : 'USER'}
                                </span>
                            </div>
                            <div class="text-xs text-[#d7c1c7] opacity-60 font-mono mt-1 truncate">
                                ${user.company_name ? `${user.company_name} • ` : ''}${user.email}
                            </div>
                        </div>
                    </div>
                    <button id="close-user-modal" class="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#d7c1c7] hover:text-[#ffb0cc] transition-all border border-white/5 hover:border-white/10 shrink-0">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <!-- Tabs Navigation -->
                <div class="flex gap-2 px-6 lg:px-8 pt-6 bg-[#1d1b19] shrink-0 border-b border-[#534347]/10 overflow-x-auto custom-scrollbar">
                    <button type="button" class="user-modal-tab pb-4 px-4 text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all relative shrink-0 ${activeTab === 'info' ? 'text-[#ffb0cc] border-b-2 border-[#ffb0cc]' : 'text-[#d7c1c7] opacity-60 hover:opacity-100'}" data-tab="info">
                        Общая информация
                    </button>
                    <button type="button" class="user-modal-tab pb-4 px-4 text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all relative flex items-center gap-2 shrink-0 ${activeTab === 'orders' ? 'text-[#ffb0cc] border-b-2 border-[#ffb0cc]' : 'text-[#d7c1c7] opacity-60 hover:opacity-100'}" data-tab="orders">
                        История заказов
                        <span class="px-2 py-0.5 rounded-full text-[9px] bg-white/10 text-white font-mono">${userOrders.length}</span>
                    </button>
                    <button type="button" class="user-modal-tab pb-4 px-4 text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all relative flex items-center gap-2 shrink-0 ${activeTab === 'chat' ? 'text-[#ffb0cc] border-b-2 border-[#ffb0cc]' : 'text-[#d7c1c7] opacity-60 hover:opacity-100'}" data-tab="chat">
                        СМС-Чат
                        ${totalMsgCount > 0 ? `<span class="px-2 py-0.5 rounded-full text-[9px] bg-[#ffb0cc]/20 text-[#ffb0cc] font-mono">${totalMsgCount}</span>` : ''}
                    </button>
                    <button type="button" class="user-modal-tab pb-4 px-4 text-xs uppercase font-bold tracking-widest font-['Space Grotesk'] transition-all relative flex items-center gap-2 shrink-0 ${activeTab === 'leads' ? 'text-[#ffb0cc] border-b-2 border-[#ffb0cc]' : 'text-[#d7c1c7] opacity-60 hover:opacity-100'}" data-tab="leads">
                        Обращения
                        <span class="px-2 py-0.5 rounded-full text-[9px] bg-white/10 text-white font-mono">${userLeads.length}</span>
                    </button>
                </div>
                
                <!-- Content Area -->
                <div class="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 min-h-[350px]">
                    ${tabContent}
                </div>

                <!-- Footer -->
                <div class="p-6 lg:p-8 border-t border-[#534347]/20 flex items-center justify-between bg-[#151311] shrink-0 rounded-b-[2.5rem]">
                    <div class="text-[10px] text-[#d7c1c7] opacity-40 font-mono uppercase tracking-wider">
                        Профиль создан: ${new Date(user.created_at).toLocaleDateString()}
                    </div>
                    <div class="flex gap-4">
                        <a href="mailto:${user.email}" class="px-6 py-3 rounded-xl border border-[#ffb0cc]/30 text-[#ffb0cc] hover:bg-[#ffb0cc]/10 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <span class="material-symbols-outlined text-sm">mail</span>
                            Написать
                        </a>
                        <button type="button" id="close-user-footer" class="px-6 py-3 rounded-xl bg-[#ffb0cc] text-[#0f0e0c] hover:bg-white transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-[#ffb0cc]/10">
                            Закрыть
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Bind events
        const close = () => {
            if (activeUserChatChannel && usersSupabaseRT) {
                usersSupabaseRT.removeChannel(activeUserChatChannel);
                activeUserChatChannel = null;
            }
            modalWrapper.classList.add('opacity-0');
            const container = modalWrapper.querySelector('#user-modal-container');
            if (container) container.classList.add('scale-95');
            setTimeout(() => modalWrapper.remove(), 300);
        };

        modalWrapper.querySelector('#close-user-modal').onclick = close;
        modalWrapper.querySelector('#close-user-footer').onclick = close;
        modalWrapper.querySelector('#user-modal-backdrop').onclick = close;

        modalWrapper.querySelectorAll('.user-modal-tab').forEach(btn => {
            btn.onclick = async () => {
                activeTab = btn.dataset.tab;
                if (activeTab === 'chat' || activeTab === 'orders' || activeTab === 'leads') {
                    try { await state.fetchOrders(); } catch(e) { console.error(e); }
                    try { await state.fetchLeads(); } catch(e) { console.error(e); }
                    userOrders = state.orders.filter(o => 
                        String(o.user_id) === String(user.id) || 
                        (o.customer_email && o.customer_email.toLowerCase() === user.email.toLowerCase()) ||
                        (o.customer_inn && user.inn && o.customer_inn === user.inn)
                    );
                    userLeads = state.leads.filter(l => 
                        (l.email && l.email.toLowerCase() === user.email.toLowerCase()) ||
                        (l.phone && user.phone && l.phone === user.phone)
                    );
                }
                renderModalContent();
            };
        });

        // Bind order card clicks
        modalWrapper.querySelectorAll('.user-order-card').forEach(card => {
            card.onclick = async () => {
                try { await state.fetchOrders(); } catch(e) { console.error(e); }
                const order = state.orders.find(o => String(o.id) === String(card.dataset.orderId));
                if (order) openOrderFromUserModal(order, state);
            };
        });
    };

    renderModalContent();

    requestAnimationFrame(() => {
        modalWrapper.classList.remove('opacity-0');
        const container = modalWrapper.querySelector('#user-modal-container');
        if (container) container.classList.remove('scale-95');
    });
}

async function openOrderFromUserModal(order, state) {
    const existing = document.getElementById('stacked-order-modal');
    if (existing) existing.remove();

    let messages = [];
    try {
        if (typeof order.messages === 'string') messages = JSON.parse(order.messages);
        else if (Array.isArray(order.messages)) messages = order.messages;
    } catch(e) {}

    const popup = document.createElement('div');
    popup.id = 'stacked-order-modal';
    popup.className = 'fixed inset-0 z-[70] flex items-center justify-center p-4 opacity-0 transition-opacity duration-300';
    document.body.appendChild(popup);

    const rMsg = () => messages.map(m => {
        const isAdmin = m.sender === 'admin';
        const timeStr = new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        const dateStr = new Date(m.timestamp).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: '2-digit' });

        if (isAdmin) {
            return `
                <div class="flex flex-col items-end mb-4 animate-in fade-in duration-300">
                    <div class="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                        <div class="px-5 py-3 rounded-3xl text-sm bg-[#ffb0cc] text-[#0f0e0c] rounded-br-none shadow-md font-medium leading-relaxed">
                            ${m.text}
                        </div>
                    </div>
                    <div class="text-[10px] text-[#d7c1c7] opacity-50 font-mono mt-1.5 flex items-center gap-1 mr-1">
                        <span class="material-symbols-outlined text-[12px] text-[#ffb0cc]">done_all</span>
                        Вы (Менеджер) • ${dateStr} ${timeStr}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="flex flex-col items-start mb-4 animate-in fade-in duration-300">
                    <div class="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                        <div class="px-5 py-3 rounded-3xl text-sm bg-[#2a2624] border border-[#ffb0cc]/40 text-[#e7e2dd] rounded-bl-none shadow-xl leading-relaxed">
                            ${m.text}
                        </div>
                    </div>
                    <div class="text-[10px] text-[#ffb0cc] font-mono mt-1.5 flex items-center gap-1 ml-1 font-bold">
                        <span class="material-symbols-outlined text-[12px]">person</span>
                        Клиент • ${dateStr} ${timeStr}
                    </div>
                </div>
            `;
        }
    }).join('');

    const items = order.order_items || [];
    const sNames = { new:'Новый', processing:'В обработке', completed:'Завершен', cancelled:'Отменен' };
    const sCols  = { new:'text-blue-400', processing:'text-yellow-400', completed:'text-green-400', cancelled:'text-red-400' };

    popup.innerHTML = `
        <div class="absolute inset-0 bg-black/60 backdrop-blur-sm" id="sod-backdrop"></div>
        <div class="relative w-full max-w-2xl max-h-[85vh] bg-[#1d1b19] border border-[#534347]/40 rounded-3xl shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 min-h-0" id="sod-panel">
            <div class="p-5 border-b border-[#534347]/20 flex items-center justify-between shrink-0 bg-[#151311] rounded-t-3xl">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-[#ffb0cc]/10 flex items-center justify-center"><span class="material-symbols-outlined text-[#ffb0cc] text-base">receipt_long</span></div>
                    <div>
                        <div class="font-['Space Grotesk'] text-sm font-bold uppercase">Заказ #${order.id}</div>
                        <div class="text-[10px] opacity-50">${new Date(order.created_at).toLocaleDateString()} • <span class="${sCols[order.status] || ''}">${sNames[order.status] || order.status}</span></div>
                    </div>
                </div>
                <button id="sod-close" class="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#d7c1c7] hover:text-white transition-colors"><span class="material-symbols-outlined text-sm">close</span></button>
            </div>
            <div class="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5 min-h-0">
                ${items.length ? `
                <div class="space-y-2">
                    <div class="text-[10px] uppercase tracking-widest text-[#ffb0cc] font-bold">Состав заказа</div>
                    <div class="flex flex-wrap gap-2">${items.map(i => `<div class="flex gap-2 px-3 py-2 bg-white/5 border border-white/5 rounded-xl text-xs"><span>${i.product_name}</span><span class="text-[#ffb0cc] font-bold">× ${i.quantity} т.</span></div>`).join('')}</div>
                    <div class="text-right text-sm font-bold text-[#ffb0cc]">${Number(order.total).toLocaleString()} ₽</div>
                </div>` : ''}
                <div class="space-y-2">
                    <div class="text-[10px] uppercase tracking-widest text-[#ffb0cc] font-bold">Счёт / КП</div>
                    <div class="flex gap-2">
                        <input id="sod-invoice" type="text" value="${order.invoice_url || ''}" placeholder="Ссылка на счёт..." class="flex-1 bg-[#151311] border border-[#534347]/30 rounded-xl px-4 py-2.5 text-xs focus:border-[#ffb0cc] outline-none transition-all">
                        <button id="sod-save-invoice" class="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-[#ffb0cc] text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all shrink-0">Прикрепить</button>
                    </div>
                    ${order.invoice_url ? `<a href="${order.invoice_url}" target="_blank" class="flex items-center gap-1 text-[10px] text-green-400 hover:text-white transition-colors"><span class="material-symbols-outlined text-xs">open_in_new</span>Открыть документ</a>` : ''}
                </div>
                <div class="space-y-4">
                    <div class="flex items-center justify-between bg-white/5 px-5 py-3 border border-white/5 rounded-2xl">
                        <div class="flex items-center gap-3">
                            <div class="w-7 h-7 rounded-full bg-[#ffb0cc]/20 flex items-center justify-center text-[#ffb0cc] border border-[#ffb0cc]/30">
                                <span class="material-symbols-outlined text-sm">forum</span>
                            </div>
                            <div>
                                <span class="text-xs font-bold text-[#e7e2dd] uppercase tracking-widest font-['Space Grotesk'] block">Переписка с клиентом</span>
                                <span class="text-[9px] text-[#d7c1c7] opacity-60 block">Синхронизация Supabase Realtime</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="text-[9px] text-[#ffb0cc] bg-[#ffb0cc]/10 border border-[#ffb0cc]/20 px-2 py-0.5 rounded-full uppercase tracking-widest font-bold">Telegram style</span>
                            <span class="flex items-center gap-1 text-[9px] text-green-400 font-bold opacity-70"><span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>live</span>
                        </div>
                    </div>
                    <div class="bg-black/40 rounded-3xl border border-white/10 flex flex-col h-[280px] shadow-2xl overflow-hidden">
                        <div id="sod-chat" class="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">${messages.length ? rMsg() : '<div class="flex flex-col items-center justify-center h-full text-[#d7c1c7] opacity-40 text-center p-6"><span class="material-symbols-outlined text-4xl mb-3 opacity-50">forum</span><span class="text-xs uppercase tracking-widest font-bold font-[\'Space Grotesk\'] text-[#e7e2dd]">Нет сообщений</span></div>'}</div>
                        <div class="p-4 border-t border-white/10 flex gap-3 shrink-0 bg-white/5 items-center">
                            <input id="sod-input" type="text" placeholder="Написать клиенту..." class="flex-1 bg-black/50 border border-white/10 rounded-2xl px-5 py-2.5 text-xs focus:border-[#ffb0cc] outline-none transition-all text-[#e7e2dd] placeholder:opacity-40 shadow-inner">
                            <button id="sod-send" class="w-10 h-10 rounded-2xl bg-[#ffb0cc] text-[#0f0e0c] hover:brightness-110 flex items-center justify-center transition-all shrink-0 shadow-lg shadow-[#ffb0cc]/20"><span class="material-symbols-outlined text-sm">send</span></button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t border-[#534347]/20 flex items-center justify-between bg-[#151311] rounded-b-3xl shrink-0">
                <div class="flex items-center gap-2">
                    <span class="text-[10px] text-[#d7c1c7] opacity-40 uppercase tracking-widest">Статус:</span>
                    ${(() => {
                        let currentStatus = (order.status || 'new').toLowerCase().trim();
                        if (currentStatus === 'pending' || currentStatus === 'новый') currentStatus = 'new';
                        const statusObj = window.ORDER_STATUS_OPTIONS.find(o => o.value === currentStatus) || { label: currentStatus, color: '#3b82f6', icon: 'donut_large' };
                        return `<button type="button" id="sod-status-btn" data-status="${currentStatus}" class="flex items-center justify-between gap-2 bg-[#1d1b19] border border-[#534347]/30 hover:border-[#ffb0cc]/40 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all shadow-md group/btn w-[150px] shrink-0" style="border-left: 4px solid ${statusObj.color};">
                            <span class="flex items-center gap-1.5 truncate" style="color: ${statusObj.color};">
                                <span class="material-symbols-outlined text-sm shrink-0">${statusObj.icon}</span>
                                <span class="truncate">${statusObj.label}</span>
                            </span>
                            <span class="material-symbols-outlined text-xs text-[#d7c1c7] opacity-40 group-hover/btn:opacity-100 transition-opacity shrink-0 ml-1">expand_more</span>
                        </button>`;
                    })()}
                </div>
                <div class="text-sm font-bold text-[#ffb0cc] font-['Space Grotesk']">${Number(order.total).toLocaleString()} ₽</div>
            </div>
        </div>`;

    requestAnimationFrame(() => {
        popup.classList.remove('opacity-0');
        popup.querySelector('#sod-panel').classList.remove('scale-95');
    });

    const chat = popup.querySelector('#sod-chat');
    chat.scrollTop = chat.scrollHeight;

    if (usersSupabaseRT) {
        if (activeStackedChatChannel) {
            usersSupabaseRT.removeChannel(activeStackedChatChannel);
            activeStackedChatChannel = null;
        }
        activeStackedChatChannel = usersSupabaseRT
            .channel(`stacked-chat-${order.id}`)
            .on('postgres_changes', {
                event: 'UPDATE',
                schema: 'public',
                table: 'orders',
                filter: `id=eq.${order.id}`
            }, (payload) => {
                const newMsgs = payload.new.messages;
                if (!newMsgs) return;
                let updated = [];
                try { updated = typeof newMsgs === 'string' ? JSON.parse(newMsgs) : newMsgs; } catch(e) { return; }
                if (updated.length > messages.length) {
                    messages = updated;
                    order.messages = messages;
                    if (chat) {
                        chat.innerHTML = rMsg();
                        chat.scrollTop = chat.scrollHeight;
                        chat.style.transition = 'background 0.3s';
                        chat.style.background = 'rgba(255,176,204,0.05)';
                        setTimeout(() => { chat.style.background = ''; }, 600);
                    }
                }
            })
            .subscribe();
    }

    const closePopup = () => {
        if (activeStackedChatChannel && usersSupabaseRT) {
            usersSupabaseRT.removeChannel(activeStackedChatChannel);
            activeStackedChatChannel = null;
        }
        popup.classList.add('opacity-0');
        popup.querySelector('#sod-panel').classList.add('scale-95');
        setTimeout(() => popup.remove(), 300);
    };
    popup.querySelector('#sod-close').onclick = closePopup;
    popup.querySelector('#sod-backdrop').onclick = closePopup;

    popup.querySelector('#sod-save-invoice').onclick = async () => {
        const btn = popup.querySelector('#sod-save-invoice');
        const url = popup.querySelector('#sod-invoice').value;
        btn.textContent = '...';
        try {
            await state.authenticatedFetch(`/api/admin/orders/${order.id}`, { method:'PUT', body: JSON.stringify({ invoice_url: url }) });
            order.invoice_url = url;
            btn.textContent = '✓ Готово';
            setTimeout(() => { btn.textContent = 'Прикрепить'; }, 2500);
            window.showToast('Счет/КП успешно прикреплен к заказу', 'success', 'Документы');
        } catch(e) { alert(e.message); btn.textContent = 'Прикрепить'; }
    };

    const sendMsg = async () => {
        const input = popup.querySelector('#sod-input');
        const text = input.value.trim();
        if (!text) return;
        messages.push({ sender:'admin', text, timestamp: new Date().toISOString() });
        input.value = '';
        chat.innerHTML = rMsg();
        chat.scrollTop = chat.scrollHeight;
        try {
            await state.authenticatedFetch(`/api/admin/orders/${order.id}`, { method:'PUT', body: JSON.stringify({ messages }) });
            order.messages = messages;
            window.showToast('Сообщение отправлено клиенту', 'info', 'Чат');
        } catch(e) { alert(e.message); messages.pop(); chat.innerHTML = rMsg(); }
    };
    popup.querySelector('#sod-send').onclick = sendMsg;
    popup.querySelector('#sod-input').onkeydown = e => { if (e.key === 'Enter') sendMsg(); };

    popup.querySelector('#sod-status-btn').onclick = async e => {
        const currentStatus = popup.querySelector('#sod-status-btn').dataset.status;
        const newStatus = await window.openStatusSelectModal(window.ORDER_STATUS_OPTIONS, currentStatus, `Изменение статуса заказа #${order.id}`);
        if (!newStatus || newStatus === currentStatus) return;
        try {
            await state.authenticatedFetch(`/api/admin/orders/${order.id}`, { method:'PUT', body: JSON.stringify({ status: newStatus }) });
            order.status = newStatus;
            popup.querySelector('#sod-status-btn').dataset.status = newStatus;
            const statusObj = window.ORDER_STATUS_OPTIONS.find(o => o.value === newStatus) || { label: newStatus, color: '#3b82f6', icon: 'donut_large' };
            popup.querySelector('#sod-status-btn').style.borderLeftColor = statusObj.color;
            popup.querySelector('#sod-status-btn').innerHTML = `
                <span class="flex items-center gap-1.5 truncate" style="color: ${statusObj.color};">
                    <span class="material-symbols-outlined text-sm shrink-0">${statusObj.icon}</span>
                    <span class="truncate">${statusObj.label}</span>
                </span>
                <span class="material-symbols-outlined text-xs text-[#d7c1c7] opacity-40 group-hover/btn:opacity-100 transition-opacity shrink-0 ml-1">expand_more</span>
            `;
            window.showToast(`Статус заказа #${order.id} изменен на "${newStatus}"`, 'success', 'Обновление статуса');
        } catch(err) { alert(err.message); }
    };
}
