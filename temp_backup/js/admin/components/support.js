import { renderLeadsView } from './leads.js';

/**
 * Renders the Support/Messenger view
 * @param {HTMLElement} container 
 * @param {Object} state 
 */
export async function renderSupportView(container, state) {
    if (!container) return;

    container.innerHTML = `
        <div class="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <!-- Header -->
            <div class="flex items-center justify-between">
                <div>
                    <h3 class="text-2xl font-bold font-['Space Grotesk'] tracking-tight text-[#e7e2dd]">Техническая поддержка</h3>
                    <p class="text-sm text-[#d7c1c7] mt-1 font-medium">Обращения клиентов и живые чаты техподдержки</p>
                </div>
                <button type="button" id="refresh-support-view-btn" class="flex items-center justify-center gap-2 px-4 py-4 bg-white/5 text-[#ffb0cc] rounded-2xl font-bold uppercase text-[10px] tracking-widest hover:bg-[#ffb0cc]/10 transition-all shadow-lg border border-white/5">
                    <span class="material-symbols-outlined text-sm">refresh</span>
                </button>
            </div>

            <!-- Sub-Tabs Selector -->
            <div class="flex gap-1 bg-[#151311] p-1.5 rounded-2xl border border-white/5 w-fit shadow-xl">
                <button id="support-tab-leads" class="support-subtab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-[#ffb0cc] bg-white/5" data-tab="leads">
                    Обращения
                </button>
                <button id="support-tab-chats" class="support-subtab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-[#d7c1c7] hover:text-[#ffb0cc]" data-tab="chats">
                    Чаты
                </button>
            </div>

            <!-- Tab Content Panel -->
            <div id="support-tab-content" class="min-h-[500px]">
                <!-- Dynamic content goes here -->
            </div>
        </div>
    `;

    const tabContent = document.getElementById('support-tab-content');
    const tabLeads = document.getElementById('support-tab-leads');
    const tabChats = document.getElementById('support-tab-chats');
    const refreshBtn = document.getElementById('refresh-support-view-btn');

    let currentTab = 'leads'; // Default to "Обращения" (Leads)
    
    // Support Chats State
    let activeTopic = null;
    let topics = [];

    const switchTab = async (tabName) => {
        currentTab = tabName;
        
        // Update tab buttons styles
        if (currentTab === 'leads') {
            tabLeads.className = "support-subtab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-[#0f0e0c] bg-[#ffb0cc]";
            tabChats.className = "support-subtab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-[#d7c1c7] hover:text-[#ffb0cc]";
            
            // Render leads view in embed mode
            await renderLeadsView(tabContent, state, true, 'appeals');
        } else {
            tabChats.className = "support-subtab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-[#0f0e0c] bg-[#ffb0cc]";
            tabLeads.className = "support-subtab px-6 py-3 rounded-xl font-bold uppercase text-[10px] tracking-widest transition-all text-[#d7c1c7] hover:text-[#ffb0cc]";
            
            // Render the chats workspace
            renderChatsWorkspace();
            await fetchTopics();
        }
    };

    tabLeads.addEventListener('click', () => switchTab('leads'));
    tabChats.addEventListener('click', () => switchTab('chats'));

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
                const windowContainer = document.getElementById('support-chat-window');
                if (windowContainer) {
                    windowContainer.innerHTML = `
                        <div class="flex flex-col items-center justify-center h-full text-[#d7c1c7] opacity-30">
                            <span class="material-symbols-outlined text-6xl mb-4">forum</span>
                            <div class="font-['Space Grotesk'] uppercase tracking-widest text-sm">Выберите чат для начала общения</div>
                        </div>
                    `;
                }
            }
            
            await fetchTopics();
            // Also notify other components if needed
            if (type === 'lead') await state.fetchLeads();
            else await state.fetchOrders();
            
        } catch (err) {
            console.error('Error deleting topic:', err);
            alert('Ошибка при удалении: ' + err.message);
        }
    };

    refreshBtn.addEventListener('click', async () => {
        if (currentTab === 'leads') {
            // Find and click the refresh leads button or load leads
            const refreshLeadsBtn = document.getElementById('refresh-leads-btn');
            if (refreshLeadsBtn) {
                refreshLeadsBtn.click();
            } else {
                await renderLeadsView(tabContent, state, true, 'appeals');
            }
        } else {
            await fetchTopics();
        }
    });

    // Helper functions for Chats Tab
    const renderChatsWorkspace = () => {
        tabContent.innerHTML = `
            <div class="h-[calc(100vh-220px)] flex bg-[#151311] rounded-3xl overflow-hidden border border-white/5 shadow-2xl animate-in fade-in duration-500">
                <!-- Sidebar: Chat List -->
                <div class="w-80 border-r border-white/5 flex flex-col bg-[#1d1b19]/50 animate-in slide-in-from-left duration-300">
                    <div id="support-chat-list" class="flex-1 overflow-y-auto custom-scrollbar">
                        <div class="flex items-center justify-center h-32">
                            <div class="w-6 h-6 border-2 border-[#ffb0cc]/20 border-t-[#ffb0cc] rounded-full animate-spin"></div>
                        </div>
                    </div>
                </div>
                <!-- Chat Window -->
                <div id="support-chat-window" class="flex-1 flex flex-col relative bg-black/20">
                    <div class="flex flex-col items-center justify-center h-full text-[#d7c1c7] opacity-30">
                        <span class="material-symbols-outlined text-6xl mb-4">forum</span>
                        <div class="font-['Space Grotesk'] uppercase tracking-widest text-sm">Выберите чат для начала общения</div>
                    </div>
                </div>
            </div>
        `;
    };

    const fetchTopics = async () => {
        const listEl = document.getElementById('support-chat-list');
        if (!listEl) return;

        try {
            const data = await state.authenticatedFetch('/api/admin/chat-topics');
            topics = data;
            
            // Keep active topic reference updated if it exists
            if (activeTopic) {
                const updatedActive = topics.find(t => String(t.id) === String(activeTopic.id) && t.type === activeTopic.type);
                if (updatedActive) {
                    activeTopic = updatedActive;
                }
            }
            
            renderChatList();
        } catch (err) {
            console.error('Error fetching chat topics:', err);
            listEl.innerHTML = `
                <div class="p-6 text-center text-red-400 text-xs uppercase tracking-widest font-bold">
                    Ошибка загрузки
                </div>
            `;
        }
    };

    const renderChatList = () => {
        const listContainer = document.getElementById('support-chat-list');
        if (!listContainer) return;
        
        const unread = topics.filter(t => {
            if (t.messages.length === 0) return false;
            const lastMsg = t.messages[t.messages.length - 1];
            return lastMsg.sender !== 'admin';
        });
        
        const all = topics;

        listContainer.innerHTML = `
            <!-- Unread folder -->
            ${unread.length > 0 ? `
            <div id="unread-chats" class="p-2 space-y-1">
                <div class="px-4 py-2 text-[10px] uppercase tracking-widest text-[#ffb0cc] font-bold opacity-50 flex items-center justify-between">
                    <span>Непрочитанные</span>
                    <span class="bg-[#ffb0cc] text-[#0f0e0c] px-1.5 rounded-md">${unread.length}</span>
                </div>
                <div id="unread-list">
                    ${unread.map(t => renderChatItem(t)).join('')}
                </div>
            </div>
            ` : ''}
            
            <!-- All chats -->
            <div class="p-2 space-y-1">
                <div class="px-4 py-2 text-[10px] uppercase tracking-widest text-[#d7c1c7] font-bold opacity-50">Все диалоги</div>
                <div id="all-chats-list">
                    ${all.map(t => renderChatItem(t)).join('')}
                </div>
            </div>
        `;

        // Add click listeners
        listContainer.querySelectorAll('.chat-item').forEach(item => {
            item.onclick = () => {
                const id = item.dataset.id;
                const type = item.dataset.type;
                activeTopic = topics.find(t => String(t.id) === id && t.type === type);
                
                // Highlight active
                listContainer.querySelectorAll('.chat-item').forEach(i => i.classList.remove('bg-[#ffb0cc]/10', 'border-[#ffb0cc]/20'));
                item.classList.add('bg-[#ffb0cc]/10', 'border-[#ffb0cc]/20');
                
                renderChatWindow();
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

    const renderChatItem = (topic) => {
        const lastMsg = topic.messages.length > 0 ? topic.messages[topic.messages.length - 1] : null;
        const time = lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        const isUnread = lastMsg && lastMsg.sender !== 'admin';
        const isActive = activeTopic && String(activeTopic.id) === String(topic.id) && activeTopic.type === topic.type;

        return `
            <div class="chat-item p-4 rounded-2xl cursor-pointer transition-all border border-transparent hover:bg-white/5 group relative ${isActive ? 'bg-[#ffb0cc]/10 border-[#ffb0cc]/20' : ''}" data-id="${topic.id}" data-type="${topic.type}">
                <button class="delete-chat-btn absolute right-2 bottom-2 p-1.5 opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all z-10" data-id="${topic.id}" data-type="${topic.type}" title="Удалить диалог">
                    <span class="material-symbols-outlined text-sm">delete</span>
                </button>
                <div class="flex justify-between items-start mb-1">
                    <div class="text-[10px] font-bold uppercase tracking-widest text-[#ffb0cc] truncate max-w-[150px]">
                        ${topic.type === 'order' ? 'Заказ #' + topic.id : 'Обращение #' + topic.id}
                    </div>
                    <div class="text-[9px] text-[#d7c1c7] opacity-40">${time}</div>
                </div>
                <div class="font-bold text-[#e7e2dd] text-xs truncate mb-1">
                    ${topic.customer_name || 'Клиент'}
                </div>
                <div class="text-[10px] text-[#d7c1c7] opacity-60 truncate flex items-center gap-1.5">
                    ${isUnread ? '<span class="w-1.5 h-1.5 rounded-full bg-[#ffb0cc] shrink-0"></span>' : ''}
                    <span class="${isUnread ? 'text-[#ffb0cc] font-bold' : ''}">${lastMsg ? lastMsg.text : 'Нет сообщений'}</span>
                </div>
            </div>
        `;
    };

    const renderChatWindow = () => {
        const windowContainer = document.getElementById('support-chat-window');
        if (!windowContainer || !activeTopic) return;

        windowContainer.innerHTML = `
            <!-- Chat Header -->
            <div class="p-6 border-b border-white/5 bg-[#1d1b19]/30 flex items-center justify-between">
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-2xl bg-[#ffb0cc]/10 border border-[#ffb0cc]/20 flex items-center justify-center text-[#ffb0cc]">
                        <span class="material-symbols-outlined text-xl">${activeTopic.type === 'order' ? 'shopping_bag' : 'contact_support'}</span>
                    </div>
                    <div>
                        <h4 class="font-bold text-[#e7e2dd] text-sm uppercase tracking-tight">${activeTopic.customer_name || 'Клиент'}</h4>
                        <div class="text-[10px] text-[#ffb0cc] font-mono flex items-center gap-3 mt-0.5">
                            <span>${activeTopic.customer_phone || ''}</span>
                            <span>${activeTopic.customer_email || ''}</span>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button id="delete-active-chat-btn" class="p-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all group" title="Удалить диалог">
                        <span class="material-symbols-outlined text-sm">delete</span>
                    </button>
                    <button id="view-source-btn" class="px-3 py-1.5 rounded-xl bg-white/5 text-[#d7c1c7] text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                        Открыть в ${activeTopic.type === 'order' ? 'заказах' : 'обращениях'}
                    </button>
                </div>
            </div>

            <!-- Messages Area -->
            <div id="messages-container" class="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                ${activeTopic.messages.length > 0 ? activeTopic.messages.map(m => renderMessage(m)).join('') : `
                    <div class="flex flex-col items-center justify-center h-full text-[#d7c1c7] opacity-20">
                        <span class="material-symbols-outlined text-4xl mb-2">history</span>
                        <div class="text-[10px] uppercase tracking-widest font-bold">История сообщений пуста</div>
                    </div>
                `}
            </div>

            <!-- Input Area -->
            <div class="p-6 bg-[#1d1b19]/30 border-t border-white/5">
                <div class="flex gap-4 items-center">
                    <input type="text" id="support-chat-input" placeholder="Напишите ответ..." class="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#ffb0cc] transition-all text-[#e7e2dd] placeholder:opacity-30 animate-pulse-once">
                    <button id="send-support-msg-btn" class="w-14 h-14 rounded-2xl bg-[#ffb0cc] text-[#0f0e0c] flex items-center justify-center shadow-lg shadow-[#ffb0cc]/20 hover:brightness-110 active:scale-95 transition-all">
                        <span class="material-symbols-outlined">send</span>
                    </button>
                </div>
            </div>
        `;

        const messagesContainer = document.getElementById('messages-container');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }

        // Link button handler to switch subtab/view
        const viewSourceBtn = document.getElementById('view-source-btn');
        if (viewSourceBtn) {
            viewSourceBtn.onclick = () => {
                if (activeTopic.type === 'order') {
                    // Navigate to orders tab in main menu
                    window.location.hash = 'orders';
                } else {
                    // Switch to "Обращения" subtab
                    switchTab('leads');
                }
            };
        }

        // Message Handlers
        const sendMessage = async () => {
            const input = document.getElementById('support-chat-input');
            if (!input) return;
            const text = input.value.trim();
            if (!text) return;

            const newMsg = { sender: 'admin', text, timestamp: new Date().toISOString() };
            const updatedMessages = [...activeTopic.messages, newMsg];
            
            // Optimistic update
            activeTopic.messages = updatedMessages;
            const msgHtml = renderMessage(newMsg);
            if (messagesContainer) {
                if (messagesContainer.querySelector('.opacity-20')) {
                    messagesContainer.innerHTML = msgHtml;
                } else {
                    messagesContainer.innerHTML += msgHtml;
                }
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
            }
            input.value = '';
            
            // Update topic list item preview
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
        
        const chatInput = document.getElementById('support-chat-input');
        if (chatInput) {
            chatInput.onkeydown = (e) => {
                if (e.key === 'Enter') sendMessage();
            };
        }

        const deleteActiveBtn = document.getElementById('delete-active-chat-btn');
        if (deleteActiveBtn) {
            deleteActiveBtn.onclick = () => deleteTopic(activeTopic.id, activeTopic.type);
        }
    };

    const renderMessage = (m) => {
        const isAdmin = m.sender === 'admin';
        const time = new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (isAdmin) {
            return `
                <div class="flex flex-col items-end animate-in slide-in-from-right-2 duration-300">
                    <div class="px-5 py-3 rounded-2xl bg-[#ffb0cc] text-[#0f0e0c] text-sm font-medium rounded-br-none max-w-[80%] shadow-lg">
                        ${m.text}
                    </div>
                    <div class="text-[9px] text-[#d7c1c7] opacity-40 mt-1.5 font-mono">Вы • ${time}</div>
                </div>
            `;
        } else {
            return `
                <div class="flex flex-col items-start animate-in slide-in-from-left-2 duration-300">
                    <div class="px-5 py-3 rounded-2xl bg-white/5 border border-white/10 text-[#e7e2dd] text-sm rounded-bl-none max-w-[80%]">
                        ${m.text}
                    </div>
                    <div class="text-[9px] text-[#ffb0cc] opacity-60 mt-1.5 font-mono">Клиент • ${time}</div>
                </div>
            `;
        }
    };

    // Load initial tab (Обращения)
    await switchTab('leads');
}
