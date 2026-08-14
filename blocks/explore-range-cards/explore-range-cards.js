import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

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

function buildCard(row) {
  const cells = [...row.children];
  const [
    imageCell,
    altCell,
    textCell,
    cta1LinkCell,
    cta1TextCell,
    cta2LinkCell,
    cta2TextCell,
  ] = cells;

  const card = document.createElement('article');
  card.className = 'explore-range-card';
  moveInstrumentation(row, card);

  if (imageCell) {
    const imageWrap = document.createElement('div');
    imageWrap.className = 'explore-range-card-image';
    while (imageCell.firstChild) imageWrap.append(imageCell.firstChild);
    const alt = (altCell && altCell.textContent.trim()) || '';
    if (alt) {
      imageWrap.querySelectorAll('img').forEach((img) => { img.alt = alt; });
    }
    card.append(imageWrap);
  }

  if (textCell) {
    const textWrap = document.createElement('div');
    textWrap.className = 'explore-range-card-text';
    while (textCell.firstChild) textWrap.append(textCell.firstChild);
    card.append(textWrap);
  }

  const ctas = document.createElement('div');
  ctas.className = 'explore-range-card-ctas';
  [
    { linkCell: cta1LinkCell, text: (cta1TextCell && cta1TextCell.textContent.trim()) || '', variant: 'primary' },
    { linkCell: cta2LinkCell, text: (cta2TextCell && cta2TextCell.textContent.trim()) || '', variant: 'secondary' },
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
  if (ctas.children.length) card.append(ctas);

  return card;
}

export default function decorate(block) {
  const cards = [...block.children].map(buildCard);
  block.textContent = '';
  const track = document.createElement('div');
  track.className = 'explore-range-cards-track';
  cards.forEach((c) => track.append(c));
  block.append(track);

  block.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]);
    moveInstrumentation(img, optimizedPic.querySelector('img'));
    img.closest('picture').replaceWith(optimizedPic);
  });
}
