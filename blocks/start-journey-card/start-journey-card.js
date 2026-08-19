import { moveInstrumentation } from '../../scripts/scripts.js';

function extractHref(cell) {
  if (!cell) return null;
  const anchor = cell.querySelector('a[href]');
  if (anchor) return anchor.getAttribute('href');
  const text = (cell.textContent || '').trim();
  return text || null;
}

export default function decorate(block) {
  const rows = [...block.children];
  const hasAnyImage = rows.some((row) => row.querySelector('img, picture'));

  if (!hasAnyImage) {
    block.classList.add('start-journey-card--heading');
    return;
  }

  rows.forEach((row) => {
    const [imageCell, linkCell, textCell] = [...row.children];
    const href = extractHref(linkCell);

    const item = document.createElement(href ? 'a' : 'div');
    item.className = 'start-journey-card-item';
    if (href) {
      item.href = href;
      item.classList.add('start-journey-card-link');
    }
    moveInstrumentation(row, item);

    if (imageCell) {
      imageCell.classList.add('start-journey-card-image');
      const image = imageCell.querySelector('img');
      if (image) image.classList.add('start-journey-card-icon');
      item.append(imageCell);
    }

    if (textCell) {
      textCell.classList.add('start-journey-card-content');
      const heading = textCell.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) heading.classList.add('start-journey-card-title');
      textCell.querySelectorAll('p').forEach((p) => {
        p.classList.add('start-journey-card-description');
      });
      item.append(textCell);
    }

    row.replaceWith(item);
  });
}
