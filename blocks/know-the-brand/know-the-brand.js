import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

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

  if (descriptionCell && descriptionCell.innerHTML.trim()) {
    const description = document.createElement('div');
    description.className = 'know-the-brand-card-description';

    while (descriptionCell.firstChild) {
      description.append(descriptionCell.firstChild);
    }

    body.append(description);
  }

  const anchor = buttonCell?.querySelector('a');

  if (anchor) {
    const label = (anchor.textContent || '').trim();
    const href = anchor.getAttribute('href') || '';

    if (label && href) {
      anchor.className = 'know-the-brand-card-button button';
      anchor.textContent = label;

      body.append(anchor);
    }
  }

  article.append(media, body);

  return article;
}

export default function decorate(block) {
  const rows = [...block.children];

  if (!rows.length) return;

  const [introRow, ...cardRows] = rows;

  const intro = document.createElement('div');
  intro.className = 'know-the-brand-intro';

  const introCells = [...introRow.children];

  const headingText = (introCells[0]?.textContent || '').trim();

  if (headingText) {
    const heading = document.createElement('h2');
    heading.className = 'know-the-brand-heading';
    heading.textContent = headingText;

    moveInstrumentation(introRow, heading);

    intro.append(heading);
  }

  const descriptionCell = introCells[1];

  if (descriptionCell && descriptionCell.innerHTML.trim()) {
    const description = document.createElement('div');
    description.className = 'know-the-brand-description';

    while (descriptionCell.firstChild) {
      description.append(descriptionCell.firstChild);
    }

    intro.append(description);
  }

  const cards = document.createElement('div');
  cards.className = 'know-the-brand-cards';

  cardRows.forEach((row) => {
    cards.append(buildCard(row));
  });

  block.replaceChildren(intro, cards);
}