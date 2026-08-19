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

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // Header rows: block-level fields, one field per row (single cell each).
  // Badge rows: block items, one item per row with 2 cells [image, link].
  const headerRows = rows.filter((row) => row.children.length < 2);
  const badgeRows = rows.filter((row) => row.children.length >= 2);
  const [phoneRow, titleRow, iconRow, subtitleRow] = headerRows;

  block.classList.add('app-download-link-block');

  const top = document.createElement('div');
  if (titleRow) {
    const mobileTitle = titleRow.cloneNode(true);
    mobileTitle.className = 'adl-title-mobile';
    top.append(mobileTitle);
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'adl-wrapper';

  if (phoneRow) {
    phoneRow.className = 'adl-phone';
    wrapper.append(phoneRow);
  }

  const body = document.createElement('div');
  body.className = 'adl-body';

  if (titleRow) {
    titleRow.className = 'adl-title';
    body.append(titleRow);
  }

  if (iconRow) {
    iconRow.className = 'adl-icon';
    body.append(iconRow);
  }

  const linksWrap = document.createElement('div');
  linksWrap.className = 'adl-links';

  if (subtitleRow) {
    subtitleRow.className = 'adl-subtitle';
    linksWrap.append(subtitleRow);
  }

  const badgeContainer = document.createElement('div');
  badgeContainer.className = 'adl-badges';

  badgeRows.forEach((row) => {
    const [imageCell, linkCell] = [...row.children];
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
