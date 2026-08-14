function readHeading(block) {
  const firstCell = block.querySelector(':scope > div > div');
  return firstCell ? firstCell.textContent.trim() : '';
}

function collectTabSections(hostSection) {
  const sections = [];
  let current = hostSection.nextElementSibling;
  while (current) {
    const label = current.dataset ? current.dataset.tabLabel : undefined;
    if (!label) break;
    sections.push({ label, section: current });
    current = current.nextElementSibling;
  }
  return sections;
}

function setupTabSwitching(buttons, entries) {
  const activate = (index) => {
    buttons.forEach((btn, i) => {
      const active = i === index;
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
      btn.tabIndex = active ? 0 : -1;
    });
    entries.forEach((entry, i) => {
      entry.section.classList.toggle('explore-range-tab-active', i === index);
    });
  };

  buttons.forEach((btn, i) => {
    btn.addEventListener('click', () => activate(i));
    btn.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
      e.preventDefault();
      let next = i;
      if (e.key === 'ArrowLeft') next = (i - 1 + buttons.length) % buttons.length;
      if (e.key === 'ArrowRight') next = (i + 1) % buttons.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = buttons.length - 1;
      buttons[next].focus();
      activate(next);
    });
  });

  activate(0);
}

export default function decorate(block) {
  const heading = readHeading(block);
  const hostSection = block.closest('.section');
  if (!hostSection) return;

  const entries = collectTabSections(hostSection);

  block.textContent = '';

  if (heading) {
    const h = document.createElement('h2');
    h.className = 'explore-range-heading';
    h.textContent = heading;
    block.append(h);
  }

  if (!entries.length) return;

  const tabList = document.createElement('div');
  tabList.className = 'explore-range-tabs';
  tabList.setAttribute('role', 'tablist');

  const buttons = entries.map(({ label, section }, index) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'explore-range-tab';
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    btn.tabIndex = index === 0 ? 0 : -1;
    btn.textContent = label;
    section.classList.add('explore-range-tab-panel');
    tabList.append(btn);
    return btn;
  });

  block.append(tabList);
  setupTabSwitching(buttons, entries);
}
