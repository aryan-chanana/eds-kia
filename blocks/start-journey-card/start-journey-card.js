import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  // No image authored anywhere in this block → whole block is a heading.
  const picture = block.querySelector('picture, img');
  if (!picture) {
    block.classList.add('start-journey-card-heading');
    return;
  }

  // Pull the imageLink out — it renders as an <a> whose text equals its href
  // (or is otherwise the only content of its wrapper). Removing its wrapper
  // hides the raw URL from view.
  let href = null;
  const anchors = [...block.querySelectorAll('a[href]')];
  for (let i = 0; i < anchors.length; i += 1) {
    const anchor = anchors[i];
    const wrapper = anchor.closest('p, div');
    if (wrapper && wrapper.textContent.trim() === anchor.textContent.trim()) {
      href = anchor.getAttribute('href');
      wrapper.remove();
      break;
    }
  }

  // Build one card from whatever's left across every row.
  const item = document.createElement(href ? 'a' : 'div');
  item.className = 'start-journey-card-item';
  if (href) {
    item.href = href;
    item.classList.add('start-journey-card-link');
  }
  moveInstrumentation(block, item);

  const imageWrap = document.createElement('div');
  imageWrap.className = 'start-journey-card-image';
  const pic = picture.closest('picture') || picture;
  const img = pic.tagName === 'IMG' ? pic : pic.querySelector('img');
  if (img) img.classList.add('start-journey-card-icon');
  imageWrap.append(pic);
  item.append(imageWrap);

  const content = document.createElement('div');
  content.className = 'start-journey-card-content';
  rows.forEach((row) => {
    [...row.children].forEach((cell) => {
      if (cell.querySelector('picture, img')) return;
      if (!cell.textContent.trim() && !cell.querySelector('img')) return;
      while (cell.firstChild) content.append(cell.firstChild);
    });
  });
  const heading = content.querySelector('h1, h2, h3, h4, h5, h6');
  if (heading) heading.classList.add('start-journey-card-title');
  content.querySelectorAll('p').forEach((p) => {
    p.classList.add('start-journey-card-description');
  });
  item.append(content);

  block.replaceChildren(item);
}
