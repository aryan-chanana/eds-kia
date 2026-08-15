import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function buildCta(textCell, linkCell, variant) {
  const label = (textCell?.textContent || '').trim();
  const anchor = linkCell?.querySelector('a');
  const href = anchor?.getAttribute('href') || (linkCell?.textContent || '').trim();
  if (!label || !href) return null;
  const cta = document.createElement('a');
  cta.className = `explore-range-card-cta explore-range-card-cta-${variant} button`;
  cta.href = href;
  cta.textContent = label;
  return cta;
}

function buildCard(row) {
  const [
    tabCell,
    imageCell,
    altCell,
    titleCell,
    textCell,
    cta1LinkCell,
    cta1TextCell,
    cta2LinkCell,
    cta2TextCell,
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

  const cta1 = buildCta(cta1TextCell, cta1LinkCell, 'primary');
  const cta2 = buildCta(cta2TextCell, cta2LinkCell, 'secondary');
  if (cta1 || cta2) {
    const ctas = document.createElement('div');
    ctas.className = 'explore-range-card-ctas';
    if (cta1) ctas.append(cta1);
    if (cta2) ctas.append(cta2);
    body.append(ctas);
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

    const carousel = document.createElement('div');
    carousel.className = 'explore-range-carousel';

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'explore-range-carousel-arrow explore-range-carousel-prev';
    prev.setAttribute('aria-label', 'Previous cars');
    prev.innerHTML = '<span aria-hidden="true">&#8249;</span>';

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'explore-range-carousel-arrow explore-range-carousel-next';
    next.setAttribute('aria-label', 'Next cars');
    next.innerHTML = '<span aria-hidden="true">&#8250;</span>';

    const track = document.createElement('div');
    track.className = 'explore-range-track';
    cards.forEach((c) => track.append(c));

    carousel.append(prev, track, next);
    panel.append(carousel);
    panels.append(panel);
    tabPanels.push(panel);

    const isCarouselActive = () => window.matchMedia('(min-width: 600px)').matches;
    const step = () => {
      const first = track.querySelector('.explore-range-card');
      if (!first) return track.clientWidth;
      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      return first.offsetWidth + gap;
    };
    const updateArrows = () => {
      if (!isCarouselActive()) {
        prev.hidden = true;
        next.hidden = true;
        return;
      }
      const canScroll = track.scrollWidth - track.clientWidth > 1;
      if (!canScroll) {
        prev.hidden = true;
        next.hidden = true;
        return;
      }
      prev.hidden = track.scrollLeft <= 1;
      next.hidden = track.scrollLeft + track.clientWidth >= track.scrollWidth - 1;
    };
    prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
    next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
    track.addEventListener('scroll', updateArrows, { passive: true });
    window.addEventListener('resize', updateArrows);
    requestAnimationFrame(updateArrows);
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
