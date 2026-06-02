const fs = require('fs');
let c = fs.readFileSync('c:/Users/egas1/Downloads/Stitch_first_project/js/shared-ui.js', 'utf8');
c = c.replace(/ordersHtml = orders\.map\(o => \{[\s\S]*?return \`[\s\S]*?<button class="w-full text-left p-3\.5 rounded-2xl border border-\[\#964551\]\/20 bg-\[\#964551\]\/5 hover:bg-\[\#964551\]\/15 hover:border-\[\#964551\]\/45 transition-all flex flex-col gap-1 select-order-btn" data-id="\$\{o\.id\}">[\s\S]*?<\/button>[\s\S]*?\`;\s*\}\)\.join\(''\);/, `ordersHtml = orders.map(o => {
                const dateStr = new Date(o.created_at).toLocaleDateString('ru-RU');
                const totalStr = Number(o.total || 0).toLocaleString('ru-RU');
                const exists = (window.globalChatTopics || []).some(t => t.type === 'order' && String(t.id) === String(o.id));
                const bgClass = exists 
                    ? 'border-[#964551]/20 bg-[#964551]/5 hover:bg-[#964551]/15 hover:border-[#964551]/45' 
                    : 'border-white/5 bg-white/[0.02] hover:bg-white/10 hover:border-white/20';
                
                return \\\`
                    <button class="w-full text-left p-3.5 rounded-2xl border \\\${bgClass} transition-all flex flex-col gap-1 select-order-btn" data-id="\\\${o.id}">
                        <div class="font-bold text-xs uppercase tracking-wide text-on-surface">Заказ #\\\${o.id}</div>
                        <div class="text-[10px] text-on-surface-variant opacity-60">от \\\${dateStr} · \\\${totalStr} ₽</div>
                    </button>
                \\\`;
            }).join('');`);
fs.writeFileSync('c:/Users/egas1/Downloads/Stitch_first_project/js/shared-ui.js', c);
