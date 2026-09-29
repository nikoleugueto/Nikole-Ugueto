import { contact } from '../../../content/pages.js';

/**
 * Contact.
 *
 * Kept plain, as the brief asked. Email, LinkedIn and the resume PDF are real
 * links; the resume row downloads the file rather than opening a mail client.
 */
const ICON = {
  mail: '<path d="M2 4h12v8H2z"/><path d="m2 5 6 4 6-4"/>',
  link: '<path d="M6.5 9.5a3 3 0 0 0 4.2 0l2-2a3 3 0 0 0-4.2-4.2l-.8.8"/><path d="M9.5 6.5a3 3 0 0 0-4.2 0l-2 2a3 3 0 0 0 4.2 4.2l.8-.8"/>',
  download: '<path d="M8 2v8"/><path d="m5 7 3 3 3-3"/><path d="M3 13h10"/>',
  pin: '<path d="M8 14s4.5-4.2 4.5-7.5a4.5 4.5 0 1 0-9 0C3.5 9.8 8 14 8 14Z"/><circle cx="8" cy="6.5" r="1.6"/>',
};

const icon = (name) =>
  `<svg class="ch__icon" viewBox="0 0 16 16" width="16" height="16" fill="none"
        stroke="currentColor" stroke-width="1.1" stroke-linecap="round"
        stroke-linejoin="round" aria-hidden="true">${ICON[name] || ''}</svg>`;

export function contactView({ onBack }) {
  const channels = contact.channels.map((c) => {
    const inner = `${icon(c.icon)}<span class="ch__label">${c.label}</span>`;
    if (c.link) {
      const dl = c.download ? ` download="${c.download}"` : '';
      return `<li class="ch"><a class="ch__row" href="${c.link}"${dl} data-cursor="${c.cursor || 'Write to me'}">${inner}</a></li>`;
    }
    return `<li class="ch"><span class="ch__row ch__row--static">${inner}${
      c.note ? `<span class="ch__note u-label">${c.note}</span>` : ''
    }</span></li>`;
  }).join('');

  const html = `
    <div class="page ct">
      <div class="ct__sky" aria-hidden="true"></div>

      <nav class="worlds__crumb u-label" aria-label="Breadcrumb">
        <button class="crumb__link" type="button" data-back>Home</button>
        <span aria-hidden="true">&rsaquo;</span>
        <span aria-current="page">Contact</span>
      </nav>

      <div class="ct__grid">
        <div class="ct__lead">
          <h2 class="ct__title">${contact.title}</h2>
          <p class="ct__body">${contact.body}</p>
          <a class="btn" href="mailto:nikoleugueto@gmail.com" data-cursor="Write to me">
            Get in touch <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
        <div class="ct__channels">
          <ul class="chs">${channels}</ul>
        </div>
      </div>
    </div>`;

  function mount(root) {
    const onClick = (e) => { if (e.target.closest('[data-back]')) onBack(); };
    root.addEventListener('click', onClick);
    requestAnimationFrame(() => { root.querySelector('.page').dataset.ready = 'true'; });
    return () => root.removeEventListener('click', onClick);
  }

  return { id: 'contact', html, mount };
}
