import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

function hasCardContent(row) {
  return [...row.children].some((cell) => (
    cell.textContent.trim()
    || cell.querySelector('img')
    || cell.querySelector('a')
  ));
}

function buildCard(row) {
  const [
    imageCell,
    titleCell,
    descriptionCell,
    buttonCell,
  ] = [...row.children];

  const article = document.createElement('article');
  article.className = 'know-the-brand-card';

  moveInstrumentation(row, article);

  const media = document.createElement('div');
  media.className = 'know-the-brand-card-image';

  const img = imageCell?.querySelector('img');

  if (img) {
    const optimized = createOptimizedPicture(
      img.src,
      img.alt || '',
      false,
      [{ width: '750' }],
    );

    moveInstrumentation(img, optimized.querySelector('img'));
    media.append(optimized);
  }

  const body = document.createElement('div');
  body.className = 'know-the-brand-card-body';

  const title = (titleCell?.textContent || '').trim();

  if (title) {
    const heading = document.createElement('h3');
    heading.className = 'know-the-brand-card-title';
    heading.textContent = title;
    body.append(heading);
  }

  if (descriptionCell?.innerHTML.trim()) {
    const description = document.createElement('div');
    description.className = 'know-the-brand-card-description';

    while (descriptionCell.firstChild) {
      description.append(descriptionCell.firstChild);
    }

    body.append(description);
  }

  const buttonText = (buttonCell?.textContent || '').trim();

  if (buttonText) {
    const button = document.createElement('a');
    button.className = 'know-the-brand-card-button';
    button.href = '#';
    button.textContent = buttonText;
    button.setAttribute('aria-label', buttonText);

    body.append(button);
  }

  article.append(media, body);

  return article;
}

export default function decorate(block) {
  const rows = [...block.children];

  if (!rows.length) return;

  const [headingRow, descriptionRow, ...cardRows] = rows;

  const heading = document.createElement('h2');
  heading.className = 'know-the-brand-heading';
  heading.textContent = (headingRow?.textContent || '').trim();

  moveInstrumentation(headingRow, heading);

  const description = document.createElement('div');
  description.className = 'know-the-brand-description';

  if (descriptionRow) {
    while (descriptionRow.firstChild) {
      description.append(descriptionRow.firstChild);
    }

    moveInstrumentation(descriptionRow, description);
  }

  const carousel = document.createElement('div');
  carousel.className = 'know-the-brand-carousel';

  const prev = document.createElement('button');
  prev.type = 'button';
  prev.className = 'know-the-brand-arrow know-the-brand-prev';
  prev.setAttribute('aria-label', 'Previous cards');
  prev.innerHTML = '&#8592;';

  const next = document.createElement('button');
  next.type = 'button';
  next.className = 'know-the-brand-arrow know-the-brand-next';
  next.setAttribute('aria-label', 'Next cards');
  next.innerHTML = '&#8594;';

  const track = document.createElement('div');
  track.className = 'know-the-brand-track';

  cardRows
    .filter(hasCardContent)
    .forEach((row) => {
      track.append(buildCard(row));
    });

  carousel.append(prev, track, next);

  const getStep = () => {
    const card = track.querySelector('.know-the-brand-card');

    if (!card) {
      return track.clientWidth;
    }

    const gap = parseFloat(
      getComputedStyle(track).columnGap,
    ) || 0;

    return card.offsetWidth + gap;
  };

  const updateArrows = () => {
    const canScroll = track.scrollWidth - track.clientWidth > 1;

    if (!canScroll) {
      prev.hidden = true;
      next.hidden = true;
      return;
    }

    prev.hidden = track.scrollLeft <= 1;
    next.hidden = (
      track.scrollLeft + track.clientWidth
      >= track.scrollWidth - 1
    );
  };

  prev.addEventListener('click', () => {
    track.scrollBy({
      left: -getStep(),
      behavior: 'smooth',
    });
  });

  next.addEventListener('click', () => {
    track.scrollBy({
      left: getStep(),
      behavior: 'smooth',
    });
  });

  track.addEventListener('scroll', updateArrows, {
    passive: true,
  });

  window.addEventListener('resize', updateArrows);

  requestAnimationFrame(updateArrows);

  block.replaceChildren(
    heading,
    description,
    carousel,
  );
}
