export default function decorate(block) {
  const rows = [...block.children];

  const hasAnyImage = rows.some((row) => row.querySelector('img, picture'));
  if (!hasAnyImage) {
    block.classList.add('start-journey-card--heading');
    return;
  }

  rows.forEach((row) => {
    row.classList.add('start-journey-card-item');
    const cells = [...row.children];
    const imageCell = cells[0];
    const textCell = cells[1];

    if (imageCell) {
      imageCell.classList.add('start-journey-card-image');
      const image = imageCell.querySelector('img');
      if (image) image.classList.add('start-journey-card-icon');
    }

    if (textCell) {
      textCell.classList.add('start-journey-card-content');
      const heading = textCell.querySelector('h1, h2, h3, h4, h5, h6');
      if (heading) heading.classList.add('start-journey-card-title');
      textCell.querySelectorAll('p').forEach((p) => {
        p.classList.add('start-journey-card-description');
      });
    }
  });
}
