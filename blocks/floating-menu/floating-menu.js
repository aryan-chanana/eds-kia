import { moveInstrumentation } from '../../scripts/scripts.js';

const ICONS = {
  'icon-vehicle-solid': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-8l-2.08-5.99ZM6.5 16a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3Zm11 0a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3ZM5 11l1.5-4.5h11L19 11H5Z"/></svg>',
  'icon-handle': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><path d="M12 3v7M4.5 12h5.5M19.5 12H14M15 19l-2-5M9 19l2-5"/></svg>',
  'icon-schedule': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18M9 15l2 2 4-4"/></svg>',
  'icon-brochure': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2Z"/><path d="M9 4v16M15 6v16"/></svg>',
  'icon-chat': '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false"><path fill="currentColor" d="M20 2H4a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/></svg>',
};

/*
 * Floating Menu block
 * Authored as a repeatable table: each row = one menu item
 * Columns per row: Text | Icon | Link
 */
export default function decorate(block) {
  const items = [...block.children]
    .map((row) => {
      const cells = [...row.children];
      const [textCell, iconCell, linkCell] = cells;

      const anchorInText = textCell?.querySelector('a');
      const label = (anchorInText?.textContent || textCell?.textContent || '').trim();
      const icon = (iconCell?.textContent || '').trim();
      const href = (
        linkCell?.querySelector('a')?.getAttribute('href')
        || linkCell?.textContent
        || anchorInText?.getAttribute('href')
        || '#'
      ).trim();

      return {
        label, icon, href, row,
      };
    });

  // clear the authored table markup, we rebuild the original structure below
  block.textContent = '';

  const heading = document.createElement('h2');
  heading.className = 'a11y';
  heading.textContent = 'Quick Menu';

  const list = document.createElement('ul');
  list.className = 'floating-menu-list';

  items.forEach(({
    label, icon, href, row,
  }) => {
    const li = document.createElement('li');
    li.className = 'floating-menu-item';
    moveInstrumentation(row, li);

    const a = document.createElement('a');
    a.className = 'floating-menu-link';
    a.href = href;

    const text = document.createElement('span');
    text.className = 'text';
    text.textContent = label;

    const iconEl = document.createElement('span');
    iconEl.className = `icon${icon ? ` ${icon}` : ''}`;
    if (icon && ICONS[icon]) {
      iconEl.innerHTML = ICONS[icon];
    }

    a.append(text, iconEl);
    li.append(a);
    list.append(li);
  });

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'cta-toggle';

  const buttonIcon = document.createElement('span');
  buttonIcon.className = 'button-icon';

  const toggleLabel = document.createElement('span');
  toggleLabel.className = 'a11y';
  toggleLabel.textContent = 'Open';

  toggle.append(buttonIcon, toggleLabel);

  const circle = document.createElement('div');
  circle.className = 'circle';

  block.append(heading, list, toggle, circle);

  toggle.addEventListener('click', () => {
    block.classList.toggle('is-active');
  });
}
