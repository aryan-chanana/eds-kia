

export default function decorate(block) {

  const cards = [...block.children];



  cards.forEach((card) => {

    card.classList.add('startJourneycard');



    const cells = [...card.children];



    const imageCell = cells[0];

    const textCell = cells[1];



    // Image

    if (imageCell) {

      imageCell.classList.add('startJourneycard-image');



      const image = imageCell.querySelector('img');

      if (image) {

        image.classList.add('startJourneycard-icon');

      }

    }



    // Text content

    if (textCell) {

      textCell.classList.add('startJourneycard-content');



      const heading = textCell.querySelector('h2, h3, h4');



      if (heading) {

        heading.classList.add('startJourneycard-title');

      }



      textCell.querySelectorAll('p').forEach((paragraph) => {

        paragraph.classList.add('startJourneycard-description');

      });

    }

  });

}

