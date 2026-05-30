// Mobile utilities for responsive UI
export const isMobile = () => window.innerWidth <= 640;
export const toggleVisibility = (el) => {
  if (!el) return;
  el.classList.toggle('hidden');
};
export const initAccordion = (container, headerSelector) => {
  const headers = container.querySelectorAll(headerSelector);
  headers.forEach(h => {
    const content = h.nextElementSibling;
    h.addEventListener('click', () => {
      const isOpen = content.classList.contains('hidden') === false;
      // close all
      container.querySelectorAll('.accordion-content').forEach(c => c.classList.add('hidden'));
      container.querySelectorAll('.accordion-header').forEach(hh => hh.classList.remove('font-bold'));
      if (!isOpen) {
        content.classList.remove('hidden');
        h.classList.add('font-bold');
      }
    });
  });
};
