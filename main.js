async function init() {
  const apps = await fetch('./apps.json').then(r => r.json());
  renderDock(apps);
  renderConstellation();
}

function renderDock(apps) {
  const dock = document.getElementById('dock');
  apps.forEach(app => {
    const a = document.createElement('a');
    a.href = app.url;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    a.className = 'dock-icon';
    a.title = app.name;

    if (app.icon.endsWith('.svg')) {
      const img = document.createElement('img');
      img.src = `icons/${app.icon}`;
      img.alt = app.name;
      a.appendChild(img);
    } else {
      a.textContent = app.icon;
    }

    dock.appendChild(a);
  });
}

init();
