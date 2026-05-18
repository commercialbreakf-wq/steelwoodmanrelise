/**
 * Renders the Support/Messenger view
 * @param {HTMLElement} container 
 * @param {Object} state 
 */
export async function renderSupportView(container, state) {
    if (!container) return;

    container.innerHTML = `
        <div class="h-[calc(100vh-140px)] flex bg-[#151311] rounded-3xl overflow-hidden border border-white/5 shadow-2xl animate-in fade-in duration-500">
            <!-- Sidebar: Chat List -->
            <div class="w-80 border-r border-white/5 flex flex-col bg-[#1d1b19]/50">
                <div class="p-6 border-b border-white/5 flex items-center justify-between">
                    <h3 class="font-['Space Grotesk'] font-bold text-lg uppercase tracking-tight text-[#ffb0cc]">Сообщения</h3>
                    <button id="refresh-support-btn" class="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 text-[#ffb0cc] hover:bg-white/10 transition-all">
                        <span class="material-symbols-outlined text-sm">refresh</span>
                    </button>
                </div>
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

    let activeTopic = null;
    let topics = [];

    const fetchTopics = async () => {
        try {
            const data = await state.authenticatedFetch('/api/admin/chat-topics');
            topics = data;
            renderChatList();
        } catch (err) {
            console.error('Error fetching chat topics:', err);
            document.getElementById('support-chat-list').innerHTML = `
                <div class="p-6 text-center text-red-400 text-xs uppercase tracking-widest font-bold">
                    Ошибка загрузки
                </div>
            `;
        }
    };

    const renderChatList = () => {
        const listContainer = document.getElementById('support-chat-list');
        
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
    };

    const renderChatItem = (topic) => {
        const lastMsg = topic.messages.length > 0 ? topic.messages[topic.messages.length - 1] : null;
        const time = lastMsg ? new Date(lastMsg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        const isUnread = lastMsg && lastMsg.sender !== 'admin';
        const isActive = activeTopic && activeTopic.id === topic.id && activeTopic.type === topic.type;

        return `
            <div class="chat-item p-4 rounded-2xl cursor-pointer transition-all border border-transparent hover:bg-white/5 group ${isActive ? 'bg-[#ffb0cc]/10 border-[#ffb0cc]/20' : ''}" data-id="${topic.id}" data-type="${topic.type}">
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
        if (!activeTopic) return;

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
                    <a href="/admin.html#${activeTopic.type === 'order' ? 'orders' : 'leads'}" class="px-3 py-1.5 rounded-xl bg-white/5 text-[#d7c1c7] text-[10px] font-bold uppercase tracking-widest hover:bg-white/10 transition-all">
                        Открыть в ${activeTopic.type === 'order' ? 'заказах' : 'лидах'}
                    </a>
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
                    <input type="text" id="support-chat-input" placeholder="Напишите ответ..." class="flex-1 bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-sm outline-none focus:border-[#ffb0cc] transition-all text-[#e7e2dd] placeholder:opacity-30">
                    <button id="send-support-msg-btn" class="w-14 h-14 rounded-2xl bg-[#ffb0cc] text-[#0f0e0c] flex items-center justify-center shadow-lg shadow-[#ffb0cc]/20 hover:brightness-110 active:scale-95 transition-all">
                        <span class="material-symbols-outlined">send</span>
                    </button>
                </div>
            </div>
        `;

        const messagesContainer = document.getElementById('messages-container');
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Message Handlers
        const sendMessage = async () => {
            const input = document.getElementById('support-chat-input');
            const text = input.value.trim();
            if (!text) return;

            const newMsg = { sender: 'admin', text, timestamp: new Date().toISOString() };
            const updatedMessages = [...activeTopic.messages, newMsg];
            
            // Optimistic update
            activeTopic.messages = updatedMessages;
            messagesContainer.innerHTML += renderMessage(newMsg);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
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
                // Revert or show error
            }
        };

        document.getElementById('send-support-msg-btn').onclick = sendMessage;
        document.getElementById('support-chat-input').onkeydown = (e) => {
            if (e.key === 'Enter') sendMessage();
        };
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

    document.getElementById('refresh-support-btn').onclick = fetchTopics;

    // Initial fetch
    await fetchTopics();
}
