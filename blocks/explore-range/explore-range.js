import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function createArrow(direction, label) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `explore-range-arrow explore-range-arrow-${direction}`;
  btn.setAttribute('aria-label', label);
  const points = direction === 'prev' ? '15 6 9 12 15 18' : '9 6 15 12 9 18';
  btn.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><polyline points="${points}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  return btn;
}

function extractAnchor(cell) {
  if (!cell) return null;
  const anchor = cell.querySelector('a');
  if (anchor && anchor.getAttribute('href')) return anchor;
  const href = cell.textContent.trim();
  if (!href) return null;
  const a = document.createElement('a');
  a.href = href;
  a.textContent = href;
  return a;
}

function buildCard(cardData) {
  const cardEl = document.createElement('article');
  cardEl.className = 'explore-range-card';
  moveInstrumentation(cardData.row, cardEl);

  const imageWrap = document.createElement('div');
  imageWrap.className = 'explore-range-card-image';
  while (cardData.imageCell.firstChild) imageWrap.append(cardData.imageCell.firstChild);
  const alt = cardData.altText;
  if (alt) {
    imageWrap.querySelectorAll('img').forEach((img) => { img.alt = alt; });
  }
  cardEl.append(imageWrap);

  const textWrap = document.createElement('div');
  textWrap.className = 'explore-range-card-text';
  while (cardData.textCell.firstChild) textWrap.append(cardData.textCell.firstChild);
  cardEl.append(textWrap);

  const ctas = document.createElement('div');
  ctas.className = 'explore-range-card-ctas';
  [
    { linkCell: cardData.cta1LinkCell, text: cardData.cta1Text, variant: 'primary' },
    { linkCell: cardData.cta2LinkCell, text: cardData.cta2Text, variant: 'secondary' },
  ].forEach(({ linkCell, text, variant }) => {
    const anchor = extractAnchor(linkCell);
    if (!anchor) return;
    if (text) anchor.textContent = text;
    anchor.classList.add('button', variant);
    const wrapper = document.createElement('p');
    wrapper.className = 'button-wrapper';
    wrapper.append(anchor);
    ctas.append(wrapper);
  });
  if (ctas.children.length) cardEl.append(ctas);

  return cardEl;
}

function buildTabPanel(tabName, cards, index) {
  const panel = document.createElement('div');
  panel.className = 'explore-range-panel';
  panel.id = `explore-range-panel-${index}`;
  panel.setAttribute('role', 'tabpanel');
  panel.setAttribute('aria-labelledby', `explore-range-tab-${index}`);
  panel.hidden = index !== 0;

  const viewport = document.createElement('div');
  viewport.className = 'explore-range-viewport';
  const track = document.createElement('div');
  track.className = 'explore-range-track';
  cards.forEach((c) => track.append(buildCard(c)));
  viewport.append(track);

  const prev = createArrow('prev', `Previous ${tabName} vehicles`);
  const next = createArrow('next', `Next ${tabName} vehicles`);

  panel.append(prev, viewport, next);
  return panel;
}

function setupCarousel(panel) {
  const viewport = panel.querySelector('.explore-range-viewport');
  const track = panel.querySelector('.explore-range-track');
  const prev = panel.querySelector('.explore-range-arrow-prev');
  const next = panel.querySelector('.explore-range-arrow-next');
  if (!viewport || !track || !prev || !next) return;

  const step = () => {
    const first = track.firstElementChild;
    if (!first) return 0;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    return first.getBoundingClientRect().width + gap;
  };

  const update = () => {
    const cardCount = track.children.length;
    const first = track.firstElementChild;
    if (!first) return;
    const cardWidth = first.getBoundingClientRect().width;
    const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
    const visible = cardWidth > 0
      ? Math.max(1, Math.round((viewport.clientWidth + gap) / (cardWidth + gap)))
      : 1;
    const stacked = getComputedStyle(track).flexDirection === 'column';
    const needsCarousel = !stacked && cardCount > visible;

    panel.classList.toggle('is-carousel', needsCarousel);
    panel.classList.toggle('is-stacked', stacked);

    if (!needsCarousel) {
      prev.hidden = true;
      next.hidden = true;
      return;
    }
    const maxScroll = track.scrollWidth - viewport.clientWidth;
    prev.hidden = viewport.scrollLeft <= 2;
    next.hidden = viewport.scrollLeft >= maxScroll - 2;
  };

  prev.addEventListener('click', () => {
    viewport.scrollBy({ left: -step(), behavior: 'smooth' });
  });
  next.addEventListener('click', () => {
    viewport.scrollBy({ left: step(), behavior: 'smooth' });
  });
  viewport.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(update);
    ro.observe(viewport);
  }
  update();
}

