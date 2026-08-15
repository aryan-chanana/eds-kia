import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function buildCard(row) {
  const [
    tabCell,
    imageCell,
    altCell,
    titleCell,
    textCell,
    ctaTextCell,
    ctaLinkCell,
  ] = [...row.children];

  const tabLabel = (tabCell?.textContent || '').trim();

  const article = document.createElement('article');
  article.className = 'explore-range-card';
  moveInstrumentation(row, article);

  const media = document.createElement('div');
  media.className = 'explore-range-card-image';
  const img = imageCell?.querySelector('img');
  if (img) {
    const alt = (altCell?.textContent || '').trim() || img.alt || '';
    const optimized = createOptimizedPicture(img.src, alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimized.querySelector('img'));
    media.append(optimized);
  }

  const body = document.createElement('div');
  body.className = 'explore-range-card-body';

  const title = (titleCell?.textContent || '').trim();
  if (title) {
    const h3 = document.createElement('h3');
    h3.className = 'explore-range-card-title';
    h3.textContent = title;
    body.append(h3);
  }

  if (textCell && textCell.innerHTML.trim()) {
    const desc = document.createElement('div');
    desc.className = 'explore-range-card-text';
    while (textCell.firstChild) desc.append(textCell.firstChild);
    body.append(desc);
  }

  const ctaLabel = (ctaTextCell?.textContent || '').trim();
  const ctaAnchor = ctaLinkCell?.querySelector('a');
  const ctaHref = ctaAnchor?.getAttribute('href') || (ctaLinkCell?.textContent || '').trim();
  if (ctaLabel && ctaHref) {
    const cta = document.createElement('a');
    cta.className = 'explore-range-card-cta button';
    cta.href = ctaHref;
    cta.textContent = ctaLabel;
    body.append(cta);
  }

  article.append(media, body);
  return { tabLabel, article };
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const [headingRow, ...cardRows] = rows;

  const heading = document.createElement('h2');
  heading.className = 'explore-range-heading';
  heading.textContent = (headingRow.textContent || '').trim();
  moveInstrumentation(headingRow, heading);

  const groups = new Map();
  cardRows.forEach((row) => {
    const { tabLabel, article } = buildCard(row);
    const key = tabLabel || 'Tab';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(article);
  });

  const tablist = document.createElement('div');
  tablist.className = 'explore-range-tablist';
  tablist.setAttribute('role', 'tablist');

  const panels = document.createElement('div');
  panels.className = 'explore-range-panels';

  const tabs = [];
  const tabPanels = [];
  [...groups.entries()].forEach(([label, cards], index) => {
    const tabId = `explore-range-tab-${index}`;
    const panelId = `explore-range-panel-${index}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'explore-range-tab';
    button.id = tabId;
    button.textContent = label;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panelId);
    button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    button.setAttribute('tabindex', index === 0 ? '0' : '-1');
    tablist.append(button);
    tabs.push(button);

    const panel = document.createElement('div');
    panel.className = 'explore-range-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', tabId);
    if (index !== 0) panel.hidden = true;
    const grid = document.createElement('div');
    grid.className = 'explore-range-grid';
    cards.forEach((c) => grid.append(c));
    panel.append(grid);
    panels.append(panel);
    tabPanels.push(panel);
  });

  const activate = (nextIndex) => {
    tabs.forEach((tab, i) => {
      const selected = i === nextIndex;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.setAttribute('tabindex', selected ? '0' : '-1');
      tabPanels[i].hidden = !selected;
    });
    tabs[nextIndex].focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        activate((index + 1) % tabs.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        activate((index - 1 + tabs.length) % tabs.length);
      } else if (e.key === 'Home') {
        e.preventDefault();
        activate(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        activate(tabs.length - 1);
      }
    });
  });

  block.replaceChildren(heading, tablist, panels);
}
