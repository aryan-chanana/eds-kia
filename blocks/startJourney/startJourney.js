export default function decorate(block) {
  debugger;
  block.classList.add('start-your-kia-journey');
  debugger;
  console.log('START YOUR KIA JOURNEY LOADED');
}

  cards.forEach((row) => {
    const cells = [...row.children];

    const imageCell = cells[0];
    const titleCell = cells[1];
    const descriptionCell = cells[2];

    // Create card
    const article = document.createElement('article');
    article.className = 'startJourney_cards';

    // Preserve Universal Editor instrumentation
    moveInstrumentation(row, article);

    // Image
    if (imageCell) {
      imageCell.classList.add('startJourney_cards-image');

      const image = imageCell.querySelector('img');

      if (image) {
        image.classList.add('startJourney_cards-icon');
      }

      article.append(imageCell);
    }

    // Title
    if (titleCell) {
      titleCell.classList.add('startJourney_cards-content');

      const title = titleCell.querySelector(
        'h1, h2, h3, h4, h5, h6, strong'
      );

      if (title) {
        title.classList.add('startJourney_cards-title');
      }

      article.append(titleCell);
    }

    // Description / CTA
    if (descriptionCell) {
      descriptionCell.classList.add('startJourney_cards-description');

      const link = descriptionCell.querySelector('a');

      if (link) {
        descriptionCell.classList.add('startJourney_cards-cta');
        link.classList.add('startJourney_cards-link');

        const cardTitle = titleCell
          ?.textContent
          .trim()
          .toLowerCase();

        // Get a Quote CTA
        if (cardTitle === 'get a quote') {
          link.addEventListener('click', (event) => {
            event.preventDefault();
            window.location.href = '/in/buy/get-a-quote.html';
          });
        }
      }

      article.append(descriptionCell);
    }

    // Replace the original Universal Editor row
    row.replaceWith(article);
  }) 
