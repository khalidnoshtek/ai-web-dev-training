// Monochrome line icons, Lucide-style. Inline SVG, stroke: currentColor, no CDN,
// no emoji. Every icon is a 24x24 viewBox so they line up at any size.

const P = {
  dashboard: '<rect x="3" y="3" width="7" height="9" rx="1.5"/><rect x="14" y="3" width="7" height="5" rx="1.5"/><rect x="14" y="12" width="7" height="9" rx="1.5"/><rect x="3" y="16" width="7" height="5" rx="1.5"/>',
  layers:    '<path d="M12 2.8 2.9 7.4l9.1 4.6 9.1-4.6z"/><path d="M2.9 12.4 12 17l9.1-4.6"/><path d="M2.9 16.9 12 21.5l9.1-4.6"/>',
  progress:  '<path d="M3 20.5h18"/><rect x="4.5" y="12" width="3.6" height="6" rx="1"/><rect x="10.2" y="7.5" width="3.6" height="10.5" rx="1"/><rect x="15.9" y="4" width="3.6" height="14" rx="1"/>',
  award:     '<circle cx="12" cy="9" r="5.4"/><path d="M8.6 13.6 7.2 21.3l4.8-2.5 4.8 2.5-1.4-7.7"/>',
  users:     '<path d="M16.5 20v-1.7a3.6 3.6 0 0 0-3.6-3.6H6.6A3.6 3.6 0 0 0 3 18.3V20"/><circle cx="9.75" cy="7.3" r="3.6"/><path d="M21 20v-1.7a3.6 3.6 0 0 0-2.7-3.5"/><path d="M15.4 4a3.6 3.6 0 0 1 0 6.9"/>',
  theme:     '<circle cx="12" cy="12" r="8.6"/><path d="M12 3.4v17.2a8.6 8.6 0 0 0 0-17.2z" fill="currentColor" stroke="none"/>',
  download:  '<path d="M20 15.5v3.2a1.8 1.8 0 0 1-1.8 1.8H5.8A1.8 1.8 0 0 1 4 18.7v-3.2"/><path d="m7.8 10.6 4.2 4.2 4.2-4.2"/><path d="M12 14.8V3.6"/>',
  refresh:   '<path d="M20.4 10.2A8.6 8.6 0 0 0 5.8 6.4L3 9"/><path d="M3.6 13.8a8.6 8.6 0 0 0 14.6 3.8L21 15"/><path d="M3 4.4V9h4.6"/><path d="M21 19.6V15h-4.6"/>',
  signout:   '<path d="M9.6 20.4H5.8A1.8 1.8 0 0 1 4 18.6V5.4a1.8 1.8 0 0 1 1.8-1.8h3.8"/><path d="m15.4 16.6 4.6-4.6-4.6-4.6"/><path d="M20 12H9.4"/>',
  play:      '<path d="M7.6 4.9 19 12 7.6 19.1z" fill="currentColor" stroke="none"/>',
  check:     '<path d="m4.8 12.6 4.8 4.8L19.2 7.8"/>',
  external:  '<path d="M13.6 4.4H19.6V10.4"/><path d="m19.6 4.4-8.4 8.4"/><path d="M18 14.4v4.2a1.8 1.8 0 0 1-1.8 1.8H5.4a1.8 1.8 0 0 1-1.8-1.8V7.8A1.8 1.8 0 0 1 5.4 6h4.2"/>',
  lock:      '<rect x="4.4" y="10.4" width="15.2" height="10" rx="2"/><path d="M8.2 10.4V7.2a3.8 3.8 0 0 1 7.6 0v3.2"/>',
  alert:     '<path d="M12 4.2 2.8 19.8h18.4z"/><path d="M12 10v3.8"/><path d="M12 17.2h.01"/>',
  book:      '<path d="M4 4.6v13a1.8 1.8 0 0 0 1.8 1.8H20"/><path d="M20 19.4V3.6H5.8A1.8 1.8 0 0 0 4 5.4"/><path d="M8 8.6h8"/><path d="M8 12.2h5.5"/>'
};

export function icon(name, size = 20, cls = '') {
  const d = P[name];
  if (!d) return '';
  return `<svg class="ic ${cls}" viewBox="0 0 24 24" width="${size}" height="${size}" fill="none"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true" focusable="false">${d}</svg>`;
}

// Replaces every <span data-icon="name"> in the document with its SVG, so the
// markup stays readable and the paths live in exactly one place.
export function hydrateIcons(root = document) {
  root.querySelectorAll('[data-icon]').forEach(el => {
    const size = Number(el.dataset.iconSize) || 20;
    el.innerHTML = icon(el.dataset.icon, size);
  });
}
