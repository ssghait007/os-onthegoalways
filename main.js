async function init() {
  const apps = await fetch('./apps.json').then(r => r.json());
  renderDock(apps);
  renderConstellation();
  window.addEventListener('resize', renderConstellation);
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
  addDockMagnification();
}

function addDockMagnification() {
  const dock = document.getElementById('dock');
  const icons = [...dock.querySelectorAll('.dock-icon')];

  dock.addEventListener('mousemove', e => {
    icons.forEach(icon => {
      const rect = icon.getBoundingClientRect();
      const iconCenterX = rect.left + rect.width / 2;
      const dist = Math.abs(e.clientX - iconCenterX);
      const maxDist = 100;
      const scale = dist < maxDist ? 1 + (1 - dist / maxDist) * 0.5 : 1;
      const translateY = dist < maxDist ? -(1 - dist / maxDist) * 14 : 0;
      icon.style.transform = `translateY(${translateY}px) scale(${scale})`;
    });
  });

  dock.addEventListener('mouseleave', () => {
    icons.forEach(icon => { icon.style.transform = ''; });
  });
}

function renderConstellation() {
  const svg = d3.select('#constellation');
  svg.selectAll('*').remove();
  const W = window.innerWidth;
  const H = window.innerHeight;
  svg.attr('width', W).attr('height', H);

  const NUM_STARS = 120;
  const LINK_DIST = 120;

  // Generate random stars
  const stars = Array.from({ length: NUM_STARS }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.5 + 0.5,
    opacity: Math.random() * 0.5 + 0.3,
    twinkleDuration: 2000 + Math.random() * 3000
  }));

  // Draw proximity lines
  const lines = [];
  for (let i = 0; i < stars.length; i++) {
    for (let j = i + 1; j < stars.length; j++) {
      const dx = stars[i].x - stars[j].x;
      const dy = stars[i].y - stars[j].y;
      if (Math.sqrt(dx * dx + dy * dy) < LINK_DIST) {
        lines.push({ source: stars[i], target: stars[j] });
      }
    }
  }

  svg.selectAll('line')
    .data(lines)
    .enter().append('line')
    .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
    .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
    .attr('stroke', 'rgba(255,255,255,0.06)')
    .attr('stroke-width', 0.5);

  // Draw stars with twinkle
  const starEls = svg.selectAll('circle')
    .data(stars)
    .enter().append('circle')
    .attr('cx', d => d.x)
    .attr('cy', d => d.y)
    .attr('r', d => d.r)
    .attr('fill', 'white')
    .attr('opacity', d => d.opacity);

  // Twinkle animation
  function twinkle(el, star) {
    el.transition()
      .duration(star.twinkleDuration)
      .attr('opacity', star.opacity * 0.3)
      .transition()
      .duration(star.twinkleDuration)
      .attr('opacity', star.opacity)
      .on('end', () => twinkle(el, star));
  }

  starEls.each(function(d) { twinkle(d3.select(this), d); });

}

init();
