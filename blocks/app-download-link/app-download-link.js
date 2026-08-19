function getPicture(row) {
  if (!row) return null;
  const existing = row.querySelector('picture');
  if (existing) return existing;

  const img = row.querySelector('img');
  if (!img) return null;

  const picture = document.createElement('picture');
  picture.append(img);
  return picture;
}

function getHref(row) {
  if (!row) return '';
  const anchor = row.querySelector('a');
  if (anchor?.getAttribute('href')) return anchor.getAttribute('href');

  const text = row.textContent.trim();
  if (!text) return '';
  return /^https?:\/\//i.test(text) ? text : `https://${text}`;
}

function getLabel(row) {
  return row ? row.textContent.trim() : '';
}

export default function decorate(block) {
  const rows = [...block.children];

  // Fixed row order authored in the block table, one field per row:
  // 1. Background image (optional)
  // 2. Phone mockup image
  // 3. Title text
  // 4. Feature banner image
  // 5. Subtitle text
  // 6+. Up to 4 store badges, each as 3 consecutive rows: image, link, label
  const [bgRow, phoneRow, titleRow, iconRow, subtitleRow, ...badgeRows] = rows;

  // 1. Optional section background image -> block background, discard row
  if (bgRow) {
    const bgImg = bgRow.querySelector('img');
    if (bgImg) {
      block.style.backgroundImage = `url('${bgImg.currentSrc || bgImg.src}')`;
      block.classList.add('has-bg-image');
    }
    bgRow.remove();
  }

  block.classList.add('app-download-link-block');
  const top = document.createElement('div');
  const mobileTitle = titleRow.cloneNode(true);
  if (mobileTitle) {
    mobileTitle.className = 'adl-title-mobile';
    top.append(mobileTitle);
  }

  const wrapper = document.createElement('div');
  wrapper.className = 'adl-wrapper';

  // 2. Phone mockup (left column)
  if (phoneRow) {
    phoneRow.className = 'adl-phone';
    wrapper.append(phoneRow);
  }

  // Right column: title, feature banner, subtitle, badges
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

  // 3. Up to 4 store badges — each badge is 3 rows: image, link, label
  const badgeContainer = document.createElement('div');
  badgeContainer.className = 'adl-badges';

  for (let i = 0; i < badgeRows.length; i += 3) {
    const [imgRow, linkRow, labelRow] = badgeRows.slice(i, i + 3);

    const picture = getPicture(imgRow);
    const href = getHref(linkRow);

    // Skip empty/unfilled badge slots (author left 3rd/4th badge blank)
    if (picture && href) {
      const img = picture.querySelector('img');
      if (img) {
        img.loading = 'lazy';
      }

      const badge = document.createElement('a');
      badge.className = 'adl-badge';
      badge.href = href;
      badge.target = '_blank';
      badge.rel = 'noopener noreferrer';
      badge.setAttribute('aria-label', getLabel(labelRow) || 'Download app');
      badge.append(picture);
      badgeContainer.append(badge);
    }
  }

  linksWrap.append(badgeContainer);
  body.append(linksWrap);
  wrapper.append(body);

  block.textContent = '';
  block.append(top);
  block.append(wrapper);
}
