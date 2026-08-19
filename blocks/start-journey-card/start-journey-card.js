import { moveInstrumentation } from '../../scripts/scripts.js';

function extractLink(textCell) {
  if (!textCell) return null;
  const linkPara = [...textCell.querySelectorAll('p')].find((p) => {
    const a = p.querySelector('a[href]');
    return a && p.textContent.trim() === a.textContent.trim();
  });
  if (!linkPara) return null;
  const href = linkPara.querySelector('a').getAttribute('href');
  linkPara.remove();
  return href;
}

export default function decorate(block) {
  const rows = [...block.children];
  const hasAnyImage = rows.some((row) => row.querySelector('img, picture'));

  if (!hasAnyImage) {
    block.classList.add('start-journey-card--heading');
    return;
  }

  rows.forEach((row) => {
    const [imageCell, textCell] = [...row.children];
    const href = extractLink(textCell);

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
