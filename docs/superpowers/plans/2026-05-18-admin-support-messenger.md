# Admin Panel Modernization and Support Messenger Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the admin panel by adding a dedicated messenger-style Technical Support tab, hiding the client-side widget, adding lead deletion, and improving order readability.

**Architecture:** SPA-style tab switching in `admin.html`. The messenger will use a two-pane layout (List + Detail) with Supabase Realtime integration.

**Tech Stack:** Vanilla JS (ES Modules), Tailwind CSS, Supabase JS, Material Symbols.

---

### Task 1: Hide Tech Support Widget in Admin

**Files:**
- Modify: `js/admin/ui.js`

- [ ] **Step 1: Add CSS to hide the floating chat button**

Modify `renderLayout` to include a style tag that hides the widget.

```javascript
// In js/admin/ui.js, at the end of renderLayout function or via a style injection
const style = document.createElement('style');
style.innerHTML = `
    #floatingChatBtnGlobal { display: none !important; }
`;
document.head.appendChild(style);
```

- [ ] **Step 2: Verify in browser**
Open `admin.html` and ensure the pink floating button is gone.

- [ ] **Step 3: Commit**

```bash
git add js/admin/ui.js
git commit -m "style: hide tech support widget in admin panel"
```

---

### Task 2: Implement Lead Deletion

**Files:**
- Modify: `js/admin/components/leads.js`

- [ ] **Step 1: Add Delete button to the Leads table**

Modify `renderLeadsTable` to include a delete button in the actions column.

```javascript
// In js/admin/components/leads.js, inside the leads.map loop
// Add this after the status select or in a new column:
<td class="py-5 px-6 flex justify-end">
    <button data-id="${lead.id}" class="delete-lead-btn p-2 hover:text-red-400 transition-colors" title="Удалить лид">
        <span class="material-symbols-outlined text-base">delete</span>
    </button>
</td>
```

- [ ] **Step 2: Add Delete event listener**

```javascript
// In js/admin/components/leads.js, inside renderLeadsTable
container.querySelectorAll('.delete-lead-btn').forEach(btn => {
    btn.onclick = async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        if (confirm('Вы уверены, что хотите удалить этот лид?')) {
            try {
                await state.authenticatedFetch(`/api/admin/leads/${id}`, { method: 'DELETE' });
                // Refresh the view
                const leadsRes = await state.fetchLeads();
                renderLeadsWithFilters(container.closest('#leads-table-container'), leadsRes, state);
            } catch (err) {
                alert('Ошибка: ' + err.message);
            }
        }
    };
});
```

- [ ] **Step 3: Verify deletion**
Delete a test lead and ensure it's removed from both UI and server.

- [ ] **Step 4: Commit**

```bash
git add js/admin/components/leads.js
git commit -m "feat: add delete functionality to leads"
```

---

### Task 3: Improve Order Items Readability

**Files:**
- Modify: `js/admin/components/orders.js`

- [ ] **Step 1: Refactor product display in table**

Modify `renderOrdersTable` to use a vertical list for items.

```javascript
// In js/admin/components/orders.js, inside the items.map loop
<td class="py-4 px-6">
    <div class="flex flex-col gap-1.5 min-w-[250px]">
        ${items.map(i => `
            <div class="flex items-center justify-between gap-3 text-[11px] leading-tight group/item">
                <span class="text-[#e7e2dd] font-medium">• ${i.product_name}</span>
                <span class="px-2 py-0.5 bg-[#ffb0cc]/10 text-[#ffb0cc] rounded-md font-bold shrink-0">x${i.quantity}</span>
            </div>
        `).join('')}
    </div>
</td>
```

- [ ] **Step 2: Verify layout**
Ensure long names wrap correctly and quantities are aligned.

- [ ] **Step 3: Commit**

```bash
git add js/admin/components/orders.js
git commit -m "ui: improve product list readability in orders table"
```

---

### Task 4: Create Support Component (Messenger UI)

**Files:**
- Create: `js/admin/components/support.js`

- [ ] **Step 1: Scaffolding the messenger structure**

```javascript
export async function renderSupportView(container, state) {
    container.innerHTML = `
        <div class="h-[calc(100vh-140px)] flex bg-[#151311] rounded-3xl overflow-hidden border border-white/5 shadow-2xl animate-in fade-in duration-500">
            <!-- Sidebar: Chat List -->
            <div class="w-80 border-r border-white/5 flex flex-col bg-[#1d1b19]/50">
                <div class="p-6 border-b border-white/5">
                    <h3 class="font-['Space Grotesk'] font-bold text-lg uppercase tracking-tight text-[#ffb0cc]">Сообщения</h3>
                </div>
                <div id="support-chat-list" class="flex-1 overflow-y-auto custom-scrollbar">
                    <!-- Unread folder -->
                    <div id="unread-chats" class="p-2 space-y-1">
                        <div class="px-4 py-2 text-[10px] uppercase tracking-widest text-[#ffb0cc] font-bold opacity-50">Непрочитанные</div>
                        <div id="unread-list"></div>
                    </div>
                    <!-- All chats -->
                    <div class="p-2 space-y-1">
                        <div class="px-4 py-2 text-[10px] uppercase tracking-widest text-[#d7c1c7] font-bold opacity-50">Все диалоги</div>
                        <div id="all-chats-list"></div>
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
    
    // Logic to fetch chat topics and render them
    const topics = await state.authenticatedFetch('/api/admin/chat-topics');
    // ... render logic ...
}
```

- [ ] **Step 2: Commit**

```bash
git add js/admin/components/support.js
git commit -m "feat: scaffold tech support messenger component"
```

---

### Task 5: Integrate Support Tab into Sidebar

**Files:**
- Modify: `js/admin/ui.js`
- Modify: `js/admin/app.js`

- [ ] **Step 1: Add Support item to sidebar**

Modify `renderSidebar` in `js/admin/ui.js`.

```javascript
// In js/admin/ui.js, add support to the items array
const items = [
    // ... existing
    { id: 'support', label: 'Поддержка', icon: 'support_agent' },
    // ...
];
```

- [ ] **Step 2: Update view switcher**

Modify `initViewSwitcher` in `js/admin/app.js`.

```javascript
// In js/admin/app.js, inside initViewSwitcher
import { renderSupportView } from './components/support.js';
// ...
} else if (view === 'support') {
    renderSupportView(contentEl, state);
}
```

- [ ] **Step 3: Commit**

```bash
git add js/admin/ui.js js/admin/app.js
git commit -m "feat: add Technical Support tab to admin sidebar"
```

---

### Task 6: Finalize Messenger Logic (Realtime & Unread)

**Files:**
- Modify: `js/admin/components/support.js`

- [ ] **Step 1: Implement unread detection and rendering**

Logic to check if the last message in a topic is from a client and not seen (or simply mark as unread based on metadata).

- [ ] **Step 2: Implement Realtime chat window**
Reuse logic from `orders.js` but adapt it to work as a standalone messenger pane.

- [ ] **Step 3: Commit**

```bash
git add js/admin/components/support.js
git commit -m "feat: complete support messenger with realtime and unread folder"
```
