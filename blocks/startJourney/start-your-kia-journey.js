export default function decorate(block) {
  const cards = [...block.children];

  block.classList.add('start-your-kia-journey');

  cards.forEach((card) => {
    card.classList.add('start-journey-card');

    const cells = [...card.children];

    const imageCell = cells[0];
    const textCell = cells[1];

    if (imageCell) {
      imageCell.classList.add('start-journey-card-image');
    }

    if (textCell) {
      textCell.classList.add('start-journey-card-content');

      const title = textCell.querySelector('h1, h2, h3, h4, h5, h6');

      if (title) {
        title.classList.add('start-journey-card-title');
      }

      const paragraphs = textCell.querySelectorAll('p');

      paragraphs.forEach((paragraph) => {
        const link = paragraph.querySelector('a');

        if (link) {
          paragraph.classList.add('start-journey-card-cta');
          link.classList.add('start-journey-card-link');

          // Get the card title
          const cardTitle = title?.textContent.trim().toLowerCase();

          // Redirect Get a Quote CTA
          if (cardTitle === 'get a quote') {
            link.addEventListener('click', (event) => {
              event.preventDefault();

              window.location.href = '/in/buy/get-a-quote.html';
            });
          }
        } else {
          paragraph.classList.add('start-journey-card-description');
        }
      });
    }
  });
}