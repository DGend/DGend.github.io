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

  function render(root){
    var nodeId = root.getAttribute('data-node-id');
    var nodes = window.AI_TECHTREE_NODES || [];
    var current = nodes.filter(function(n){ return n.id === nodeId; })[0];
    if(!current) return;
    var p = prefix();

    var ranked = nodes
      .filter(function(n){ return n.id !== nodeId; })
      .map(function(n){ return { node: n, score: scoreOf(current, n) }; })
      .sort(function(a, b){ return b.score - a.score; });

    var maxScore = ranked.length ? ranked[0].score : 1;
    var minScore = ranked.length ? ranked[ranked.length - 1].score : 0;
    var span = Math.max(1, maxScore - minScore);

    var orbitCount = Math.min(16, ranked.length);
    var orbitItems = ranked.slice(0, orbitCount);
    var cardItems = ranked.slice(0, Math.min(24, ranked.length));

    var W = 640, H = 420, cx = W / 2, cy = H / 2;
    var minR = 55, maxR = 190;

    var svgParts = ['<circle class="rc-guide" cx="' + cx + '" cy="' + cy + '" r="' + ((minR + maxR) / 2) + '"></circle>'];
    var dotsHtml = [];
    orbitItems.forEach(function(item, i){
      var angle = (2 * Math.PI * i / orbitItems.length) - Math.PI / 2;
      var norm = (item.score - minScore) / span; // 0..1, higher score = higher norm
      var r = maxR - norm * (maxR - minR);
      var x = cx + r * Math.cos(angle);
      var y = cy + r * Math.sin(angle);
      var sameCat = item.node.category === current.category;
      svgParts.push(
        '<line data-id="' + item.node.id + '" x1="' + cx + '" y1="' + cy + '" x2="' + x + '" y2="' + y + '"></line>'
      );
      dotsHtml.push(
        '<div class="rc-node' + (sameCat ? ' same-cat' : '') + '" data-id="' + item.node.id +
        '" style="left:' + (x / W * 100) + '%; top:' + (y / H * 100) + '%;" title="' + item.node.title + '"></div>'
      );
    });

    var orbitEl = root.querySelector('.rc-orbit');
    orbitEl.innerHTML =
      '<svg viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none">' + svgParts.join('') + '</svg>' +
      '<div class="rc-center"><span class="rc-center-dot"></span><span class="rc-center-label">' + current.title + '</span></div>' +
      dotsHtml.join('');

    var cardsEl = root.querySelector('.rc-cards');
    root.querySelector('.rc-next-count').textContent = cardItems.length;
    cardsEl.innerHTML = cardItems.map(function(item, i){
      var tags = (item.node.tags || []).slice(0, 4).map(function(t){ return '<span>#' + t + '</span>'; }).join('');
      return (
        '<div class="rc-card" data-id="' + item.node.id + '">' +
          '<span class="rc-rank">' + String(i + 1).padStart(2, '0') + '</span>' +
          '<a class="rc-card-title" href="' + p + 'blocks/' + item.node.id + '/index.html">' + item.node.title + '</a>' +
          '<div class="rc-card-meta">' +
            '<span>' + item.node.updated + '</span>' +
            '<span class="rc-card-cat">' + item.node.category + '</span>' +
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
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function(){
    document.querySelectorAll('.reading-compass-root').forEach(render);
  });
})();