function setupTabs(tabList, panels) {
  const tabs = [...tabList.querySelectorAll('.explore-range-tab')];

  const activate = (target) => {
    tabs.forEach((t) => {
      const active = t === target;
      t.setAttribute('aria-selected', active ? 'true' : 'false');
      t.tabIndex = active ? 0 : -1;
    });
    const targetPanelId = target.getAttribute('aria-controls');
    panels.querySelectorAll('.explore-range-panel').forEach((p) => {
      p.hidden = p.id !== targetPanelId;
    });
    const activePanel = panels.querySelector(`#${targetPanelId}`);
    if (activePanel) {
      const viewport = activePanel.querySelector('.explore-range-viewport');
      if (viewport) viewport.scrollLeft = 0;
      activePanel.dispatchEvent(new Event('explore-range:activate'));
    }
  };

  tabList.addEventListener('click', (e) => {
    const btn = e.target.closest('.explore-range-tab');
    if (btn) activate(btn);
  });

  tabList.addEventListener('keydown', (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const currentIndex = tabs.findIndex((t) => t.tabIndex === 0);
    let nextIndex = currentIndex;
    if (e.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (e.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
    if (e.key === 'Home') nextIndex = 0;
    if (e.key === 'End') nextIndex = tabs.length - 1;
    tabs[nextIndex].focus();
    activate(tabs[nextIndex]);
  });
}

function rowIsCard(cells) {
  if (cells.length < 4) return false;
  return cells.some((cell) => cell.querySelector('picture, img'));
}

function parseBlock(block) {
  let heading = block.dataset.heading || '';
  const items = [];
  let currentTab = null;

  [...block.children].forEach((row) => {
    const cells = [...row.children];
    if (!cells.length) return;

    if (rowIsCard(cells)) {
      const [
        imageCell,
        altCell,
        textCell,
        cta1LinkCell,
        cta1TextCell,
        cta2LinkCell,
        cta2TextCell,
      ] = cells;
      items.push({
        type: 'card',
        row,
        tabName: currentTab || 'Default',
        imageCell,
        altText: (altCell && altCell.textContent.trim()) || '',
        textCell: textCell || document.createElement('div'),
        cta1LinkCell: cta1LinkCell || document.createElement('div'),
        cta1Text: (cta1TextCell && cta1TextCell.textContent.trim()) || '',
        cta2LinkCell: cta2LinkCell || document.createElement('div'),
        cta2Text: (cta2TextCell && cta2TextCell.textContent.trim()) || '',
      });
      return;
    }

    if (cells.length === 1) {
      const value = cells[0].textContent.trim();
      if (!value) return;
      if (!heading && !items.length && currentTab === null) {
        heading = value;
      } else {
        currentTab = value;
      }
    }
  });

  return { heading, items };
}

export default function decorate(block) {
  const { heading, items } = parseBlock(block);

  const tabOrder = [];
  const grouped = new Map();
  items.filter((i) => i.type === 'card').forEach((card) => {
    if (!grouped.has(card.tabName)) {
      grouped.set(card.tabName, []);
      tabOrder.push(card.tabName);
    }
    grouped.get(card.tabName).push(card);
  });

  block.textContent = '';

  if (heading) {
    const h = document.createElement('h2');
    h.className = 'explore-range-heading';
    h.textContent = heading;
    block.append(h);
  }

  if (!tabOrder.length) return;

  const tabList = document.createElement('div');
  tabList.className = 'explore-range-tabs';
  tabList.setAttribute('role', 'tablist');

  const panels = document.createElement('div');
  panels.className = 'explore-range-panels';

  tabOrder.forEach((name, index) => {
    const tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = 'explore-range-tab';
    tabBtn.id = `explore-range-tab-${index}`;
    tabBtn.setAttribute('role', 'tab');
    tabBtn.setAttribute('aria-controls', `explore-range-panel-${index}`);
    tabBtn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    tabBtn.tabIndex = index === 0 ? 0 : -1;
    tabBtn.textContent = name;
    tabList.append(tabBtn);

    panels.append(buildTabPanel(name, grouped.get(name), index));
  });

  if (tabOrder.length > 1 && tabOrder[0] !== 'Default') block.append(tabList);
  block.append(panels);

  block.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });

  if (tabList.isConnected) setupTabs(tabList, panels);
  panels.querySelectorAll('.explore-range-panel').forEach((panel) => {
    setupCarousel(panel);
    panel.addEventListener('explore-range:activate', () => {
      const viewport = panel.querySelector('.explore-range-viewport');
      if (viewport) viewport.dispatchEvent(new Event('scroll'));
    });
  });
}
