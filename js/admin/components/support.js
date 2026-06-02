import { renderLeadsView } from './leads.js';
import { openUserModal } from './users.js';

/**
 * Renders the Support/Messenger view
 * @param {HTMLElement} container 
 * @param {Object} state 
 */
export async function renderSupportView(container, state, initialTab = 'chats') {
    if (!container) return;

    // Support Chats State
    let activeTopic = null;
    let topics = [];
    let isMobileChatOpen = false;
    let supabaseRT = null;
    let supportRealtimeChannel = null;
    let activeFolder = 'order';
    let searchQuery = '';

    const getTopicUnreadCount = (t) => {
        let readTimes = {};
        try { readTimes = JSON.parse(localStorage.getItem('metal_chat_read_times') || '{}'); } catch(e){}
        const topicKey = t.type + '_' + t.id;
        const lastRead = readTimes[topicKey] || 0;
        const msgs = t.messages || [];
        return msgs.filter(m => m.sender !== 'admin' && new Date(m.timestamp).getTime() > lastRead).length;
    };

    const markTopicAsRead = (type, id) => {
        const topicKey = type + '_' + id;
        let readTimes = {};
        try { readTimes = JSON.parse(localStorage.getItem('metal_chat_read_times') || '{}'); } catch(e){}

        // Anchor the read time to the latest message timestamp (not just Date.now()).
        // Client message timestamps come from the client's clock, so relying solely on
        // the admin's Date.now() makes already-read messages resurface as unread after a
        // topics/cookie refresh whenever the client's clock runs ahead. Using the newest
        // message time guarantees every currently-visible message counts as read.
        let latestMsgTime = 0;
        const topic = (topics || []).find(t => t.type === type && String(t.id) === String(id));
        if (topic && Array.isArray(topic.messages)) {
            topic.messages.forEach(m => {
                const ts = new Date(m.timestamp).getTime();
                if (!isNaN(ts) && ts > latestMsgTime) latestMsgTime = ts;
            });
        }
        readTimes[topicKey] = Math.max(Date.now(), latestMsgTime);
        localStorage.setItem('metal_chat_read_times', JSON.stringify(readTimes));
        
        // Also update the global chat badge if it exists, so everything is perfectly in sync
        if (window.globalChatTopics && typeof window.calculateGlobalChatUnreadCount === 'function' && typeof window.updateGlobalChatBadgeDisplay === 'function') {
            window.updateGlobalChatBadgeDisplay(window.calculateGlobalChatUnreadCount(window.globalChatTopics));
        }
    };

    const cleanupRealtime = () => {
        if (supportRealtimeChannel && supabaseRT) {
            supabaseRT.removeChannel(supportRealtimeChannel);
            supportRealtimeChannel = null;
        }
    };

    // Helper to format chat times like Telegram
    const formatChatTime = (timestamp) => {
        if (!timestamp) return '';
        const date = new Date(timestamp);
        const now = new Date();
        
        const isToday = date.toDateString() === now.toDateString();
        
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        const isYesterday = date.toDateString() === yesterday.toDateString();
        
        if (isToday) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } else if (isYesterday) {
            return 'Вчера';
        } else {
            const diffTime = Math.abs(now - date);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            if (diffDays < 7) {
                const days = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
                return days[date.getDay()];
            } else {
                return date.toLocaleDateString([], { day: '2-digit', month: '2-digit' });
            }
        }
    };

    const renderLayout = () => {
        container.innerHTML = `
            <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <!-- Header -->
                <div class="flex items-center justify-between gap-4">
                    <div>
                        <h3 class="text-lg md:text-xl font-bold font-['Space Grotesk'] tracking-tight text-on-surface">Техническая поддержка</h3>
                        <p class="text-xs text-on-surface-variant mt-0.5 font-medium">Обращения клиентов и живые чаты</p>
                    </div>
                    <button type="button" id="refresh-support-view-btn" class="flex items-center justify-center gap-2 px-4 py-3 md:py-3.5 bg-surface-container text-primary rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-primary/10 transition-all shadow-lg border border-outline/10 shrink-0">
                        <span class="material-symbols-outlined text-sm">refresh</span>
                    </button>
                </div>

                <!-- Sub-Tabs Selector Removed -->

                <!-- Tab Content Panel -->
                <div id="support-tab-content" class="min-h-[500px]">
                    <!-- Dynamic content goes here -->
                </div>
            </div>
        `;
    };

    renderLayout();

    const tabContent = document.getElementById('support-tab-content');
    const tabLeads = document.getElementById('support-tab-leads');
    const tabChats = document.getElementById('support-tab-chats');
    const refreshBtn = document.getElementById('refresh-support-view-btn');

    let currentTab = initialTab; // Default to initialTab

    const switchTab = async (tabName) => {
        cleanupRealtime();
        currentTab = tabName;
        isMobileChatOpen = false;
        
        // Update tab buttons styles
        if (currentTab === 'leads') {
            if (tabLeads) tabLeads.className = "support-subtab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-on-primary bg-primary shadow-lg shadow-primary/20";
            if (tabChats) tabChats.className = "support-subtab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-on-surface-variant hover:text-primary";
            
            // Render leads view in embed mode
            await renderLeadsView(tabContent, state, true, 'appeals');
        } else {
            if (tabChats) tabChats.className = "support-subtab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-on-primary bg-primary shadow-lg shadow-primary/20";
            if (tabLeads) tabLeads.className = "support-subtab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-on-surface-variant hover:text-primary";
            
            // Render the chats workspace
            renderChatsWorkspace();
            await fetchTopics();
        }
    };

    if (tabLeads) tabLeads.addEventListener('click', () => switchTab('leads'));
    if (tabChats) tabChats.addEventListener('click', () => switchTab('chats'));

    const renderWelcomeScreen = () => {
        tabContent.innerHTML = `
            <div class="flex flex-col items-center justify-center min-h-[520px] py-12 px-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <!-- Icon -->
                <div class="w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-8 shadow-lg shadow-primary/10">
                    <span class="material-symbols-outlined text-4xl">support_agent</span>
                </div>
                
                <!-- Title -->
                <h2 class="text-2xl font-bold font-['Space_Grotesk'] tracking-tight text-on-surface text-center mb-2 uppercase">Техническая поддержка</h2>
                <p class="text-sm text-on-surface-variant text-center mb-10 max-w-md leading-relaxed">Выберите удобный способ связи или найдите существующее обращение</p>
                
                <!-- Options grid -->
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
                    <!-- Phone -->
                    <a href="tel:+78005553535" class="group flex flex-col items-center gap-4 p-6 rounded-3xl border border-outline/10 bg-surface-container hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer shadow-sm hover:shadow-lg hover:shadow-primary/5 text-center">
                        <div class="w-14 h-14 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                            <span class="material-symbols-outlined text-2xl">phone</span>
                        </div>
                        <div>
                            <div class="font-bold text-on-surface text-sm uppercase tracking-wide mb-1">Позвонить</div>
                            <div class="text-[11px] text-on-surface-variant opacity-70">+7 (800) 555-35-35</div>
                            <div class="text-[10px] text-green-500 font-bold uppercase tracking-widest mt-2">Бесплатно</div>
                        </div>
                    </a>
                    
                    <!-- Chat -->
                    <button id="welcome-go-chats-btn" class="group flex flex-col items-center gap-4 p-6 rounded-3xl border border-outline/10 bg-surface-container hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer shadow-sm hover:shadow-lg hover:shadow-primary/5 text-center">
                        <div class="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                            <span class="material-symbols-outlined text-2xl">chat</span>
                        </div>
                        <div>
                            <div class="font-bold text-on-surface text-sm uppercase tracking-wide mb-1">Написать в чат</div>
                            <div class="text-[11px] text-on-surface-variant opacity-70">Ответим в течение нескольких минут</div>
                            <div class="text-[10px] text-primary font-bold uppercase tracking-widest mt-2">Онлайн</div>
                        </div>
                    </button>
                    
                    <!-- Find appeal -->
                    <button id="welcome-go-leads-btn" class="group flex flex-col items-center gap-4 p-6 rounded-3xl border border-outline/10 bg-surface-container hover:bg-primary/5 hover:border-primary/30 transition-all cursor-pointer shadow-sm hover:shadow-lg hover:shadow-primary/5 text-center">
                        <div class="w-14 h-14 rounded-2xl bg-[#5b9cf6]/10 border border-[#5b9cf6]/20 flex items-center justify-center text-[#5b9cf6] group-hover:scale-110 transition-transform">
                            <span class="material-symbols-outlined text-2xl">search</span>
                        </div>
                        <div>
                            <div class="font-bold text-on-surface text-sm uppercase tracking-wide mb-1">Найти обращение</div>
                            <div class="text-[11px] text-on-surface-variant opacity-70">Просмотр существующих заявок</div>
                            <div class="text-[10px] text-[#5b9cf6] font-bold uppercase tracking-widest mt-2">История</div>
                        </div>
                    </button>
                </div>
            </div>
        `;
        
        const goChatsBtn = document.getElementById('welcome-go-chats-btn');
        const goLeadsBtn = document.getElementById('welcome-go-leads-btn');
        
        if (goChatsBtn) goChatsBtn.onclick = () => switchTab('chats');
        if (goLeadsBtn) goLeadsBtn.onclick = () => switchTab('leads');
    };

    const deleteTopic = async (id, type) => {
        const label = type === 'order' ? 'заказ' : 'обращение';
        if (!await confirm(`Вы уверены, что хотите безвозвратно удалить этот ${label} и всю историю переписки?`)) return;

        try {
            const endpoint = type === 'order' ? `/api/admin/orders/${id}` : `/api/admin/leads/${id}`;
            await state.authenticatedFetch(endpoint, {
                method: 'DELETE'
            });
            
            if (activeTopic && String(activeTopic.id) === String(id) && activeTopic.type === type) {
                activeTopic = null;
                isMobileChatOpen = false;
                renderChatWindow();
            }
            
            await fetchTopics();
            if (type === 'lead') await state.fetchLeads();
            else await state.fetchOrders();
            
        } catch (err) {
            console.error('Error deleting topic:', err);
            alert('Ошибка при удалении: ' + err.message);
        }
    };

    refreshBtn.addEventListener('click', async () => {
        if (currentTab === 'leads') {
            const refreshLeadsBtn = document.getElementById('refresh-leads-btn');
            if (refreshLeadsBtn) refreshLeadsBtn.click();
            else await renderLeadsView(tabContent, state, true, 'appeals');
        } else {
            await fetchTopics();
        }
    });

    // Helper functions for Chats Tab
    const switchAdminChatFolder = (folder) => {
        activeFolder = folder;
        const btnOrders = document.getElementById('admin-folder-orders');
        const btnLeads = document.getElementById('admin-folder-leads');
        
        const activeBase = 'flex-1 py-2 text-center rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 text-[#0f0e0c] bg-primary border border-primary/20';
        const inactiveBase = 'flex-1 py-2 text-center rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 text-on-surface-variant hover:text-primary';

        if (btnOrders) btnOrders.className = (folder === 'order' ? activeBase : inactiveBase);
        if (btnLeads) btnLeads.className = (folder === 'lead' ? activeBase : inactiveBase);

        renderChatList();
        
        // Auto-select first chat of this folder
        const filtered = topics.filter(t => t.type === folder);
        if (filtered.length > 0) {
            if (!activeTopic || activeTopic.type !== folder) {
                activeTopic = filtered[0];
                renderChatWindow();
            }
        }
    };


    window.switchAdminChatFolderFromHeader = (folder) => {
        switchAdminChatFolder(folder);
    };
    const renderChatsWorkspace = () => {
        tabContent.innerHTML = `
            <div class="h-[calc(100vh-220px)] md:h-[calc(100vh-280px)] flex w-full max-w-full bg-surface-container rounded-2xl md:rounded-3xl overflow-hidden border border-outline/10 shadow-2xl relative" 
                 style="background-color: var(--color-surface) !important;">
                <!-- Sidebar: Chat List -->
                <div id="support-sidebar" class="w-full md:w-80 shrink-0 border-r border-outline/10 flex flex-col transition-all duration-300 ${isMobileChatOpen ? 'hidden md:flex' : 'flex'}"
                     style="background-color: var(--color-surface-container-low) !important;">
                    <div class="p-4 border-b border-outline/10 space-y-3">
                        <div class="flex gap-1 bg-white/5 p-1 rounded-xl border border-outline/10">
                            <button id="admin-folder-orders" class="flex-1 py-2 text-center rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all text-[#0f0e0c] bg-primary border border-primary/20 flex items-center justify-center gap-1.5">Заказы<span id="admin-badge-orders" class="hidden bg-white text-primary text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none"></span></button>
                            <button id="admin-folder-leads" class="flex-1 py-2 text-center rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all text-on-surface-variant hover:text-primary flex items-center justify-center gap-1.5">Обращения<span id="admin-badge-leads" class="hidden bg-primary text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none"></span></button>
                        </div>
                        <input type="text" id="adminChatSearchInput" placeholder="Поиск..." class="w-full bg-white/5 border border-outline/10 rounded-lg px-3 py-2 text-xs text-on-surface outline-none focus:border-primary/30"/>
                    </div>
                    <div id="support-chat-list" class="flex-1 overflow-y-auto custom-scrollbar p-2">
                        <div class="flex items-center justify-center h-32">
                            <div class="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin"></div>
                        </div>
                    </div>
                </div>
                <!-- Chat Window Container -->
                <div id="support-chat-window" class="flex-1 min-w-0 flex flex-col relative bg-surface/30 ${!isMobileChatOpen ? 'hidden md:flex' : 'flex'}"
                     style="background-color: var(--color-surface) !important;">
                    <div class="flex flex-col items-center justify-center h-full py-8 px-4">
                        <div class="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-5 shadow-lg shadow-primary/10">
                            <span class="material-symbols-outlined text-2xl">support_agent</span>
                        </div>
                        <h3 class="font-bold text-sm uppercase tracking-tight text-on-surface text-center mb-1">Рабочее место специалиста</h3>
                        <p class="text-xs text-on-surface-variant text-center mb-5 opacity-50 max-w-[220px]">Панель управления обращениями и чатами поддержки клиентов</p>
                        <div class="flex flex-col gap-2.5 w-full max-w-[240px]">
                            <button id="admin-welcome-find-btn" class="group flex items-center gap-3 p-3 rounded-2xl border border-outline/10 bg-surface-container hover:bg-[#5b9cf6]/5 hover:border-[#5b9cf6]/30 transition-all text-left w-full">
                                <div class="w-9 h-9 rounded-xl bg-[#5b9cf6]/10 border border-[#5b9cf6]/20 flex items-center justify-center text-[#5b9cf6] group-hover:scale-110 transition-transform shrink-0">
                                    <span class="material-symbols-outlined text-base">search</span>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-bold text-on-surface text-xs uppercase tracking-wide">Найти обращение</div>
                                    <div class="text-[10px] text-on-surface-variant opacity-60">Выберите из списка</div>
                                </div>
                                <span class="material-symbols-outlined text-xs text-on-surface-variant/30 group-hover:text-[#5b9cf6] transition-colors">chevron_right</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        const btnOrders = document.getElementById('admin-folder-orders');
        const btnLeads = document.getElementById('admin-folder-leads');
        const searchInput = document.getElementById('adminChatSearchInput');

        if (btnOrders) btnOrders.onclick = () => switchAdminChatFolder('order');
        if (btnLeads) btnLeads.onclick = () => switchAdminChatFolder('lead');
        if (searchInput) {
            searchInput.oninput = (e) => {
                searchQuery = e.target.value.toLowerCase();
                renderChatList();
            };
        }

        // Wire welcome screen buttons
        const adminWelcomeFindBtn = document.getElementById('admin-welcome-find-btn');
        if (adminWelcomeFindBtn) {
            adminWelcomeFindBtn.onclick = () => {
                const btn = document.querySelector('[data-view="support_leads"]');
                if (btn) btn.click();
            };
        }

    };

    const fetchTopics = async () => {
        const listEl = document.getElementById('support-chat-list');
        if (!listEl) return;

        try {
            const data = await state.authenticatedFetch('/api/admin/chat-topics');
            
            // Sort topics by unread count first, then by last message timestamp from new to old
            topics = data.sort((a, b) => {
                const unreadA = getTopicUnreadCount(a);
                const unreadB = getTopicUnreadCount(b);
                
                if (unreadA !== unreadB) {
                    return unreadB - unreadA;
                }

                const getLatestTime = (t) => {
                    const msgs = t.messages || [];
                    if (msgs.length > 0) {
                        return new Date(msgs[msgs.length - 1].timestamp).getTime();
                    }
                    return t.created_at ? new Date(t.created_at).getTime() : 0;
                };
                return getLatestTime(b) - getLatestTime(a);
            });
            
            if (activeTopic) {
                const updatedActive = topics.find(t => String(t.id) === String(activeTopic.id) && t.type === activeTopic.type);
                if (updatedActive) {
                    activeTopic = updatedActive;
                    markTopicAsRead(activeTopic.type, activeTopic.id);
                }
            }
            
            renderChatList();
        } catch (err) {
            console.error('Error fetching chat topics:', err);
            listEl.innerHTML = `<div class="p-6 text-center text-error text-xs uppercase tracking-widest font-bold">Ошибка загрузки</div>`;
        }
    };

    const renderChatList = () => {
        const listContainer = document.getElementById('support-chat-list');
        if (!listContainer) return;
        
        // Filter topics by activeFolder and search query
        const filtered = topics.filter(t => {
            if (t.type !== activeFolder) return false;
            if (searchQuery) {
                return t.customer_name?.toLowerCase().includes(searchQuery) || 
                       String(t.id).includes(searchQuery) ||
                       t.title?.toLowerCase().includes(searchQuery);
            }
            return true;
        });

        // Update Folder Badges
        const countUnreadForFolder = (folderType) => {
            return topics.filter(t => t.type === folderType).reduce((acc, t) => acc + getTopicUnreadCount(t), 0);
        };
        const unreadOrders = countUnreadForFolder('order');
        const unreadLeads = countUnreadForFolder('lead');
        
        const badgeOrders = document.getElementById('admin-badge-orders');
        const badgeLeads = document.getElementById('admin-badge-leads');
        if (badgeOrders) {
            badgeOrders.textContent = unreadOrders;
            badgeOrders.className = unreadOrders > 0 ? "bg-white text-primary text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none" : "hidden";
        }
        if (badgeLeads) {
            badgeLeads.textContent = unreadLeads;
            badgeLeads.className = unreadLeads > 0 ? "bg-primary text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none" : "hidden";
        }

        const unreadHTML = [];
        const readHTML = [];

        filtered.forEach(t => {
            const unreadCount = getTopicUnreadCount(t);
            const cardHtml = renderChatItem(t, unreadCount);
            if (unreadCount > 0) {
                unreadHTML.push(cardHtml);
            } else {
                readHTML.push(cardHtml);
            }
        });

        let finalHtml = '';
        if (unreadHTML.length > 0) {
            finalHtml += `
                <div class="mb-4 space-y-1">
                    <div class="px-4 py-3 flex items-center justify-between border-b border-outline/10 bg-primary/5 rounded-2xl mb-2">
                        <span class="text-[10px] font-black tracking-widest text-[#964551] uppercase font-['Space_Grotesk']">НЕПРОЧИТАННЫЕ</span>
                        <span class="bg-[#964551] text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center">${unreadHTML.length}</span>
                    </div>
                    ${unreadHTML.join('')}
                </div>
            `;
        }
        if (readHTML.length > 0) {
            finalHtml += `
                <div class="space-y-1">
                    <div class="px-4 py-3 border-b border-outline/10 mt-2 mb-2">
                        <span class="text-[10px] font-black tracking-widest text-on-surface-variant opacity-60 uppercase font-['Space_Grotesk']">ПРОЧИТАННЫЕ</span>
                    </div>
                    ${readHTML.join('')}
                </div>
            `;
        }

        if (unreadHTML.length === 0 && readHTML.length === 0) {
            finalHtml = `<div class="p-8 text-center text-[10px] uppercase font-bold text-on-surface-variant/30 tracking-widest">Нет диалогов</div>`;
        }

        listContainer.innerHTML = finalHtml;

        // Add click listeners
        listContainer.querySelectorAll('.chat-item').forEach(item => {
            item.onclick = () => {
                const id = item.dataset.id;
                const type = item.dataset.type;
                activeTopic = topics.find(t => String(t.id) === id && t.type === type);
                isMobileChatOpen = true;
                
                // Mark as read!
                markTopicAsRead(type, id);
                
                // For desktop highlight
                listContainer.querySelectorAll('.chat-item').forEach(i => i.classList.remove('bg-[#964551]/10', 'border-[#964551]'));
                item.classList.add('bg-[#964551]/10', 'border-[#964551]');
                
                // Update workspace visibility for mobile
                const sidebar = document.getElementById('support-sidebar');
                const chatWindow = document.getElementById('support-chat-window');
                if (sidebar && chatWindow) {
                    sidebar.classList.add('hidden', 'md:flex');
                    chatWindow.classList.remove('hidden');
                    chatWindow.classList.add('flex');
                }
                
                renderChatWindow();
                renderChatList(); // Refresh list to clear unread badge on item and folder
            };
        });

        // Add delete listeners
        listContainer.querySelectorAll('.delete-chat-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                deleteTopic(btn.dataset.id, btn.dataset.type);
            };
        });
    };

    const renderChatItem = (topic, unreadCount) => {
        const lastMsg = topic.messages.length > 0 ? topic.messages[topic.messages.length - 1] : null;
        const timestamp = lastMsg ? lastMsg.timestamp : topic.created_at;
        const time = formatChatTime(timestamp);
        const isActive = activeTopic && String(activeTopic.id) === String(topic.id) && activeTopic.type === topic.type;
        
        const badgeHtml = unreadCount > 0 ? `<span class="bg-[#964551] text-white text-[11px] font-black px-2 py-0.5 rounded-full ml-2 shrink-0">${unreadCount}</span>` : '';
        
        let activeClass = 'border-transparent text-on-surface hover:bg-surface-variant';
        if (isActive) activeClass = 'bg-[#964551]/10 border-[#964551] text-primary';
        else if (unreadCount > 0) activeClass = 'unread-chat-item bg-[#964551]/10 border-transparent text-on-surface';

        return `
            <div class="chat-item p-4 rounded-2xl cursor-pointer transition-all border ${activeClass} group relative" data-id="${topic.id}" data-type="${topic.type}">
                <button class="delete-chat-btn absolute right-2 bottom-2 p-1.5 opacity-0 group-hover:opacity-100 hover:text-error transition-all z-10" data-id="${topic.id}" data-type="${topic.type}" title="Удалить диалог">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
                <div class="flex justify-between items-start mb-1">
                    <div class="text-[10px] font-bold uppercase tracking-widest text-primary truncate max-w-[150px]">
                        ${topic.type === 'order' ? 'Заказ ' + topic.id : 'Обращение ' + topic.id}
                    </div>
                    <div class="text-[9px] text-on-surface-variant opacity-40 font-mono">${time}</div>
                </div>
                <div class="font-bold text-on-surface text-xs truncate mb-1 flex items-center justify-between">
                    <span>${topic.customer_name || 'Клиент'}</span>
                    ${badgeHtml}
                </div>
                <div class="text-[10px] text-on-surface-variant opacity-60 truncate flex items-center gap-1.5">
                    ${unreadCount > 0 ? '<span class="w-1.5 h-1.5 rounded-full bg-[#964551] shrink-0 animate-pulse"></span>' : ''}
                    <span class="${unreadCount > 0 ? 'text-[#964551] font-bold' : ''}">${lastMsg ? lastMsg.text : 'Нет сообщений'}</span>
                </div>
            </div>
        `;
    };

    const renderChatWindow = () => {
        const windowContainer = document.getElementById('support-chat-window');
        if (!windowContainer) return;
        
        cleanupRealtime();
        
        if (!activeTopic) {
            windowContainer.innerHTML = `
                <div class="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-30 bg-surface/30">
                    <span class="material-symbols-outlined text-6xl mb-4">forum</span>
                    <div class="font-['Space Grotesk'] uppercase tracking-widest text-sm text-center px-6">Выберите чат для начала общения</div>
                </div>
            `;
            return;
        }

        // Filter topics by active folder for the select options
        const folderTopics = topics.filter(t => t.type === activeTopic.type);
        const optionsHtml = folderTopics.map(t => {
            const isSelected = String(activeTopic.id) === String(t.id) && activeTopic.type === t.type;
            const msgs = t.messages || [];
            const isUnread = msgs.length > 0 && msgs[msgs.length - 1].sender !== 'admin';
            const unreadText = isUnread ? ` (${msgs.filter(m => m.sender !== 'admin').length} нов.)` : '';
            
            let timeText = '';
            const timestamp = msgs.length > 0 ? msgs[msgs.length - 1].timestamp : t.created_at;
            if (timestamp) {
                const time = new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                timeText = ` [${time}]`;
            }
            const cleanTitle = t.title.split(' — ')[1] || t.title;
            return `<option value="${t.type}_${t.id}" ${isSelected ? 'selected' : ''}>${t.type === 'order' ? 'Заказ ' + t.id : 'Обращение ' + t.id} — ${cleanTitle}${timeText}${unreadText}</option>`;
        }).join('');

        windowContainer.innerHTML = `
            <!-- Top Dropdown Bar (only select) -->
            <div class="px-4 py-3 bg-surface-container-high/90 backdrop-blur-xl border-b border-outline/10 flex items-center shrink-0 z-20 md:hidden"
                 style="background-color: var(--color-surface-container) !important;">
                <div class="w-full max-w-full">
                    <select id="adminChatTopicSelect" class="w-full bg-white/5 border border-outline/10 rounded-xl px-4 py-2.5 text-xs text-on-surface outline-none font-body-md">
                        ${optionsHtml}
                    </select>
                </div>
            </div>
            <!-- Chat Header -->
            <div class="p-4 md:p-6 border-b border-outline/10 flex items-center justify-between shrink-0"
                 style="background-color: var(--color-surface-container) !important;">
                <div class="flex items-center gap-3 md:gap-4 overflow-hidden">
                    <button id="back-to-list-btn" class="md:hidden p-2 -ml-2 text-on-surface-variant hover:text-primary transition-colors">
                        <span class="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div class="w-10 h-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                        <span class="material-symbols-outlined text-xl">${activeTopic.type === 'order' ? 'shopping_bag' : 'contact_support'}</span>
                    </div>
                    <div class="overflow-hidden">
                        <h4 class="font-bold text-on-surface text-xs md:text-sm uppercase tracking-tight truncate">${activeTopic.customer_name || 'Клиент'}</h4>
                        <div class="text-[9px] md:text-[10px] text-primary font-mono flex items-center gap-3 mt-0.5 truncate opacity-70">
                            <span>${activeTopic.customer_phone || ''}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2 shrink-0">
                    <button id="delete-active-chat-btn" class="p-2 rounded-xl bg-error/10 text-error hover:bg-error/20 transition-all group" title="Удалить диалог">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                    <button id="view-source-btn" class="hidden sm:block px-3 py-1.5 rounded-xl bg-surface-variant text-on-surface-variant text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container-high transition-all">
                        Открыть
                    </button>
                </div>
            </div>

            <!-- Messages Area -->
            <div id="messages-container" class="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 custom-scrollbar min-h-0" 
                 style="background-color: var(--color-bg) !important;">
                ${activeTopic.messages.length > 0 ? activeTopic.messages.map(m => renderMessage(m)).join('') : `
                    <div class="flex flex-col items-center justify-center h-full text-on-surface-variant opacity-20">
                        <span class="material-symbols-outlined text-4xl mb-2">history</span>
                        <div class="text-[10px] uppercase tracking-widest font-bold">История сообщений пуста</div>
                    </div>
                `}
            </div>

            <!-- Input Area: STRICTLY AT BOTTOM -->
            <div class="p-3 md:p-4 border-t border-outline/10 shrink-0" 
                 style="background-color: var(--color-surface-container) !important;">
                <div class="flex items-end gap-2 md:gap-3 p-2 rounded-2xl border border-outline/10 focus-within:border-primary/50 transition-all shadow-inner"
                     style="background-color: var(--color-surface-container-low) !important;">
                    <textarea 
                        id="support-chat-input" 
                        placeholder="Напишите ответ..." 
                        rows="1"
                        class="flex-1 bg-transparent border-none rounded-xl px-3 py-2 text-sm outline-none focus:ring-0 transition-all text-on-surface placeholder:opacity-30 resize-none custom-scrollbar min-h-[44px] max-h-32"
                    ></textarea>
                    <button id="send-support-msg-btn" class="shrink-0 w-11 h-11 rounded-xl bg-primary text-on-primary flex items-center justify-center shadow-lg shadow-primary/20 hover:brightness-110 active:scale-95 transition-all">
                        <span class="material-symbols-outlined text-xl">send</span>
                    </button>
                </div>
                <div class="mt-2 px-4 flex justify-between items-center text-[9px] text-on-surface-variant opacity-40 uppercase tracking-widest font-bold">
                    <span class="hidden md:inline">Shift + Enter для новой строки</span>
                    <span id="support-char-count">0 символов</span>
                </div>
            </div>
        `;

        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Setup Supabase Realtime channel
        const SUPABASE_URL = 'https://drbknuvnsyonmeudoleo.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRyYmtudXZuc3lvbm1ldWRvbGVvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg2MTA4MTYsImV4cCI6MjA5NDE4NjgxNn0.gEBVSWAOGZGB7IIVsVIs3MSO2UjZlG6UzTdOEK0grOc';

        try {
            const sb = window.supabase;
            if (sb && sb.createClient) {
                if (!supabaseRT) {
                    supabaseRT = sb.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                }
                const tableName = activeTopic.type === 'order' ? 'orders' : 'leads';
                supportRealtimeChannel = supabaseRT
                    .channel(`admin-support-chat-${activeTopic.type}-${activeTopic.id}`)
                    .on('postgres_changes', {
                        event: 'UPDATE',
                        schema: 'public',
                        table: tableName,
                        filter: `id=eq.${activeTopic.id}`
                    }, (payload) => {
                        const newMsgs = payload.new.messages;
                        if (!newMsgs) return;
                        let updated = [];
                        try {
                            updated = typeof newMsgs === 'string' ? JSON.parse(newMsgs) : newMsgs;
                        } catch(e) {
                            return;
                        }
                        if (updated.length > activeTopic.messages.length) {
                            activeTopic.messages = updated;
                            
                            // Mark open chat as read
                            if (activeTopic) {
                                markTopicAsRead(activeTopic.type, activeTopic.id);
                            }

                            const msgContainer = document.getElementById('messages-container');
                            if (msgContainer) {
                                msgContainer.innerHTML = activeTopic.messages.length > 0 
                                    ? activeTopic.messages.map(m => renderMessage(m)).join('')
                                    : '';
                                msgContainer.scrollTop = msgContainer.scrollHeight;
                                msgContainer.style.transition = 'background 0.3s';
                                msgContainer.style.background = 'rgba(150, 69, 81, 0.05)';
                                setTimeout(() => { msgContainer.style.background = ''; }, 600);
                            }
                            renderChatList();
                        }
                    })
                    .subscribe();
            }
        } catch(e) {
            console.warn('Support Realtime not available:', e.message);
        }

        // Mobile Back Button
        const backBtn = document.getElementById('back-to-list-btn');
        if (backBtn) {
            backBtn.onclick = () => {
                isMobileChatOpen = false;
                const sidebar = document.getElementById('support-sidebar');
                const chatWindow = document.getElementById('support-chat-window');
                if (sidebar && chatWindow) {
                    sidebar.classList.remove('hidden');
                    chatWindow.classList.add('hidden', 'md:flex');
                }
            };
        }

        // Auto-expanding textarea
        const chatInput = document.getElementById('support-chat-input');
        const charCount = document.getElementById('support-char-count');
        if (chatInput) {
            chatInput.focus();
            chatInput.addEventListener('input', () => {
                chatInput.style.height = 'auto';
                chatInput.style.height = Math.min(chatInput.scrollHeight, 128) + 'px';
                if (charCount) charCount.innerText = `${chatInput.value.length} символов`;
            });
        }

        const viewSourceBtn = document.getElementById('view-source-btn');
        if (viewSourceBtn) {
            viewSourceBtn.onclick = async () => {
                try {
                    if (!state.users || state.users.length === 0) {
                        await state.fetchUsers();
                    }
                    
                    const email = activeTopic.customer_email?.toLowerCase();
                    const phone = activeTopic.customer_phone;
                    
                    const user = state.users.find(u => 
                        (email && u.email?.toLowerCase() === email) ||
                        (phone && u.phone === phone)
                    );
                    
                    if (user) {
                        openUserModal(user, state);
                    } else {
                        if (window.showToast) {
                            window.showToast('Профиль пользователя не найден в базе данных', 'warning', 'Профиль не найден');
                        } else {
                            alert('Профиль пользователя не найден в базе данных');
                        }
                    }
                } catch (err) {
                    console.error('Error opening user modal from support chat:', err);
                    if (window.showToast) {
                        window.showToast('Ошибка загрузки профиля пользователя', 'error');
                    } else {
                        alert('Ошибка загрузки профиля пользователя');
                    }
                }
            };
        }

        const sendMessage = async () => {
            const input = document.getElementById('support-chat-input');
            if (!input) return;
            const text = input.value.trim();
            if (!text) return;

            const newMsg = { sender: 'admin', text, timestamp: new Date().toISOString() };
            const updatedMessages = [...activeTopic.messages, newMsg];
            
            activeTopic.messages = updatedMessages;
            
            // Mark active chat as read
            markTopicAsRead(activeTopic.type, activeTopic.id);

            const msgHtml = renderMessage(newMsg);
            if (messagesContainer) {
                if (messagesContainer.querySelector('.opacity-20')) messagesContainer.innerHTML = msgHtml;
                else messagesContainer.innerHTML += msgHtml;
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
            input.value = '';
            input.style.height = 'auto';
            if (charCount) charCount.innerText = '0 символов';
            
            renderChatList();

            try {
                const endpoint = activeTopic.type === 'order' 
                    ? `/api/admin/orders/${activeTopic.id}`
                    : `/api/admin/leads/${activeTopic.id}`;
                
                await state.authenticatedFetch(endpoint, {
                    method: 'PUT',
                    body: JSON.stringify({ messages: updatedMessages })
                });
            } catch (err) {
                console.error('Failed to send message:', err);
                alert('Ошибка отправки: ' + err.message);
            }
        };

        const sendBtn = document.getElementById('send-support-msg-btn');
        if (sendBtn) sendBtn.onclick = sendMessage;
        
        if (chatInput) {
            chatInput.onkeydown = (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                }
            };
        }

        const deleteActiveBtn = document.getElementById('delete-active-chat-btn');
        if (deleteActiveBtn) {
            deleteActiveBtn.onclick = () => deleteTopic(activeTopic.id, activeTopic.type);
        }

        // Setup select change listener
        const adminSelect = document.getElementById('adminChatTopicSelect');
        if (adminSelect) {
            adminSelect.addEventListener('change', (e) => {
                const [type, id] = e.target.value.split('_');
                const selected = topics.find(t => t.type === type && String(t.id) === String(id));
                if (selected) {
                    activeTopic = selected;
                    isMobileChatOpen = true;
                    // Highlight selected item in sidebar
                    const listContainer = document.getElementById('support-chat-list');
                    if (listContainer) {
                        listContainer.querySelectorAll('.chat-item').forEach(item => {
                            if (item.dataset.id === String(id) && item.dataset.type === type) {
                                item.classList.add('bg-primary/10', 'border-primary/20');
                            } else {
                                item.classList.remove('bg-primary/10', 'border-primary/20');
                            }
                        });
                    }
                    renderChatWindow();
                }
            });
            // Decorate it
            if (window.initCustomSelects) {
                setTimeout(() => {
                    window.initCustomSelects();
                }, 10);
            }
        }
    };

    const renderMessage = (m) => {
        const isAdmin = m.sender === 'admin';
        const timeStr = new Date(m.timestamp).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });

        if (isAdmin) {
            return `
                <div class="flex flex-col items-end mb-4 animate-in fade-in duration-300">
                    <div class="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                        <div class="relative px-5 pt-3 pb-5 pr-14 rounded-3xl text-sm bg-primary text-on-primary rounded-br-none shadow-md font-medium leading-relaxed break-words">
                            <span class="block">${m.text.replace(/\n/g, '<br>')}</span>
                            <span class="absolute bottom-1 right-2.5 flex items-center gap-0.5 text-[9px] opacity-60 font-mono select-none pointer-events-none text-on-primary">
                                ${timeStr}
                                <span class="material-symbols-outlined text-[11px] leading-none text-on-primary">done_all</span>
                            </span>
                        </div>
                    </div>
                </div>
            `;
        } else {
            return `
                <div class="flex flex-col items-start mb-4 animate-in fade-in duration-300">
                    <div class="flex items-end gap-2 max-w-[85%] md:max-w-[75%]">
                        <div class="relative px-5 pt-3 pb-5 pr-10 rounded-3xl text-sm bg-surface-container-high border border-outline-variant/30 text-on-surface rounded-bl-none shadow-md leading-relaxed break-words">
                            <span class="block">${m.text.replace(/\n/g, '<br>')}</span>
                            <span class="absolute bottom-1 right-2.5 flex items-center gap-0.5 text-[9px] opacity-50 font-mono select-none pointer-events-none">
                                ${timeStr}
                            </span>
                        </div>
                    </div>
                </div>
            `;
        }
    };

    // Initial load — show default tab directly
    switchTab(initialTab);

    // Register cleanup hook
    container._cleanup = () => {
        cleanupRealtime();
    };
}
