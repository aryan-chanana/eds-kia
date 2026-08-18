export default function decorate(block) {
  const cards = [...block.children];

  cards.forEach((card) => {
    card.classList.add('start-journey-card');

    const cells = [...card.children];

    const imageCell = cells[0];
    const textCell = cells[1];

    // Image
    if (imageCell) {
      imageCell.classList.add('start-journey-card-image');

      const image = imageCell.querySelector('img');
      if (image) {
        image.classList.add('start-journey-card-icon');
      }
    }

    // Text content
    if (textCell) {
      textCell.classList.add('start-journey-card-content');

      const heading = textCell.querySelector('h2, h3, h4');

      if (heading) {
        heading.classList.add('start-journey-card-title');
      }

      textCell.querySelectorAll('p').forEach((paragraph) => {
        paragraph.classList.add('start-journey-card-description');
      });
    }
  });
}
