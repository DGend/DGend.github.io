// Reading compass: ranks every other node against the current page by
// category match + tag overlap + recency, then renders a radial "orbit"
// (closer to center = higher score) plus a ranked "Next reads" card row.
// Both views stay in sync on hover/click. Self-inits off #reading-compass-root.
(function(){
  function prefix(){
    return location.pathname.indexOf('/blocks/') !== -1 ? '../../' : './';
  }

  function scoreOf(current, other){
    var score = 0;
    if(other.category && other.category === current.category) score += 40;
    var curTags = (current.tags || []).map(function(t){ return t.toLowerCase(); });
    var overlap = (other.tags || []).filter(function(t){
      return curTags.indexOf(t.toLowerCase()) !== -1;
    }).length;
    score += overlap * 15;
    if(other.updated === current.updated) score += 4;
    else if(other.updated > current.updated) score += 8;
    return score;
  }

  // radius bands: main nodes (original 28 chapters) live in the small inner
  // circle, sub nodes (30 augmented nodes) in the larger outer ring. Score
  // (category + tag overlap + recency) only fine-tunes radius *within* each
  // node's own band, normalized against that band's own score range.
  var BANDS = {
    main: { rMin: 40, rMax: 100 },
    sub: { rMin: 130, rMax: 200 },
  };

  function placeInBand(items, band){
    var scores = items.map(function(it){ return it.score; });
    var max = scores.length ? Math.max.apply(null, scores) : 1;
    var min = scores.length ? Math.min.apply(null, scores) : 0;
    var span = Math.max(1, max - min);
    return items.map(function(it, i){
      var angle = (2 * Math.PI * i / items.length) - Math.PI / 2;
      var norm = (it.score - min) / span; // 0..1, higher score = higher norm
      var r = band.rMax - norm * (band.rMax - band.rMin);
      return { item: it, angle: angle, r: r };
    });
  }

  function render(root){
    var nodeId = root.getAttribute('data-node-id');
    var nodes = window.AI_TECHTREE_NODES || [];
    var current = nodes.filter(function(n){ return n.id === nodeId; })[0];
    if(!current) return;
    var p = prefix();

    var ranked = nodes
      .filter(function(n){ return n.id !== nodeId; })
      .map(function(n){ return { node: n, score: scoreOf(current, n) }; })
      .filter(function(it){ return it.score > 0; })
      .sort(function(a, b){ return b.score - a.score; });

    var mainRanked = ranked.filter(function(it){ return it.node.type === 'main'; }).slice(0, 10);
    var subRanked = ranked.filter(function(it){ return it.node.type !== 'main'; }).slice(0, 14);
    var cardItems = ranked.slice(0, Math.min(24, ranked.length));

    var W = 640, H = 420, cx = W / 2, cy = H / 2;
    var placed = placeInBand(mainRanked, BANDS.main).concat(placeInBand(subRanked, BANDS.sub));

    var svgParts = [
      '<circle class="rc-guide rc-guide-main" cx="' + cx + '" cy="' + cy + '" r="' + BANDS.main.rMax + '"></circle>',
      '<circle class="rc-guide" cx="' + cx + '" cy="' + cy + '" r="' + BANDS.sub.rMax + '"></circle>',
    ];
    var dotsHtml = [];
    placed.forEach(function(p2){
      var item = p2.item;
      var x = cx + p2.r * Math.cos(p2.angle);
      var y = cy + p2.r * Math.sin(p2.angle);
      var sameCat = item.node.category === current.category;
      svgParts.push(
        '<line data-id="' + item.node.id + '" x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '"></line>'
      );
      dotsHtml.push(
        '<div class="rc-node type-' + item.node.type + (sameCat ? ' same-cat' : '') + '" data-id="' + item.node.id +
        '" style="left:' + (x / W * 100) + '%; top:' + (y / H * 100) + '%;" title="' + item.node.title + '"></div>'
      );
    });

    var orbitEl = root.querySelector('.rc-orbit');
    orbitEl.innerHTML =
      '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' + svgParts.join('') + '</svg>' +
      '<div class="rc-center"><span class="rc-center-dot"></span><span class="rc-center-label">' + current.title + '</span></div>' +
      dotsHtml.join('') +
      '<div class="rc-legend"><span><i class="type-main"></i>원본 노드</span><span><i class="type-sub"></i>보강 노드</span></div>';

    var cardsEl = root.querySelector('.rc-cards');
    root.querySelector('.rc-next-count').textContent = cardItems.length;
    cardsEl.innerHTML = cardItems.map(function(item, i){
      var tags = (item.node.tags || []).slice(0, 4).map(function(t){
        return '<a href="' + p + 'archive.html?tag=' + encodeURIComponent(t) + '">#' + t + '</a>';
      }).join('');
      return (
        '<div class="rc-card" data-id="' + item.node.id + '">' +
          '<span class="rc-rank">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<a class="rc-card-title" href="' + p + 'blocks/' + item.node.id + '/index.html">' + item.node.title + '</a>' +
          '<div class="rc-card-meta">' +
            '<span>' + item.node.updated + '</span>' +
            '<a class="rc-card-cat" href="' + p + 'archive.html?category=' + encodeURIComponent(item.node.category) + '">' + item.node.category + '</a>' +
            '<span class="rc-card-score">score ' + item.score + '</span>' +
          '</div>' +
          '<div class="rc-card-tags">' + tags + '</div>' +
        '</div>'
      );
    }).join('');

    // hover/click sync between orbit dots, connecting lines, and cards
    var pinned = null;
    function setActive(id){
      var active = id || pinned;
      root.querySelectorAll('.rc-node, line, .rc-card').forEach(function(el){
        el.classList.toggle('active', active && el.getAttribute('data-id') === active);
      });
    }
    root.querySelectorAll('.rc-node, .rc-card').forEach(function(el){
      var id = el.getAttribute('data-id');
      el.addEventListener('mouseenter', function(){ setActive(id); });
      el.addEventListener('mouseleave', function(){ setActive(null); });
    });
    root.querySelectorAll('.rc-node').forEach(function(el){
      el.addEventListener('click', function(){
        var id = el.getAttribute('data-id');
        pinned = pinned === id ? null : id;
        setActive(pinned);
        if(pinned){
          var card = root.querySelector('.rc-card[data-id="' + pinned + '"]');
          if(card) card.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.reading-compass-root').forEach(render);
  });
})();
