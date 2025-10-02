import { icon } from './icons.js';

/**
 * Vykreslí breadcrumbs do zadaného root elementu.
 * @param {HTMLElement} root - element, kam se breadcrumbs vykreslí
 * @param {Array} items - pole položek [{icon, label, href}]
 */
export function setBreadcrumb(root, items = []) {
  if (!root) return;
  root.innerHTML = items.map((it, i) => {
    const c = i === items.length - 1 ? 'opacity-70' : '';
    const body = `${it.icon ? icon(it.icon) + ' ' : ''}${it.label ?? ''}`;
    const piece = it.href
      ? `<a href="${it.href}" class="hover:underline">${body}</a>`
      : `<span class="${c}">${body}</span>`;
    return i ? `<span class="mx-1">›</span>${piece}` : piece;
  }).join('');
}
