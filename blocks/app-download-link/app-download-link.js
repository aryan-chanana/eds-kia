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

function cellWithClass(source, className) {
  if (!source) return null;
  const clone = source.cloneNode(true);
  clone.className = className;
  return clone;
}

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // A badge row has BOTH an image and a link inside it — that's a badge item.
  const badgeRows = rows.filter((row) => (
    row.querySelector('img, picture') && row.querySelector('a[href]')
  ));
  const headerRows = rows.filter((row) => !badgeRows.includes(row));

  // Header field cells can arrive either as cells in one row or as one-cell rows.
  // Flatten them and classify by content: pictures vs text.
  const headerCells = headerRows.flatMap((row) => [...row.children]);
  const pictureCells = headerCells.filter((c) => c.querySelector('img, picture'));
  const textCells = headerCells.filter((c) => !c.querySelector('img, picture'));

  const phoneCell = pictureCells[0];
  const iconCell = pictureCells[1];
  const titleCell = textCells[0];
  const subtitleCell = textCells[1];

  block.classList.add('app-download-link-block');

  const top = document.createElement('div');
  const mobileTitle = cellWithClass(titleCell, 'adl-title-mobile');
  if (mobileTitle) top.append(mobileTitle);

  const wrapper = document.createElement('div');
  wrapper.className = 'adl-wrapper';

  const phone = cellWithClass(phoneCell, 'adl-phone');
  if (phone) wrapper.append(phone);

  const body = document.createElement('div');
  body.className = 'adl-body';

  const title = cellWithClass(titleCell, 'adl-title');
  if (title) body.append(title);

  const icon = cellWithClass(iconCell, 'adl-icon');
  if (icon) body.append(icon);

  const linksWrap = document.createElement('div');
  linksWrap.className = 'adl-links';

  const subtitle = cellWithClass(subtitleCell, 'adl-subtitle');
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
    badge.append(picture);
    badgeContainer.append(badge);
  });

  linksWrap.append(badgeContainer);
  body.append(linksWrap);
  wrapper.append(body);

  block.textContent = '';
  block.append(top);
  block.append(wrapper);
}
