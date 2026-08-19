export default function decorate(block) {
  const cards = [...block.children];

  block.classList.add('startJourney');

  cards.forEach((card) => {
    card.classList.add('startJourneycard');

    const cells = [...card.children];

    const imageCell = cells[0];
    const contentCell = cells[1];

    // Image
    if (imageCell) {
      imageCell.classList.add('startJourneycard-image');

      const image = imageCell.querySelector('img');

      if (image) {
        image.classList.add('startJourneycard-icon');
      }
    }

    // Content
    if (contentCell) {
      contentCell.classList.add('startJourneycard-content');

      // Heading / title
      const heading = contentCell.querySelector(
        'h1, h2, h3, h4, h5, h6'
      );

      if (heading) {
        heading.classList.add('startJourneycard-title');
      }

      // Text and CTA
      const paragraphs = contentCell.querySelectorAll('p');

      paragraphs.forEach((paragraph) => {
        const link = paragraph.querySelector('a');

        if (link) {
          // CTA
          paragraph.classList.add('startJourneycard-cta');
          link.classList.add('startJourneycard-link');

          const linkText = link.textContent.trim().toLowerCase();

          // Get a Quote
          if (linkText === 'get a quote') {
            link.href = '/in/buy/get-a-quote.html';
          }
        } else {
          // Description
          paragraph.classList.add('startJourneycard-description');
        }
      });
    }
  });
}
