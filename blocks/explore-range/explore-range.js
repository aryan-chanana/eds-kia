import { moveInstrumentation } from '../../scripts/scripts.js';

export default function decorate(block) {
  const rows = [...block.children];
  if (!rows.length) return;

  const [headingRow, ...tabRows] = rows;

  const headingText = headingRow.textContent.trim();
  const heading = document.createElement('h2');
  heading.className = 'explore-range-heading';
  moveInstrumentation(headingRow, heading);
  heading.textContent = headingText;

  const tablist = document.createElement('div');
  tablist.className = 'explore-range-tablist';
  tablist.setAttribute('role', 'tablist');

  const panels = document.createElement('div');
  panels.className = 'explore-range-panels';

  tabRows.forEach((row, index) => {
    const cells = [...row.children];
    const labelCell = cells[0];
    const contentCell = cells[1];
    const label = (labelCell?.textContent || `Tab ${index + 1}`).trim();
    const id = `explore-range-tab-${index}`;
    const panelId = `explore-range-panel-${index}`;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'explore-range-tab';
    button.id = id;
    button.textContent = label;
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', panelId);
    button.setAttribute('aria-selected', index === 0 ? 'true' : 'false');
    button.setAttribute('tabindex', index === 0 ? '0' : '-1');
    moveInstrumentation(labelCell, button);
    tablist.append(button);

    const panel = document.createElement('div');
    panel.className = 'explore-range-panel';
    panel.id = panelId;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', id);
    if (index !== 0) panel.hidden = true;
    moveInstrumentation(row, panel);
    if (contentCell) {
      while (contentCell.firstChild) panel.append(contentCell.firstChild);
    }
    panels.append(panel);
  });

  const tabs = [...tablist.children];
  const tabPanels = [...panels.children];

  const activate = (nextIndex) => {
    tabs.forEach((tab, i) => {
      const selected = i === nextIndex;
      tab.setAttribute('aria-selected', selected ? 'true' : 'false');
      tab.setAttribute('tabindex', selected ? '0' : '-1');
      tabPanels[i].hidden = !selected;
    });
    tabs[nextIndex].focus();
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(index));
    tab.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        activate((index + 1) % tabs.length);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        activate((index - 1 + tabs.length) % tabs.length);
      } else if (e.key === 'Home') {
        e.preventDefault();
        activate(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        activate(tabs.length - 1);
      }
    });
  });

  block.replaceChildren(heading, tablist, panels);
}
