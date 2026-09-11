// Renders docs.html: same 8 real categories as categories.html, shown as
// a flat row index (group badge + name + count) instead of a card grid.
(function(){
  var GROUPS = [
    ['핵심 개념', 'core', ['AI 기초 / 핵심 개념']],
    ['응용 분야', 'domain', [
      'Computer Vision', 'NLP / LLM', 'Reinforcement Learning',
      'Generative / Multi-Modal', 'Robotics / Embodied AI',
      'Alignment & Safety', 'Time Series',
    ]],
  ];

  function main(){
    var nodes = window.AI_TECHTREE_NODES || [];
    var counts = {};
    nodes.forEach(function(n){ counts[n.category] = (counts[n.category] || 0) + 1; });

    var html = '';
    GROUPS.forEach(function(group){
      var groupLabel = group[0], groupClass = group[1];
      group[2].forEach(function(cat){
        if(!counts[cat]) return;
        html +=
          '<a class="row-item" href="./archive.html?category=' + encodeURIComponent(cat) + '">' +
            '<span class="badge badge-' + groupClass + '">' + groupLabel + '</span>' +
            '<span class="row-title">' + cat + '</span>' +
            '<span class="chev">&#8250;</span>' +
          '</a>';
      });
    });
    document.getElementById('docs-root').innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', main);
})();
