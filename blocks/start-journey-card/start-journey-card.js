export default function decorate(block) {
  const cards = [...block.children];

  block.classList.add('start-journey-card');

  cards.forEach((card) => {
    card.classList.add('start-journey-card-item');

    const cells = [...card.children];

    const imageCell = cells[0];
    const contentCell = cells[1];

    // Image
    if (imageCell) {
      imageCell.classList.add('start-journey-card-image');

      const image = imageCell.querySelector('img');

      if (image) {
        image.classList.add('start-journey-card-icon');
      }
    }

    // Content
    if (contentCell) {
      contentCell.classList.add('start-journey-card-content');

      // Heading / title
      const heading = contentCell.querySelector(
        'h1, h2, h3, h4, h5, h6',
      );

      if (heading) {
        heading.classList.add('start-journey-card-title');
      }

      // Text and CTA
      const paragraphs = contentCell.querySelectorAll('p');

      paragraphs.forEach((paragraph) => {
        const link = paragraph.querySelector('a');

        if (link) {
          // CTA
          paragraph.classList.add('start-journey-card-cta');
          link.classList.add('start-journey-card-link');

          const linkText = link.textContent.trim().toLowerCase();

          // Get a Quote
          if (linkText === 'get a quote') {
            link.href = '/in/buy/get-a-quote.html';
          }
        } else {
          // Description
          paragraph.classList.add('start-journey-card-description');
        }
      });
    }
  });
}
