// src/ui/theme.js
const KEY = 'app:theme';
const THEMES = ['light', 'dark', 'gray'];

export function applyTheme(theme) {
  const t = THEMES.includes(theme) ? theme : 'light';
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem(KEY, t);
}

export function initThemeUI(container) {
  const current = localStorage.getItem(KEY) || 'light';
  applyTheme(current);
  container.innerHTML = `
    <label class="text-sm mr-2">Vzhled</label>
    <select id="themeSelect" class="border rounded px-2 py-1 text-sm bg-white">
      ${THEMES.map(t => `<option value="${t}" ${t===current?'selected':''}>${label(t)}</option>`).join('')}
    </select>
  `;
  container.querySelector('#themeSelect').onchange = (e) => applyTheme(e.target.value);
}

function label(t) {
  switch (t) {
    case 'dark': return 'Tmavý';
    case 'gray': return 'Šedý';
    default: return 'Světlý';
  }
}
