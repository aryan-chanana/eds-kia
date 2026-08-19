import { moveInstrumentation } from '../../scripts/scripts.js';

function firstPicture(cell) {
  if (!cell) return null;
  const picture = cell.querySelector('picture');
  if (picture) return picture;
  const img = cell.querySelector('img');
  if (!img) return null;
  const wrap = document.createElement('picture');
  wrap.append(img);
  return wrap;
}

function firstHref(cell) {
  if (!cell) return '';
  const anchor = cell.querySelector('a[href]');
  if (anchor) return anchor.getAttribute('href');
  const text = (cell.textContent || '').trim();
  if (!text) return '';
  return /^https?:\/\//i.test(text) ? text : `https://${text}`;
}

function labelFromImage(picture) {
  const img = picture?.querySelector('img');
  const alt = img?.getAttribute('alt');
  return alt && alt.trim() ? alt.trim() : 'Download app';
}

function wrapCell(cell, className) {
  if (!cell) return null;
  cell.className = className;
  return cell;
}

export default function decorate(block) {
  if (block.dataset.adlDecorated === 'true') return;
  block.dataset.adlDecorated = 'true';

  const rows = [...block.children];
  if (!rows.length) return;

  // A badge row contains BOTH an image and a link — that pattern uniquely
  // identifies a badge item regardless of how EDS split fields into rows.
  const badgeRows = rows.filter((row) => (
    row.querySelector('img, picture') && row.querySelector('a[href]')
  ));
  const headerRows = rows.filter((row) => !badgeRows.includes(row));

  // Header cells can arrive in one row or spread across single-cell rows;
  // flatten and pick by content type.
  const headerCells = headerRows.flatMap((row) => [...row.children]);
  const pictureCells = headerCells.filter((c) => c.querySelector('img, picture'));
  const textCells = headerCells.filter((c) => !c.querySelector('img, picture'));

  const phoneCell = pictureCells[0];
  const iconCell = pictureCells[1];
  const titleCell = textCells[0];
  const subtitleCell = textCells[1];

  block.classList.add('app-download-link-block');

  const top = document.createElement('div');
  if (titleCell) {
    const mobileTitle = titleCell.cloneNode(true);
    mobileTitle.className = 'adl-title-mobile';
    top.append(mobileTitle);
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'adl-wrapper';

  const phone = wrapCell(phoneCell, 'adl-phone');
  if (phone) wrapper.append(phone);

  const body = document.createElement('div');
  body.className = 'adl-body';

  const title = wrapCell(titleCell, 'adl-title');
  if (title) body.append(title);

  const icon = wrapCell(iconCell, 'adl-icon');
  if (icon) body.append(icon);

  const linksWrap = document.createElement('div');
  linksWrap.className = 'adl-links';

  const subtitle = wrapCell(subtitleCell, 'adl-subtitle');
  if (subtitle) linksWrap.append(subtitle);

  const badgeContainer = document.createElement('div');
  badgeContainer.className = 'adl-badges';

  badgeRows.forEach((row) => {
    const cells = [...row.children];
    const imageCell = cells.find((c) => c.querySelector('img, picture'));
    const linkCell = cells.find((c) => c.querySelector('a[href]'));
    const picture = firstPicture(imageCell);
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
    moveInstrumentation(row, badge);
    badge.append(picture);
    badgeContainer.append(badge);
  });

  linksWrap.append(badgeContainer);
  body.append(linksWrap);
  wrapper.append(body);

  block.replaceChildren(top, wrapper);
}
