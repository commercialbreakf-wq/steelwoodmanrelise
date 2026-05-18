/**
 * Opens the product editor drawer
 * @param {Object} product 
 * @param {Function} onSave 
 */
export function openDrawer(product, onSave) {
    let drawer = document.getElementById('admin-drawer');
    if (!drawer) {
        drawer = document.createElement('div');
        drawer.id = 'admin-drawer';
        drawer.className = 'fixed inset-y-0 right-0 w-[450px] bg-[#1d1b19] border-l border-[#534347]/20 z-50 transform translate-x-full transition-transform duration-300 shadow-2xl flex flex-col';
        document.body.appendChild(drawer);
    }

    drawer.innerHTML = `
        <div class="p-8 border-b border-[#534347]/20 flex items-center justify-between">
            <div>
                <h3 class="font-['Space Grotesk'] text-lg font-bold uppercase tracking-tight">Редактировать товар</h3>
                <div class="text-[10px] text-[#ffb0cc] uppercase font-['Space Grotesk'] tracking-widest mt-1">ID: ${product.vid}</div>
            </div>
            <button id="close-drawer" class="w-10 h-10 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors">
                <span class="material-symbols-outlined">close</span>
            </button>
        </div>
        
        <div class="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <form id="edit-product-form" class="space-y-6">
                <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-widest text-[#ffb0cc] font-['Space Grotesk'] font-bold">Наименование</label>
                    <input type="text" name="vname" value="${product.vname}" class="w-full bg-[#151311] border border-[#534347]/30 rounded-xl px-4 py-3 focus:border-[#ffb0cc] focus:ring-1 focus:ring-[#ffb0cc] outline-none transition-all">
                </div>
                
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-[10px] uppercase tracking-widest text-[#ffb0cc] font-['Space Grotesk'] font-bold">Цена (₽)</label>
                        <input type="number" name="vprice" value="${product.vprice}" class="w-full bg-[#151311] border border-[#534347]/30 rounded-xl px-4 py-3 focus:border-[#ffb0cc] focus:ring-1 focus:ring-[#ffb0cc] outline-none transition-all">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[10px] uppercase tracking-widest text-[#ffb0cc] font-['Space Grotesk'] font-bold">Статус</label>
                        <select name="vstatus" class="w-full bg-[#151311] border border-[#534347]/30 rounded-xl px-4 py-3 focus:border-[#ffb0cc] focus:ring-1 focus:ring-[#ffb0cc] outline-none transition-all">
                            <option value="active" ${product.vstatus === 'active' ? 'selected' : ''}>Активен</option>
                            <option value="draft" ${product.vstatus === 'draft' ? 'selected' : ''}>Черновик</option>
                        </select>
                    </div>
                </div>

                <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-widest text-[#ffb0cc] font-['Space Grotesk'] font-bold">Категория</label>
                    <input type="text" name="vcat" value="${product.vcat}" class="w-full bg-[#151311] border border-[#534347]/30 rounded-xl px-4 py-3 focus:border-[#ffb0cc] focus:ring-1 focus:ring-[#ffb0cc] outline-none transition-all">
                </div>

                <div class="space-y-2">
                    <label class="text-[10px] uppercase tracking-widest text-[#ffb0cc] font-['Space Grotesk'] font-bold">Описание</label>
                    <textarea name="vdescription" rows="4" class="w-full bg-[#151311] border border-[#534347]/30 rounded-xl px-4 py-3 focus:border-[#ffb0cc] focus:ring-1 focus:ring-[#ffb0cc] outline-none transition-all resize-none">${product.vdescription || ''}</textarea>
                </div>
            </form>
        </div>

        <div class="p-8 border-t border-[#534347]/20 grid grid-cols-2 gap-4">
            <button id="cancel-edit" class="px-6 py-3 rounded-xl border border-[#534347]/30 hover:bg-white/5 transition-all text-sm font-bold uppercase tracking-widest font-['Space Grotesk']">Отмена</button>
            <button id="save-product" class="px-6 py-3 rounded-xl bg-[#ffb0cc] text-[#0f0e0c] hover:bg-white transition-all text-sm font-bold uppercase tracking-widest font-['Space Grotesk']">Сохранить</button>
        </div>
    `;

    // Show drawer
    setTimeout(() => drawer.classList.remove('translate-x-full'), 10);

    const close = () => {
        drawer.classList.add('translate-x-full');
    };

    drawer.querySelector('#close-drawer').onclick = close;
    drawer.querySelector('#cancel-edit').onclick = close;
    
    drawer.querySelector('#save-product').onclick = async () => {
        const formData = new FormData(drawer.querySelector('#edit-product-form'));
        const updatedData = Object.fromEntries(formData.entries());
        
        const saveBtn = drawer.querySelector('#save-product');
        const originalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.textContent = 'Сохранение...';

        try {
            await onSave(updatedData);
            close();
        } catch (err) {
            alert('Ошибка при сохранении: ' + err.message);
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    };
}
