import { moveInstrumentation } from '../../scripts/scripts.js';

function firstPicture(node) {
  if (!node) return null;
  const picture = node.querySelector('picture');
  if (picture) return picture;
  const img = node.querySelector('img');
  if (!img) return null;
  const wrap = document.createElement('picture');
  wrap.append(img);
  return wrap;
}

function firstHref(node) {
  if (!node) return '';
  const anchor = node.querySelector('a[href]');
  if (anchor) return anchor.getAttribute('href');
  const text = (node.textContent || '').trim();
  if (!text) return '';
  return /^https?:\/\/|^\//i.test(text) ? text : `https://${text}`;
}

function labelFromImage(picture) {
  const img = picture?.querySelector('img');
  const alt = img?.getAttribute('alt');
  return alt && alt.trim() ? alt.trim() : 'Download app';
}

function containsImage(node) {
  return !!node && !!node.querySelector('img, picture');
}

function containsLink(node) {
  return !!node && !!node.querySelector('a[href]');
}

export default function decorate(block) {
  if (block.dataset.adlDecorated === 'true') return;
  block.dataset.adlDecorated = 'true';

  const rows = [...block.children];
  if (!rows.length) return;

  // Every row-or-cell that carries authored content — we don't care whether
  // EDS delivered fields as rows-with-cells or one-row-per-field, we just
  // walk every cell in DOM order and bucket by content shape.
  const cells = rows.flatMap((row) => {
    const children = [...row.children];
    return children.length ? children : [row];
  });

  const pictureCells = cells.filter(containsImage);
  const linkCells = cells.filter((c) => containsLink(c) && !containsImage(c));
  const textCells = cells.filter((c) => !containsImage(c) && !containsLink(c));

  // Header fields, in model order:
  //   phoneImage → first picture,  iconImage → second picture,
  //   title      → first text,     subtitle  → second text.
  const phoneCell = pictureCells[0];
  const iconCell = pictureCells[1];
  const titleCell = textCells[0];
  const subtitleCell = textCells[1];

  // Badge items: any picture past the two header images is a badge image,
  // paired with a badge link in the same DOM order.
  const badgePictureCells = pictureCells.slice(2);
  const badgePairs = badgePictureCells.map((imgCell, i) => ({
    imgCell,
    linkCell: linkCells[i],
  })).filter(({ imgCell, linkCell }) => imgCell && linkCell);

  block.classList.add('app-download-link-block');

  const top = document.createElement('div');
  if (titleCell) {
    const mobileTitle = titleCell.cloneNode(true);
    mobileTitle.className = 'adl-title-mobile';
    top.append(mobileTitle);
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'adl-wrapper';

  if (phoneCell) {
    phoneCell.className = 'adl-phone';
    wrapper.append(phoneCell);
  }

  const body = document.createElement('div');
  body.className = 'adl-body';

  if (titleCell) {
    titleCell.className = 'adl-title';
    body.append(titleCell);
  }

  if (iconCell) {
    iconCell.className = 'adl-icon';
    body.append(iconCell);
  }

  const linksWrap = document.createElement('div');
  linksWrap.className = 'adl-links';

  if (subtitleCell) {
    subtitleCell.className = 'adl-subtitle';
    linksWrap.append(subtitleCell);
  }

  const badgeContainer = document.createElement('div');
  badgeContainer.className = 'adl-badges';

  badgePairs.forEach(({ imgCell, linkCell }) => {
    const picture = firstPicture(imgCell);
    const href = firstHref(linkCell);
    if (!picture || !href) return;

    const img = picture.querySelector('img');
    if (img) img.loading = 'lazy';

    const badge = document.createElement('a');
    badge.className = 'adl-badge';
    badge.href = href;
    badge.target = '_blank';
    badge.rel = 'noopener noreferrer';
    badge.setAttribute('aria-label', labelFromImage(picture));
    moveInstrumentation(imgCell, badge);
    badge.append(picture);
    badgeContainer.append(badge);
  });

  linksWrap.append(badgeContainer);
  body.append(linksWrap);
  wrapper.append(body);

  block.replaceChildren(top, wrapper);
}
