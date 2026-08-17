import { createOptimizedPicture } from '../../scripts/aem.js';
import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  // Convert block rows into UL / LI cards
  const ul = document.createElement('ul');

  [...block.children].forEach((row) => {
    const li = document.createElement('li');

    moveInstrumentation(row, li);

    // Move all row cells into the card
    while (row.firstElementChild) {
      li.append(row.firstElementChild);
    }

    // Identify image and content cells
    [...li.children].forEach((div) => {
      if (
        div.children.length === 1
        && div.querySelector('picture')
      ) {
        div.className = 'startJourney_card-image';
      } else {
        div.className = 'startJourney_card-content';
      }
    });

    ul.append(li);
  });

  // Optimize card images
  ul.querySelectorAll('picture > img').forEach((img) => {
    const optimizedPic = createOptimizedPicture(
      img.src,
      img.alt,
      false,
      [{ width: '750' }]
    );

    moveInstrumentation(
      img,
      optimizedPic.querySelector('img')
    );

    img.closest('picture').replaceWith(optimizedPic);
  });

  // Replace original block content
  block.replaceChildren(ul);
}