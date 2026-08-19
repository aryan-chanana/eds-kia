export default function decorate(block) {
  block.classList.add('app-download-link-block');
  const rows = [...block.children];
  if (!rows.length) return;

  let phoneAssigned = false;
  let iconAssigned = false;
  let titleAssigned = false;
  let subtitleAssigned = false;

  rows.forEach((row) => {
    const hasImg = !!row.querySelector('img, picture');
    const hasLink = !!row.querySelector('a[href]');

    // Badge row: has BOTH an image and a link — turn the existing anchor
    // into the clickable badge with the picture as its only visible child.
    if (hasImg && hasLink) {
      row.classList.add('adl-badge-row');
      const picture = row.querySelector('picture') || row.querySelector('img');
      const anchor = row.querySelector('a[href]');
      if (picture && anchor && !anchor.contains(picture)) {
        anchor.replaceChildren(picture);
        anchor.classList.add('adl-badge');
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        const img = picture.querySelector ? picture.querySelector('img') : null;
        if (img) img.loading = 'lazy';
      }
      return;
    }

    // Picture-only rows: phone (first), then icon (second)
    if (hasImg) {
      if (!phoneAssigned) {
        row.classList.add('adl-phone');
        phoneAssigned = true;
      } else if (!iconAssigned) {
        row.classList.add('adl-icon');
        iconAssigned = true;
      }
      return;
    }

    // Text-only rows: title (first), then subtitle (second)
    if (!hasLink) {
      if (!titleAssigned) {
        row.classList.add('adl-title');
        titleAssigned = true;
      } else if (!subtitleAssigned) {
        row.classList.add('adl-subtitle');
        subtitleAssigned = true;
      }
    }
  });
}
