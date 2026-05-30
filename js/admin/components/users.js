// ── Supabase Realtime for user modal chat ─────────────────────────────────
const SUPABASE_URL = 'https://drbknuvnsyonmeudoleo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYmtudXZuc3lvbm1ldWRvbGVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTA4MTYsImV4cCI6MjA5NDE4NjgxNn0.gEBVSWAOGZGB7IIVsVIs3MSO2UjZlG6UzTdOEK0grOc';
let usersSupabaseRT = null;
let activeUserChatChannel = null;
let activeStackedChatChannel = null;

// ── Bulk selection ─────────────────────────────────────────────────────────
const selectedUserIds = new Set();

function updateBulkUsersToolbar(state) {
    let toolbar = document.getElementById('users-bulk-toolbar');
    if (selectedUserIds.size === 0) {
        if (toolbar) toolbar.remove();
        return;
    }

    if (!toolbar) {
        toolbar = document.createElement('div');
        toolbar.id = 'users-bulk-toolbar';
        document.body.appendChild(toolbar);
    }

    toolbar.innerHTML = `
        <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-surface-container-low/90 backdrop-blur-md border border-primary/20 px-6 py-4 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-6 animate-in slide-in-from-bottom-8 duration-500">
            <div class="flex items-center gap-3 pr-6 border-r border-outline/10">
                <div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-xs">
                    ${selectedUserIds.size}
                </div>
                <div class="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant font-label-caps">Выбрано</div>
            </div>

            <div class="flex items-center gap-4">
                <button type="button" id="bulk-user-role-btn" class="flex items-center gap-2 bg-surface-container border border-primary/20 hover:border-primary/40 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest text-primary outline-none cursor-pointer hover:bg-on-surface/5 transition-all shadow-md font-label-caps">
                    <span class="material-symbols-outlined text-primary text-sm">manage_accounts</span>
                    <span>Изменить роль...</span>
                    <span class="material-symbols-outlined text-sm opacity-50 ml-1">expand_more</span>
                </button>

                <button type="button" id="bulk-user-delete-btn" class="flex items-center gap-2 px-4 py-2 hover:bg-error/10 border border-error/20 rounded-xl transition-all text-xs font-bold uppercase tracking-widest text-error font-label-caps">
                    <span class="material-symbols-outlined text-base">delete</span>
                    Удалить
                </button>
            </div>

            <button id="bulk-user-close-btn" class="ml-4 p-2 hover:bg-on-surface/5 rounded-full transition-all text-on-surface-variant" title="Снять выделение">
                <span class="material-symbols-outlined text-base">close</span>
            </button>
        </div>
    `;

    const roleBtn = toolbar.querySelector('#bulk-user-role-btn');
    roleBtn.onclick = async () => {
        const newRole = await window.openStatusSelectModal(window.USER_ROLE_OPTIONS, null, 'Изменить роль выбранных пользователей');
        if (!newRole) return;
        const ids = Array.from(selectedUserIds);
        try {
            await Promise.all(ids.map(id =>
                state.authenticatedFetch(`/api/admin/users/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ role: newRole })
                })
            ));
            selectedUserIds.clear();
            updateBulkUsersToolbar(state);
            await state.fetchUsers();
            window.showToast(`Роль ${ids.length} пользователей изменена на ${newRole.toUpperCase()}`, 'success', 'Массовое изменение роли');
        } catch (err) {
            alert('Ошибка при массовом обновлении: ' + err.message);
        }
    };

    const deleteBtn = toolbar.querySelector('#bulk-user-delete-btn');
    deleteBtn.onclick = async () => {
        if (await confirm(`Вы уверены, что хотите удалить выбранных пользователей (${selectedUserIds.size})? Это действие необратимо.`)) {
            const ids = Array.from(selectedUserIds);
            try {
                await Promise.all(ids.map(id =>
                    state.authenticatedFetch(`/api/admin/users/${id}`, {
                        method: 'DELETE'
                    })
                ));
                selectedUserIds.clear();
                updateBulkUsersToolbar(state);
                await state.fetchUsers();
                window.showToast(`Успешно удалено пользователей: ${ids.length}`, 'success', 'Массовое удаление');
            } catch (err) {
                alert('Ошибка при массовом удалении: ' + err.message);
            }
        }
    };

    const closeBtn = toolbar.querySelector('#bulk-user-close-btn');
    closeBtn.onclick = () => {
        selectedUserIds.clear();
        updateBulkUsersToolbar(state);
        document.querySelectorAll('.user-select-cell').forEach(cell => {
            const block = cell.querySelector('.user-select-block');
            if (block) block.className = 'user-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto border-outline/20 bg-surface-container-lowest text-transparent';
        });
        const selectAll = document.getElementById('users-select-all');
        if (selectAll) selectAll.className = 'w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto border-outline/20 bg-surface-container-lowest text-transparent';
    };
}

try {
    const sb = window.supabase;
    if (sb && sb.createClient) {
        if (!window.supabaseClientGlobal) {
            window.supabaseClientGlobal = sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
        usersSupabaseRT = window.supabaseClientGlobal;
    }
} catch (e) { console.warn('Supabase client init failed in users.js:', e); }

/**
 * Renders the users table
 * @param {HTMLElement} container 
 * @param {Object} state 
 */
export async function renderUsersView(container, state) {
    if (!container) return;

    // Clean up any existing bulk toolbar
    const oldToolbar = document.getElementById('users-bulk-toolbar');
    if (oldToolbar) oldToolbar.remove();
    selectedUserIds.clear();

    container.innerHTML = `
        <div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-2xl font-bold font-headline-md tracking-tight text-on-surface">Клиентская база</h3>
                    <p class="text-sm text-on-surface-variant mt-1">Управление профилями и ролями пользователей</p>
                </div>
                <button type="button" id="refresh-users-btn" class="flex items-center justify-center gap-2 px-4 py-4 bg-surface-container text-primary rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary/10 transition-all border border-outline/5 shadow-lg font-label-caps">
                    <span class="material-symbols-outlined text-sm">refresh</span>
                </button>
            </div>

            <div class="liquid-glass rounded-3xl overflow-hidden min-h-[400px]" id="users-table-container">
                <div class="flex items-center justify-center h-[400px]">
                    <div class="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                </div>
            </div>
        </div>
    `;

    const tableContainer = document.getElementById('users-table-container');

    const loadUsers = async () => {
        tableContainer.innerHTML = `
            <div class="flex items-center justify-center h-[400px]">
                <div class="w-8 h-8 border-2 border-[#ca7093]/20 border-t-[#ca7093] rounded-full animate-spin"></div>
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
            <div class="flex flex-col items-center justify-center h-[400px] text-on-surface-variant opacity-75">
                <span class="material-symbols-outlined text-6xl mb-4">group_off</span>
                <div class="font-label-caps uppercase tracking-widest text-on-surface">Клиентов пока нет</div>
            </div>
        `;
        return;
    }

    const { sortKey, sortOrder, onSort } = sortOptions;
    const allChecked = users.length > 0 && users.every(u => selectedUserIds.has(String(u.id)));

    const getSortIcon = (key) => {
        if (sortKey !== key) return '<span class="material-symbols-outlined text-[10px] opacity-20 ml-1">sort</span>';
        return sortOrder === 'asc'
            ? '<span class="material-symbols-outlined text-[10px] text-white ml-1">expand_less</span>'
            : '<span class="material-symbols-outlined text-[10px] text-white ml-1">expand_more</span>';
    };

    container.innerHTML = `
        <div class="hidden md:block overflow-x-auto custom-scrollbar">
            <table class="w-full text-left border-collapse min-w-[600px]">
                <thead>
                    <tr class="border-b border-outline/10 text-[10px] uppercase tracking-widest text-primary font-label-caps bg-surface-container-low/30">
                        <th class="py-4 px-4 w-12 text-center">
                            <div id="users-select-all" class="w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto ${allChecked ? 'bg-primary/20 border-primary/50 text-primary' : 'border-outline/20 bg-surface-container-lowest text-transparent'}">
                                <span class="material-symbols-outlined text-[14px] font-bold">done_all</span>
                            </div>
                        </th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-on-surface transition-colors" data-sort="name">Пользователь ${getSortIcon('name')}</th>
                        <th class="py-4 px-6 font-bold cursor-pointer hover:text-on-surface transition-colors" data-sort="role">Роль ${getSortIcon('role')}</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-outline/5">
                    ${users.map(user => {
                        const isSelected = selectedUserIds.has(String(user.id));
                        return `
                        <tr class="group hover:bg-on-surface/[0.02] transition-colors cursor-pointer user-row" data-id="${user.id}">
                            <td class="py-4 px-4 w-12 text-center user-select-cell" data-id="${user.id}">
                                <div class="user-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto ${isSelected ? 'bg-primary/20 border-primary/50 text-primary' : 'border-outline/20 bg-surface-container-lowest text-transparent'}">
                                    <span class="material-symbols-outlined text-[14px] font-bold">check</span>
                                </div>
                            </td>
                            <td class="py-5 px-6">
                                <div class="font-bold text-base uppercase text-on-surface group-hover:text-primary transition-colors tracking-tight">${user.name || 'Без имени'}</div>
                                <div class="text-sm text-primary font-mono font-medium mt-1 flex items-center gap-1.5 select-all">
                                    <span class="material-symbols-outlined text-sm">mail</span>
                                    ${user.email}
                                </div>
                                <div class="text-sm text-on-surface-variant font-mono mt-0.5 flex items-center gap-1.5 select-all">
                                    <span class="material-symbols-outlined text-sm">call</span>
                                    ${user.phone || 'Телефон не указан'}
                                </div>
                            </td>
                            <td class="py-4 px-6" onclick="event.stopPropagation()">
                                <div class="flex items-center gap-2">
                                    ${(() => {
                                        const roleObj = window.USER_ROLE_OPTIONS.find(r => r.value === user.role) || { label: user.role || 'USER', color: 'var(--color-primary)', icon: 'person' };
                                        return `<button type="button" data-id="${user.id}" data-role="${user.role}" class="role-modal-btn flex items-center justify-between gap-2 bg-surface-container-lowest border border-outline/10 hover:border-outline/20 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all shadow-md group/btn w-[150px] shrink-0 font-label-caps" style="border-left: 4px solid ${roleObj.color};">
                                            <span class="flex items-center gap-1.5 truncate" style="color: ${roleObj.color};">
                                                <span class="material-symbols-outlined text-sm shrink-0">${roleObj.icon}</span>
                                                <span class="truncate">${roleObj.label}</span>
                                            </span>
                                            <span class="material-symbols-outlined text-xs text-on-surface-variant opacity-40 group-hover/btn:opacity-100 transition-opacity shrink-0 ml-1">expand_more</span>
                                        </button>`;
                                    })()}
                                    <button type="button" data-id="${user.id}" class="delete-user-btn p-2 rounded-xl text-error hover:text-white hover:bg-error hover:scale-110 active:scale-90 transition-all duration-300 opacity-0 group-hover:opacity-100 group/btn flex items-center justify-center hover:shadow-md hover:shadow-error/10" title="Удалить пользователя">
                                        <span class="material-symbols-outlined text-base transition-transform duration-300 group-hover/btn:-rotate-12">delete</span>
                                    </button>
                                </div>
                            </td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
        </div>
        <div class="grid grid-cols-1 gap-4 md:hidden p-4">
            ${users.map(user => {
                const isSelected = selectedUserIds.has(String(user.id));
                const roleObj = window.USER_ROLE_OPTIONS.find(r => r.value === user.role) || { label: user.role || 'USER', color: 'var(--color-primary)', icon: 'person' };
                return `
                <div class="user-row bg-surface-container rounded-2xl p-4 border border-outline/5 shadow-md cursor-pointer flex flex-col gap-3" data-id="${user.id}">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-3">
                            <div class="user-select-cell p-1 cursor-pointer" data-id="${user.id}">
                                <div class="user-select-block w-5 h-5 rounded border flex items-center justify-center transition-all ${isSelected ? 'bg-primary/20 border-primary/50 text-primary' : 'border-outline/20 bg-surface-container-lowest text-transparent'}">
                                    <span class="material-symbols-outlined text-[14px] font-bold">check</span>
                                </div>
                            </div>
                            <div>
                                <div class="font-bold text-base uppercase text-on-surface tracking-tight">${user.name || 'Без имени'}</div>
                                <div class="text-xs text-primary font-mono font-medium mt-0.5 select-all">${user.email}</div>
                            </div>
                        </div>
                        <button type="button" data-id="${user.id}" class="delete-user-btn p-2 rounded-xl text-error hover:text-white hover:bg-error transition-all duration-300 flex items-center justify-center" title="Удалить пользователя">
                            <span class="material-symbols-outlined text-base">delete</span>
                        </button>
                    </div>
                    
                    <div class="flex justify-between items-center border-t border-outline/5 pt-2">
                        <div class="text-xs text-on-surface-variant font-mono flex items-center gap-1 select-all">
                            <span class="material-symbols-outlined text-sm">call</span>
                            ${user.phone || 'Телефон не указан'}
                        </div>
                        <div onclick="event.stopPropagation()">
                            <button type="button" data-id="${user.id}" data-role="${user.role}" class="role-modal-btn flex items-center justify-between gap-1.5 bg-surface-container-lowest border border-outline/10 hover:border-outline/20 rounded-xl px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider transition-all shadow-md font-label-caps" style="border-left: 3px solid ${roleObj.color};">
                                <span class="flex items-center gap-1 truncate" style="color: ${roleObj.color};">
                                    <span class="material-symbols-outlined text-xs shrink-0">${roleObj.icon}</span>
                                    <span class="truncate">${roleObj.label}</span>
                                </span>
                                <span class="material-symbols-outlined text-[10px] text-on-surface-variant opacity-45 shrink-0">expand_more</span>
                            </button>
                        </div>
                    </div>
                </div>`;
            }).join('')}
        </div>
    `;

    // ── Select cell click ────────────────────────────────────────────────────
    container.querySelectorAll('.user-select-cell').forEach(cell => {
        cell.addEventListener('click', (e) => {
            e.stopPropagation();
            const id = String(cell.dataset.id);
            const block = cell.querySelector('.user-select-block');
            const isChecked = !selectedUserIds.has(id);

            if (isChecked) {
                selectedUserIds.add(id);
                block.className = 'user-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto bg-primary/20 border-primary/50 text-primary';
            } else {
                selectedUserIds.delete(id);
                block.className = 'user-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto border-outline/20 bg-surface-container-lowest text-transparent';
            }

            updateBulkUsersToolbar(state);

            const selectAll = container.querySelector('#users-select-all');
            if (selectAll) {
                const allCells = container.querySelectorAll('.user-select-cell');
                const allNowChecked = Array.from(allCells).every(c => selectedUserIds.has(String(c.dataset.id)));
                selectAll.className = `w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto ${allNowChecked ? 'bg-primary/20 border-primary/50 text-primary' : 'border-outline/20 bg-surface-container-lowest text-transparent'}`;
            }
        });
    });

    // ── Select all ──────────────────────────────────────────────────────────
    const selectAll = container.querySelector('#users-select-all');
    if (selectAll) {
        selectAll.onclick = (e) => {
            e.stopPropagation();
            const allCells = container.querySelectorAll('.user-select-cell');
            const currentlyAllChecked = Array.from(allCells).every(c => selectedUserIds.has(String(c.dataset.id)));
            const willBeChecked = !currentlyAllChecked;

            allCells.forEach(cell => {
                const id = String(cell.dataset.id);
                const block = cell.querySelector('.user-select-block');
                if (willBeChecked) {
                    selectedUserIds.add(id);
                    if (block) block.className = 'user-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto bg-primary/20 border-primary/50 text-primary';
                } else {
                    selectedUserIds.delete(id);
                    if (block) block.className = 'user-select-block w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto border-outline/20 bg-surface-container-lowest text-transparent';
                }
            });

            selectAll.className = `w-5 h-5 rounded border flex items-center justify-center transition-all cursor-pointer mx-auto ${willBeChecked ? 'bg-primary/20 border-primary/50 text-primary' : 'border-outline/20 bg-surface-container-lowest text-transparent'}`;
            updateBulkUsersToolbar(state);
        };
    }

    // ── Sort listeners ───────────────────────────────────────────────────────
    container.querySelectorAll('th[data-sort]').forEach(th => {
        th.addEventListener('click', () => {
            if (onSort) onSort(th.dataset.sort);
        });
    });

    // ── Role modal button ────────────────────────────────────────────────────
    container.querySelectorAll('.role-modal-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            const currentRole = btn.dataset.role;
            const newRole = await window.openStatusSelectModal(window.USER_ROLE_OPTIONS, currentRole, `Изменение роли пользователя ${id}`);
            if (!newRole || newRole === currentRole) return;

            try {
                await state.authenticatedFetch(`/api/admin/users/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify({ role: newRole })
                });
                window.showToast(`Роль пользователя ${id} успешно изменена на ${newRole.toUpperCase()}`, 'success', 'Изменение роли');
                state.fetchUsers();
            } catch (err) {
                alert('Ошибка: ' + err.message);
            }
        });
    });

    // ── Delete user button ───────────────────────────────────────────────────
    container.querySelectorAll('.delete-user-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const id = btn.dataset.id;
            if (await confirm(`Вы уверены, что хотите удалить пользователя ${id}? Это действие необратимо.`)) {
                const icon = btn.querySelector('.material-symbols-outlined');
                if (icon) icon.textContent = 'hourglass_empty';
                btn.disabled = true;
                try {
                    await state.authenticatedFetch(`/api/admin/users/${id}`, {
                        method: 'DELETE'
                    });
                    document.getElementById('refresh-users-btn')?.click();
                    window.showToast(`Пользователь ${id} успешно удален`, 'success', 'Удаление пользователя');
                } catch (err) {
                    alert('Ошибка при удалении пользователя: ' + err.message);
                    if (icon) icon.textContent = 'delete';
                    btn.disabled = false;
                }
            }
        });
    });

    // ── Row click → open modal (not on select cell or buttons) ───────────────
    container.querySelectorAll('.user-row').forEach(row => {
        row.addEventListener('click', (e) => {
            if (e.target.closest('.user-select-cell') || e.target.closest('button')) return;
            const id = row.dataset.id;
            const user = users.find(u => String(u.id) === String(id));
            if (user) openUserModal(user, state);
        });
    });
}

export async function openUserModal(user, state) {
    if (typeof window.cancelAllBulkActions === 'function') {
        window.cancelAllBulkActions();
    }
    let modalWrapper = document.getElementById('admin-user-modal-wrapper');
    if (!modalWrapper) {
        modalWrapper = document.createElement('div');
        modalWrapper.id = 'admin-user-modal-wrapper';
        modalWrapper.className = 'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6 opacity-0 transition-opacity duration-300';
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
                    <div class="liquid-glass p-6 rounded-3xl border-outline/5 space-y-4 bg-surface-container/50">
                        <div class="flex items-center gap-3 text-primary">
                            <span class="material-symbols-outlined text-xl">contact_mail</span>
                            <h4 class="text-xs uppercase font-bold tracking-widest font-label-caps">Контактные данные</h4>
                        </div>
                        <div class="space-y-3">
                            <div>
                                <div class="text-[10px] uppercase text-on-surface-variant opacity-40 font-label-caps">Email адрес</div>
                                <div class="flex items-center justify-between gap-2 mt-1 bg-surface-container-lowest p-3 rounded-xl border border-outline/5">
                                    <span class="text-sm font-mono text-on-surface select-all">${user.email}</span>
                                    <button type="button" onclick="navigator.clipboard.writeText('${user.email}'); window.showToast('Email скопирован в буфер обмена', 'success', 'Копирование');" class="text-primary hover:text-on-surface transition-colors" title="Скопировать">
                                        <span class="material-symbols-outlined text-sm">content_copy</span>
                                    </button>
                                </div>
                            </div>
                            <div>
                                <div class="text-[10px] uppercase text-on-surface-variant opacity-40 font-label-caps">Телефон</div>
                                <div class="flex items-center justify-between gap-2 mt-1 bg-surface-container-lowest p-3 rounded-xl border border-outline/5">
                                    <span class="text-sm font-mono text-on-surface select-all">${user.phone || 'Не указан'}</span>
                                    ${user.phone ? `
                                        <a href="tel:${user.phone}" class="text-primary hover:text-on-surface transition-colors" title="Позвонить">
                                            <span class="material-symbols-outlined text-sm">call</span>
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Реквизиты компании -->
                    <div class="liquid-glass p-6 rounded-3xl border-outline/5 space-y-4 bg-surface-container/50">
                        <div class="flex items-center gap-3 text-primary">
                            <span class="material-symbols-outlined text-xl">domain</span>
                            <h4 class="text-xs uppercase font-bold tracking-widest font-label-caps">Реквизиты компании</h4>
                        </div>
                        <div class="space-y-3 text-xs">
                            <div class="flex justify-between py-1.5 border-b border-outline/5">
                                <span class="text-on-surface-variant opacity-50 uppercase text-[10px] font-label-caps">Компания</span>
                                <span class="font-bold text-on-surface text-right tracking-tight">${user.company_name || '—'}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-outline/5">
                                <span class="text-on-surface-variant opacity-50 uppercase text-[10px] font-label-caps">Должность</span>
                                <span class="font-bold text-on-surface text-right tracking-tight">${user.position || '—'}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-outline/5">
                                <span class="text-on-surface-variant opacity-50 uppercase text-[10px] font-label-caps">ИНН</span>
                                <span class="font-mono text-on-surface text-right">${user.inn || '—'}</span>
                            </div>
                            <div class="flex justify-between py-1.5 border-b border-outline/5">
                                <span class="text-on-surface-variant opacity-50 uppercase text-[10px] font-label-caps">КПП</span>
                                <span class="font-mono text-on-surface text-right">${user.kpp || '—'}</span>
                            </div>
                        </div>
                    </div>

                    <!-- Адреса -->
                    <div class="liquid-glass p-6 rounded-3xl border-outline/5 space-y-4 bg-surface-container/50 md:col-span-2">
                        <div class="flex items-center gap-3 text-primary">
                            <span class="material-symbols-outlined text-xl">location_on</span>
                            <h4 class="text-xs uppercase font-bold tracking-widest font-label-caps">Адреса</h4>
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-body-md">
                            <div class="bg-surface-container-lowest p-4 rounded-2xl border border-outline/5 space-y-1">
                                <div class="text-[10px] uppercase text-on-surface-variant opacity-40 font-bold font-label-caps tracking-widest">Юридический адрес</div>
                                <div class="text-on-surface leading-relaxed">${user.legal_address || 'Не указан'}</div>
                            </div>
                            <div class="bg-surface-container-lowest p-4 rounded-2xl border border-outline/5 space-y-1">
                                <div class="text-[10px] uppercase text-on-surface-variant opacity-40 font-bold font-label-caps tracking-widest">Фактический адрес</div>
                                <div class="text-on-surface leading-relaxed">${user.actual_address || 'Не указан'}</div>
                            </div>
                        </div>
                    </div>

                    <!-- Системная информация -->
                    <div class="liquid-glass p-6 rounded-3xl border-outline/5 space-y-4 bg-surface-container/50 md:col-span-2">
                        <div class="flex items-center gap-3 text-primary">
                            <span class="material-symbols-outlined text-xl">dns</span>
                            <h4 class="text-xs uppercase font-bold tracking-widest font-label-caps">Системная информация</h4>
                        </div>
                        <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-body-md">
                            <div class="bg-surface-container-lowest p-4 rounded-2xl border border-outline/5 space-y-1">
                                <div class="text-[10px] uppercase text-on-surface-variant opacity-40 font-bold font-label-caps tracking-widest">ID профиля</div>
                                <div class="font-mono text-primary text-xs truncate select-all">${user.id}</div>
                            </div>
                            <div class="bg-surface-container-lowest p-4 rounded-2xl border border-outline/5 space-y-1">
                                <div class="text-[10px] uppercase text-on-surface-variant opacity-40 font-bold font-label-caps tracking-widest">Auth ID (Supabase)</div>
                                <div class="font-mono text-primary text-xs truncate select-all">${user.auth_id || '—'}</div>
                            </div>
                            <div class="bg-surface-container-lowest p-4 rounded-2xl border border-outline/5 space-y-1">
                                <div class="text-[10px] uppercase text-on-surface-variant opacity-40 font-bold font-label-caps tracking-widest">Дата регистрации</div>
                                <div class="font-mono text-on-surface text-xs">${new Date(user.created_at).toLocaleString()}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        } else if (activeTab === 'orders') {
            if (userOrders.length === 0) {
                tabContent = `
                    <div class="flex flex-col items-center justify-center py-16 text-on-surface-variant opacity-75 animate-in fade-in duration-300">
                        <span class="material-symbols-outlined text-6xl mb-4">shopping_cart_off</span>
                        <div class="font-label-caps uppercase tracking-widest text-sm text-on-surface">У пользователя нет заказов</div>
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
                                <div class="user-order-card group flex items-center justify-between gap-4 p-4 bg-surface-container-lowest rounded-2xl border border-outline/10 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer shadow-sm" data-order-id="${order.id}">
                                    <div class="flex items-center gap-4 min-w-0">
                                        <div class="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
                                            <span class="material-symbols-outlined text-primary text-base">shopping_bag</span>
                                        </div>
                                        <div class="min-w-0">
                                            <div class="flex items-center gap-2">
                                                <span class="font-mono font-bold text-sm text-on-surface group-hover:text-primary transition-colors">${order.id}</span>
                                                ${msgCount > 0 ? `<span class="flex items-center gap-1 text-[9px] text-primary bg-primary/10 px-2 py-0.5 rounded-full font-label-caps uppercase tracking-widest"><span class="w-1.5 h-1.5 rounded-full bg-primary inline-block animate-pulse"></span>${msgCount} сообщ.</span>` : ''}
                                                ${order.invoice_url ? `<span class="text-[9px] text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full font-label-caps uppercase tracking-widest">📎 счёт</span>` : ''}
                                            </div>
                                            <div class="text-[10px] text-on-surface-variant opacity-50 mt-1.5 font-label-caps uppercase tracking-widest flex flex-wrap items-center gap-x-2 gap-y-1.5">
                                                <span>${new Date(order.created_at).toLocaleDateString()}</span>
                                                <span class="opacity-30">•</span>
                                                <div class="flex flex-wrap gap-1.5 items-center">
                                                    ${items.length > 0 ? items.map(i => {
                                                        const hasId = i.product_id;
                                                        if (hasId) {
                                                            return `<span onclick="event.stopPropagation(); window.openProductCardModal('${i.product_id}')" class="px-2.5 py-1 bg-surface-container hover:bg-primary/10 hover:text-primary transition-all border border-outline/10 hover:border-primary/30 rounded-lg text-[9px] text-on-surface-variant cursor-pointer normal-case tracking-normal font-sans select-none" title="${i.product_name}">${i.product_name} <span class="text-primary font-bold ml-0.5">×${i.quantity}</span></span>`;
                                                        } else {
                                                            return `<span class="px-2.5 py-1 bg-surface-container border border-outline/10 rounded-lg text-[9px] text-on-surface-variant normal-case tracking-normal font-sans select-none">${i.product_name} <span class="text-on-surface-variant/40 font-bold ml-0.5">×${i.quantity}</span></span>`;
                                                        }
                                                    }).join('') : '<span class="normal-case tracking-normal font-sans">Нет позиций</span>'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex items-center gap-3 shrink-0">
                                        <div class="text-right">
                                            <div class="font-display-xl font-bold text-sm text-primary">${Number(order.total).toLocaleString()} ₽</div>
                                            <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border font-label-caps ${badgeClass}">${statusName}</span>
                                        </div>
                                        <span class="material-symbols-outlined text-on-surface-variant opacity-30 group-hover:opacity-80 group-hover:text-primary transition-all text-base">chevron_right</span>
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
                const statusColors = {
                    new: '#3b82f6', // blue
                    processing: '#eab308', // yellow
                    completed: '#10b981', // green
                    cancelled: '#ef4444' // red
                };
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
                                    <div class="px-5 py-3 rounded-3xl text-sm bg-primary text-on-primary rounded-br-none shadow-md font-medium leading-relaxed">
                                        ${m.text}
                                    </div>
                                </div>
                                <div class="text-[10px] text-on-surface-variant opacity-50 font-mono mt-1.5 flex items-center gap-1 mr-1 font-label-caps uppercase tracking-widest">
                                    <span class="material-symbols-outlined text-[12px] text-primary">done_all</span>
                                    Вы (Менеджер) • ${dateStr} ${timeStr}
                                </div>
                            </div>
                        `;
                    } else {
                        return `
                            <div class="flex flex-col items-start mb-4 animate-in fade-in duration-300">
                                <div class="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                                    <div class="px-5 py-3 rounded-3xl text-sm bg-surface-container border border-primary/40 text-on-surface rounded-bl-none shadow-xl leading-relaxed">
                                        ${m.text}
                                    </div>
                                </div>
                                <div class="text-[10px] text-primary font-mono mt-1.5 flex items-center gap-1 ml-1 font-bold font-label-caps uppercase tracking-widest">
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
                        <div class="flex items-center justify-between bg-surface-container-low p-4 rounded-2xl border border-outline/30 mb-4 shrink-0">
                            <div class="flex items-center gap-3">
                                <div class="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
                                    <span class="material-symbols-outlined text-primary text-sm">receipt_long</span>
                                </div>
                                <span class="text-xs font-bold uppercase tracking-widest text-on-surface font-label-caps">Чат по заказу:</span>
                            </div>
                            <select id="user-modal-chat-order-select" style="color: ${statusColors[selectedOrder.status] || 'var(--color-primary)'};" class="bg-surface-container-lowest border border-outline/40 rounded-xl px-4 py-2 text-xs font-bold uppercase tracking-widest outline-none focus:border-primary transition-all cursor-pointer font-label-caps">
                                ${userOrders.map(o => {
                                    const statusColor = statusColors[o.status] || 'var(--color-primary)';
                                    return `<option value="${o.id}" style="color: ${statusColor}; font-weight: bold;" ${String(o.id) === String(selectedOrderId) ? 'selected' : ''}>Заказ ${o.id} — ${Number(o.total).toLocaleString()} ₽</option>`;
                                }).join('')}
                            </select>
                        </div>

                        <!-- Окно чата -->
                        <div class="flex-1 bg-surface-container-lowest rounded-3xl border border-outline/10 flex flex-col min-h-0 overflow-hidden shadow-2xl">
                            <div class="bg-surface-container/50 px-6 py-3.5 border-b border-outline/10 flex items-center justify-between shrink-0">
                                <div class="flex items-center gap-3">
                                    <div class="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary border border-primary/30">
                                        <span class="material-symbols-outlined text-base">forum</span>
                                    </div>
                                    <div>
                                        <span class="text-xs font-bold text-on-surface uppercase tracking-widest font-label-caps block">История сообщений</span>
                                        <span class="text-[9px] text-on-surface-variant opacity-60 block">Синхронизация Supabase Realtime</span>
                                    </div>
                                </div>
                                <div class="flex items-center gap-3">
                                    <span class="text-[9px] text-primary bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full uppercase tracking-widest font-bold font-label-caps">Realtime Sync</span>
                                    <span class="flex items-center gap-1 text-[9px] text-green-400 font-bold font-label-caps uppercase tracking-widest"><span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>live</span>
                                </div>
                            </div>
                            <div id="user-modal-chat-messages" class="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
                                ${chatMsgs.length ? rChatMsgs() : '<div class="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-40 text-center p-6"><span class="material-symbols-outlined text-4xl mb-3 opacity-50">forum</span><span class="text-xs uppercase tracking-widest font-bold font-label-caps text-on-surface">Нет сообщений в этом заказе</span></div>'}
                            </div>
                            <div class="p-4 border-t border-outline/10 flex gap-3 shrink-0 bg-surface-container/50 items-center">
                                <input id="user-modal-chat-input" type="text" placeholder="Написать клиенту в заказ ${selectedOrderId}..." class="flex-1 bg-surface-container-lowest border border-outline/10 rounded-2xl px-5 py-3 text-sm outline-none focus:border-primary transition-all text-on-surface placeholder:opacity-40 shadow-inner">
                                <button id="user-modal-chat-send" class="w-12 h-12 rounded-2xl bg-primary text-on-primary hover:bg-on-surface hover:text-surface flex items-center justify-center transition-all shrink-0 shadow-lg shadow-primary/20">
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
                                    chatBox.style.background = 'rgba(202, 112, 147,0.05)';
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
                            const selectedVal = e.target.value;
                            const o = userOrders.find(ord => String(ord.id) === String(selectedVal));
                            if (o) {
                                orderSelect.style.color = statusColors[o.status] || 'var(--color-primary)';
                            }
                            modalWrapper.dataset.chatOrderId = selectedVal;
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
                    <div class="flex flex-col items-center justify-center py-16 text-on-surface-variant opacity-75 animate-in fade-in duration-300">
                        <span class="material-symbols-outlined text-6xl mb-4">forum</span>
                        <div class="font-label-caps uppercase tracking-widest text-sm text-on-surface">У пользователя нет обращений</div>
                    </div>
                `;
            } else {
                tabContent = `
                    <div class="space-y-4 animate-in fade-in duration-300">
                        ${userLeads.map(lead => `
                            <div class="glass p-6 rounded-3xl border-outline/10 space-y-3 bg-surface-variant">
                                <div class="flex items-center justify-between border-b border-outline/10 pb-3">
                                    <div class="flex items-center gap-2">
                                        <span class="material-symbols-outlined text-[#ca7093] text-lg">mark_email_unread</span>
                                        <span class="font-bold text-xs uppercase tracking-widest text-on-surface font-label-caps">${lead.type === 'callback' ? 'Обратный звонок' : lead.type}</span>
                                    </div>
                                    <span class="text-[10px] font-mono text-on-surface-variant opacity-60">${new Date(lead.created_at).toLocaleString()}</span>
                                </div>
                                <div class="text-xs text-on-surface-variant leading-relaxed bg-surface-container p-4 rounded-2xl border border-outline/10">
                                    ${lead.message || 'Без сообщения'}
                                </div>
                                <div class="flex justify-between items-center pt-1 text-[10px]">
                                    <span class="text-on-surface-variant opacity-70">Телефон: ${lead.phone || '—'}</span>
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
            <div id="user-modal-container" class="relative w-full sm:max-w-4xl h-[92vh] sm:max-h-[90vh] bg-surface-container border border-outline/30 rounded-t-[2rem] sm:rounded-[2.5rem] shadow-2xl flex flex-col transform translate-y-full sm:translate-y-0 sm:scale-95 transition-transform duration-300 min-h-0 overflow-hidden">
                <!-- Header -->
                <div class="p-4 sm:p-6 lg:p-8 border-b border-outline/20 flex items-center justify-between shrink-0 bg-surface-container">
                    <div class="flex items-center gap-4">
                        <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/50 flex items-center justify-center text-on-primary font-bold text-2xl shadow-lg shadow-primary/20 shrink-0 font-display-xl">
                            ${getInitials(user.name || user.email)}
                        </div>
                        <div class="min-w-0">
                            <div class="flex items-center gap-3">
                                <h3 class="font-headline-md text-xl font-bold uppercase tracking-tight text-on-surface truncate">
                                    ${user.name || 'Без имени'}
                                </h3>
                                <span class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shrink-0 font-label-caps ${user.role === 'admin' ? 'bg-primary text-on-primary' : 'bg-surface-variant text-on-surface-variant'}">
                                    ${user.role === 'admin' ? 'ADMIN' : 'USER'}
                                </span>
                            </div>
                            <div class="text-xs text-on-surface-variant opacity-60 font-mono mt-1 truncate">
                                ${user.company_name ? `${user.company_name} • ` : ''}${user.email}
                            </div>
                        </div>
                    </div>
                    <button id="close-user-modal" class="w-12 h-12 rounded-2xl bg-surface-variant hover:bg-primary/10 flex items-center justify-center text-on-surface-variant hover:text-primary transition-all border border-outline/10 shrink-0">
                        <span class="material-symbols-outlined">close</span>
                    </button>
                </div>

                <!-- Tabs Navigation -->
                <div class="flex gap-2 px-6 lg:px-8 pt-6 bg-surface-container shrink-0 border-b border-outline/10 overflow-x-auto custom-scrollbar">
                    <button type="button" class="user-modal-tab pb-4 px-4 text-xs uppercase font-bold tracking-widest font-label-caps transition-all relative shrink-0 ${activeTab === 'info' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant opacity-60 hover:opacity-100'}" data-tab="info">
                        Общая информация
                    </button>
                    <button type="button" class="user-modal-tab pb-4 px-4 text-xs uppercase font-bold tracking-widest font-label-caps transition-all relative flex items-center gap-2 shrink-0 ${activeTab === 'orders' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant opacity-60 hover:opacity-100'}" data-tab="orders">
                        История заказов
                        <span class="px-2 py-0.5 rounded-full text-[9px] bg-surface-variant text-on-surface font-mono">${userOrders.length}</span>
                    </button>
                    <button type="button" class="user-modal-tab pb-4 px-4 text-xs uppercase font-bold tracking-widest font-label-caps transition-all relative flex items-center gap-2 shrink-0 ${activeTab === 'chat' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant opacity-60 hover:opacity-100'}" data-tab="chat">
                        СМС-Чат
                        ${totalMsgCount > 0 ? `<span class="px-2 py-0.5 rounded-full text-[9px] bg-primary/20 text-primary font-mono">${totalMsgCount}</span>` : ''}
                    </button>
                    <button type="button" class="user-modal-tab pb-4 px-4 text-xs uppercase font-bold tracking-widest font-label-caps transition-all relative flex items-center gap-2 shrink-0 ${activeTab === 'leads' ? 'text-primary border-b-2 border-primary' : 'text-on-surface-variant opacity-60 hover:opacity-100'}" data-tab="leads">
                        Обращения
                        <span class="px-2 py-0.5 rounded-full text-[9px] bg-surface-variant text-on-surface font-mono">${userLeads.length}</span>
                    </button>
                </div>
                
                <!-- Content Area -->
                <div class="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-8 min-h-[350px]">
                    ${tabContent}
                </div>

                <!-- Footer -->
                <div class="p-6 lg:p-8 border-t border-outline/10 flex items-center justify-between bg-surface-container shrink-0 rounded-b-[2.5rem]">
                    <div class="text-[10px] text-on-surface-variant opacity-40 font-mono uppercase tracking-widest font-label-caps">
                        Профиль создан: ${new Date(user.created_at).toLocaleDateString()}
                    </div>
                    <div class="flex gap-4">
                        <a href="mailto:${user.email}" class="px-6 py-3 rounded-xl border border-primary/30 text-primary hover:bg-primary/10 transition-all text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 font-label-caps">
                            <span class="material-symbols-outlined text-sm">mail</span>
                            Написать
                        </a>
                        <button type="button" id="close-user-footer" class="px-6 py-3 rounded-xl bg-primary text-on-primary hover:bg-on-surface hover:text-surface transition-all text-[10px] font-bold uppercase tracking-widest shadow-lg shadow-primary/10 font-label-caps">
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
            if (container) {
                container.classList.remove('translate-y-0', 'scale-100');
                container.classList.add('translate-y-full', 'sm:translate-y-0', 'scale-95');
            }
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
        if (container) {
            container.classList.remove('translate-y-full', 'scale-95');
            container.classList.add('translate-y-0', 'scale-100');
        }
    });
}

async function openOrderFromUserModal(order, state) {
    if (typeof window.cancelAllBulkActions === 'function') {
        window.cancelAllBulkActions();
    }
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
                        <div class="px-5 py-3 rounded-3xl text-sm bg-[#ca7093] text-[#0f0e0c] rounded-br-none shadow-md font-medium leading-relaxed">
                            ${m.text}
                        </div>
                    </div>
                    <div class="text-[10px] text-on-surface-variant opacity-70 font-mono mt-1.5 flex items-center gap-1 mr-1">
                        <span class="material-symbols-outlined text-[12px] text-[#ca7093]">done_all</span>
                        Вы (Менеджер) • ${dateStr} ${timeStr}
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="flex flex-col items-start mb-4 animate-in fade-in duration-300">
                    <div class="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                        <div class="px-5 py-3 rounded-3xl text-sm bg-surface-variant border border-outline/10 text-on-surface rounded-bl-none shadow-md leading-relaxed">
                            ${m.text}
                        </div>
                    </div>
                    <div class="text-[10px] text-[#ca7093] font-mono mt-1.5 flex items-center gap-1 ml-1 font-bold">
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
        <div class="relative w-full max-w-2xl max-h-[85vh] bg-surface border border-outline/10 rounded-3xl shadow-2xl flex flex-col transform scale-95 transition-transform duration-300 min-h-0" id="sod-panel">
            <div class="p-5 border-b border-outline/10 flex items-center justify-between shrink-0 bg-surface-container rounded-t-3xl">
                <div class="flex items-center gap-3">
                    <div class="w-9 h-9 rounded-xl bg-[#ca7093]/10 flex items-center justify-center"><span class="material-symbols-outlined text-[#ca7093] text-base">receipt_long</span></div>
                    <div>
                        <div class="font-label-caps text-sm font-bold uppercase text-on-surface">Заказ ${order.id}</div>
                        <div class="text-[10px] text-on-surface-variant opacity-70">${new Date(order.created_at).toLocaleDateString()} • <span class="${sCols[order.status] || ''}">${sNames[order.status] || order.status}</span></div>
                    </div>
                </div>
                <button id="sod-close" class="w-9 h-9 rounded-xl bg-surface-variant hover:bg-surface-container-high flex items-center justify-center text-on-surface-variant hover:text-on-surface transition-colors"><span class="material-symbols-outlined text-sm">close</span></button>
            </div>
            <div class="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-5 min-h-0">
                ${items.length ? `
                <div class="space-y-2">
                    <div class="text-[10px] uppercase tracking-widest text-[#ca7093] font-bold">Состав заказа</div>
                    <div class="flex flex-wrap gap-2">
                        ${items.map(i => {
                            const hasId = i.product_id;
                            if (hasId) {
                                return `<div onclick="event.stopPropagation(); window.openProductCardModal('${i.product_id}')" class="flex gap-2 px-3 py-2 bg-surface-variant hover:bg-[#ca7093]/10 border border-outline/10 hover:border-[#ca7093]/40 rounded-xl text-xs text-on-surface cursor-pointer transition-all select-none group/item"><span class="group-hover/item:text-[#ca7093] transition-colors">${i.product_name}</span><span class="text-[#ca7093] font-bold">× ${i.quantity} т.</span></div>`;
                            } else {
                                return `<div class="flex gap-2 px-3 py-2 bg-surface-variant border border-outline/10 rounded-xl text-xs text-on-surface"><span>${i.product_name}</span><span class="text-[#ca7093] font-bold">× ${i.quantity} т.</span></div>`;
                            }
                        }).join('')}
                    </div>
                    <div class="text-right text-sm font-bold text-[#ca7093]">${Number(order.total).toLocaleString()} ₽</div>
                </div>` : ''}
                <div class="space-y-4">
                    <div class="text-[10px] uppercase tracking-widest text-[#ca7093] font-bold">Документы по заказу</div>
                    <div class="space-y-3">
                        <div class="flex flex-col gap-1">
                            <label class="text-[9px] uppercase tracking-wider text-on-surface-variant opacity-60">Коммерческое предложение (PDF)</label>
                            <div class="flex gap-2">
                                <input id="sod-kp" type="text" value="${order.kp_url || ''}" placeholder="Ссылка на КП..." class="flex-1 bg-surface border border-outline/10 rounded-xl px-4 py-2.5 text-xs focus:border-[#ca7093] outline-none transition-all text-on-surface" ${order.kp_url ? 'readonly' : ''}>
                                <button type="button" class="sod-upload-file-btn p-2.5 rounded-xl bg-surface hover:bg-[#ca7093]/20 text-on-surface-variant hover:text-[#ca7093] transition-all flex items-center justify-center border border-outline/10 shadow-sm shrink-0" data-target="sod-kp" title="Загрузить PDF-файл">
                                    <span class="material-symbols-outlined text-sm">attach_file</span>
                                </button>
                                ${order.kp_url ? `
                                <button type="button" class="sod-delete-doc-btn p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all flex items-center justify-center border border-red-500/20 shadow-sm shrink-0" data-doc="kp_url" title="Удалить">
                                    <span class="material-symbols-outlined text-sm">delete</span>
                                </button>
                                ` : ''}
                            </div>
                        </div>
                        <div class="flex flex-col gap-1">
                            <label class="text-[9px] uppercase tracking-wider text-on-surface-variant opacity-60">Счет на оплату (PDF)</label>
                            <div class="flex gap-2">
                                <input id="sod-invoice" type="text" value="${order.invoice_url || ''}" placeholder="Ссылка на счёт..." class="flex-1 bg-surface border border-outline/10 rounded-xl px-4 py-2.5 text-xs focus:border-[#ca7093] outline-none transition-all text-on-surface" ${order.invoice_url ? 'readonly' : ''}>
                                <button type="button" class="sod-upload-file-btn p-2.5 rounded-xl bg-surface hover:bg-[#ca7093]/20 text-on-surface-variant hover:text-[#ca7093] transition-all flex items-center justify-center border border-outline/10 shadow-sm shrink-0" data-target="sod-invoice" title="Загрузить PDF-файл">
                                    <span class="material-symbols-outlined text-sm">attach_file</span>
                                </button>
                                ${order.invoice_url ? `
                                <button type="button" class="sod-delete-doc-btn p-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-all flex items-center justify-center border border-red-500/20 shadow-sm shrink-0" data-doc="invoice_url" title="Удалить">
                                    <span class="material-symbols-outlined text-sm">delete</span>
                                </button>
                                ` : ''}
                            </div>
                        </div>
                        <div class="flex justify-end pt-1 gap-2 items-center">
                            ${order.kp_url ? `<a href="${order.kp_url}" target="_blank" class="flex items-center gap-1 text-[10px] text-green-400 hover:text-green-300 transition-colors"><span class="material-symbols-outlined text-xs">open_in_new</span>КП</a>` : ''}
                            ${order.invoice_url ? `<a href="${order.invoice_url}" target="_blank" class="flex items-center gap-1 text-[10px] text-green-400 hover:text-green-300 transition-colors"><span class="material-symbols-outlined text-xs">open_in_new</span>Счёт</a>` : ''}
                        </div>
                    </div>
                </div>
                <div class="space-y-4">
                    <div class="flex items-center justify-between bg-surface-variant px-5 py-3 border border-outline/10 rounded-2xl">
                        <div class="flex items-center gap-3">
                            <div class="w-7 h-7 rounded-full bg-[#ca7093]/20 flex items-center justify-center text-[#ca7093] border border-[#ca7093]/30">
                                <span class="material-symbols-outlined text-sm">forum</span>
                            </div>
                            <div>
                                <span class="text-xs font-bold text-on-surface uppercase tracking-widest font-label-caps block">Переписка с клиентом</span>
                                <span class="text-[9px] text-on-surface-variant opacity-75 block">Синхронизация Supabase Realtime</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="flex items-center gap-1 text-[9px] text-green-400 font-bold opacity-70"><span class="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block"></span>live</span>
                        </div>
                    </div>
                    <div class="bg-surface-container-lowest rounded-3xl border border-outline/10 flex flex-col h-[280px] shadow-inner overflow-hidden">
                        <div id="sod-chat" class="flex-1 overflow-y-auto p-5 custom-scrollbar space-y-4">${messages.length ? rMsg() : '<div class="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-60 text-center p-6"><span class="material-symbols-outlined text-4xl mb-3 opacity-50">forum</span><span class="text-xs uppercase tracking-widest font-bold font-label-caps text-on-surface">Нет сообщений</span></div>'}</div>
                        <div class="p-4 border-t border-outline/10 flex gap-3 shrink-0 bg-surface-variant items-center">
                            <input id="sod-input" type="text" placeholder="Написать клиенту..." class="flex-1 bg-surface border border-outline/10 rounded-2xl px-5 py-2.5 text-xs focus:border-[#ca7093] outline-none transition-all text-on-surface placeholder:opacity-50">
                            <button id="sod-send" class="w-10 h-10 rounded-2xl bg-[#ca7093] text-[#0f0e0c] hover:brightness-110 flex items-center justify-center transition-all shrink-0 shadow-lg shadow-[#ca7093]/20"><span class="material-symbols-outlined text-sm">send</span></button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="p-4 border-t border-outline/10 flex items-center justify-between bg-surface-container rounded-b-3xl shrink-0">
                <div class="flex items-center gap-2">
                    <span class="text-[10px] text-on-surface-variant opacity-70 uppercase tracking-widest">Статус:</span>
                    ${(() => {
                        let currentStatus = (order.status || 'new').toLowerCase().trim();
                        if (currentStatus === 'pending' || currentStatus === 'новый') currentStatus = 'new';
                        const statusObj = window.ORDER_STATUS_OPTIONS.find(o => o.value === currentStatus) || { label: currentStatus, color: '#3b82f6', icon: 'donut_large' };
                        return `<button type="button" id="sod-status-btn" data-status="${currentStatus}" class="flex items-center justify-between gap-2 bg-surface border border-outline/10 hover:border-[#ca7093]/40 rounded-xl px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all shadow-md group/btn w-[150px] shrink-0" style="border-left: 4px solid ${statusObj.color};">
                            <span class="flex items-center gap-1.5 truncate" style="color: ${statusObj.color};">
                                <span class="material-symbols-outlined text-sm shrink-0">${statusObj.icon}</span>
                                <span class="truncate" style="color: ${statusObj.color};">${statusObj.label}</span>
                            </span>
                            <span class="material-symbols-outlined text-xs text-on-surface-variant opacity-70 group-hover/btn:opacity-100 transition-opacity shrink-0 ml-1">expand_more</span>
                        </button>`;
                    })()}
                </div>
                <div class="text-sm font-bold text-[#ca7093] font-label-caps">${Number(order.total).toLocaleString()} ₽</div>
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
                        chat.style.background = 'rgba(202, 112, 147,0.05)';
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

    const hiddenFileInput = document.createElement('input');
    hiddenFileInput.type = 'file';
    hiddenFileInput.style.display = 'none';
    document.body.appendChild(hiddenFileInput);
    let currentUploadTargetInputId = null;

    popup.querySelectorAll('.sod-upload-file-btn').forEach(btn => {
        btn.onclick = () => {
            currentUploadTargetInputId = btn.dataset.target;
            hiddenFileInput.click();
        };
    });

    hiddenFileInput.onchange = async () => {
        const file = hiddenFileInput.files[0];
        if (!file) return;
        
        const btn = popup.querySelector(`.sod-upload-file-btn[data-target="${currentUploadTargetInputId}"]`);
        const originalIcon = btn ? btn.innerHTML : '<span class="material-symbols-outlined text-sm">attach_file</span>';
        if (btn) btn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">hourglass_empty</span>';

        try {
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const res = await state.authenticatedFetch('/api/admin/upload-file', {
                        method: 'POST',
                        body: JSON.stringify({
                            fileName: file.name,
                            fileData: reader.result
                        })
                    });
                    
                    const docType = currentUploadTargetInputId === 'sod-kp' ? 'kp_url' : 'invoice_url';
                    await state.authenticatedFetch(`/api/admin/orders/${order.id}`, { method:'PUT', body: JSON.stringify({ [docType]: res.url }) });
                    order[docType] = res.url;
                    state.updateOrderLocal(order.id, { [docType]: res.url });
                    
                    window.showToast(`Файл "${file.name}" загружен успешно`, 'success', 'Загрузка');
                    openOrderFromUserModal(order, state);
                } catch (err) {
                    alert('Ошибка загрузки файла: ' + err.message);
                } finally {
                    if (btn) btn.innerHTML = originalIcon;
                }
            };
            reader.readAsDataURL(file);
        } catch (err) {
            alert('Ошибка чтения файла: ' + err.message);
            if (btn) btn.innerHTML = originalIcon;
        }
        hiddenFileInput.value = '';
    };

    popup.querySelectorAll('.sod-delete-doc-btn').forEach(btn => {
        btn.onclick = async () => {
            if (confirm('Вы уверены, что хотите удалить этот документ?')) {
                const docType = btn.dataset.doc;
                try {
                    btn.innerHTML = '<span class="material-symbols-outlined text-sm animate-spin">hourglass_empty</span>';
                    await state.authenticatedFetch(`/api/admin/orders/${order.id}`, { method:'PUT', body: JSON.stringify({ [docType]: null }) });
                    order[docType] = null;
                    state.updateOrderLocal(order.id, { [docType]: null });
                    window.showToast('Документ удален', 'success', 'Удаление');
                    openOrderFromUserModal(order, state);
                } catch (err) {
                    alert('Ошибка удаления: ' + err.message);
                    btn.innerHTML = '<span class="material-symbols-outlined text-sm">delete</span>';
                }
            }
        };
    });

    popup.querySelectorAll('#sod-kp, #sod-invoice').forEach(input => {
        input.onchange = async () => {
            const docType = input.id === 'sod-kp' ? 'kp_url' : 'invoice_url';
            try {
                reader.onload = async () => {
                    try {
                        const res = await state.authenticatedFetch('/api/admin/upload-file', {
                            method: 'POST',
                            body: JSON.stringify({
                                fileName: file.name,
                                fileData: reader.result
                            })
                        });
                        
                        targetInput.value = res.url;
                        window.showToast(`Файл "${file.name}" загружен успешно`, 'success', 'Загрузка');
                    } catch (err) {
                        alert('Ошибка загрузки файла: ' + err.message);
                    } finally {
                        if (btn) btn.innerHTML = originalIcon;
                    }
                };
                reader.readAsDataURL(file);
            } catch (err) {
                alert('Ошибка чтения файла: ' + err.message);
                if (btn) btn.innerHTML = originalIcon;
            }
            hiddenFileInput.value = ''; // Reset file input
        };
    });

    popup.querySelector('#sod-save-docs').onclick = async () => {
        const btn = popup.querySelector('#sod-save-docs');
        const kpUrl = popup.querySelector('#sod-kp').value;
        const invoiceUrl = popup.querySelector('#sod-invoice').value;
        btn.textContent = '...';
        try {
            await state.authenticatedFetch(`/api/admin/orders/${order.id}`, { method:'PUT', body: JSON.stringify({ kp_url: kpUrl, invoice_url: invoiceUrl }) });
            order.kp_url = kpUrl;
            order.invoice_url = invoiceUrl;
            btn.textContent = '✓ Сохранено';
            setTimeout(() => { btn.textContent = 'Сохранить'; }, 2500);
            window.showToast('Документы по заказу сохранены', 'success', 'Документы');
        } catch(e) { alert(e.message); btn.textContent = 'Сохранить'; }
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
        const newStatus = await window.openStatusSelectModal(window.ORDER_STATUS_OPTIONS, currentStatus, `Изменение статуса заказа ${order.id}`);
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
            window.showToast(`Статус заказа ${order.id} изменен на "${newStatus}"`, 'success', 'Обновление статуса');
        } catch(err) { alert(err.message); }
    };
}
