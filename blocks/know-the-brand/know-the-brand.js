export default function decorate(block) {
  const rows = [...block.children];

  // Heading
  const heading = rows[0]?.querySelector('div');
  if (heading) {
    heading.classList.add('know-the-brand-heading');
  }

  // Description
  const description = rows[1]?.querySelector('div');
  if (description) {
    description.classList.add('know-the-brand-description');
  }

  // Cards container
  const cards = document.createElement('div');
  cards.className = 'know-the-brand-cards';

  // Remaining rows contain the 3 cards
  rows.slice(2).forEach((row, index) => {
    const cells = [...row.children];

    const card = document.createElement('div');
    card.className = 'know-the-brand-card';

    // Image
    if (cells[0]) {
      const image = cells[0].querySelector('picture, img');

      if (image) {
        const imageWrapper = document.createElement('div');
        imageWrapper.className = 'know-the-brand-card-image';
        imageWrapper.append(image.cloneNode(true));
        card.append(imageWrapper);
      }
    }

    // Content
    const content = document.createElement('div');
    content.className = 'know-the-brand-card-content';

    // Title
    if (cells[1]) {
      const title = document.createElement('div');
      title.className = 'know-the-brand-card-title';
      title.innerHTML = cells[1].innerHTML;
      content.append(title);
    }

    // Description
    if (cells[2]) {
      const cardDescription = document.createElement('div');
      cardDescription.className = 'know-the-brand-card-description';
      cardDescription.innerHTML = cells[2].innerHTML;
      content.append(cardDescription);
    }

    // Button
    if (cells[3]) {
      const buttonWrapper = document.createElement('div');
      buttonWrapper.className = 'know-the-brand-card-button';
      buttonWrapper.innerHTML = cells[3].innerHTML;
      content.append(buttonWrapper);
    }

    card.append(content);

    // Separator between cards
    if (index < rows.slice(2).length - 1) {
      card.classList.add('has-separator');
    }

    cards.append(card);
  });

  // Replace original block content
  block.innerHTML = '';

  if (heading) {
    block.append(heading);
  }

  if (description) {
    block.append(description);
  }

  block.append(cards);
}