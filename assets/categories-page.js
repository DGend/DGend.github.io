// Renders categories.html: groups the real 8 categories present in
// nodes-index.js into "핵심 개념" (no-domain trunk nodes) and "응용 분야"
// (the 7 domain-tagged categories), each card showing a real post count.
(function(){
  var DOMAIN_ORDER = [
    'Computer Vision', 'NLP / LLM', 'Reinforcement Learning',
    'Generative / Multi-Modal', 'Robotics / Embodied AI',
    'Alignment & Safety', 'Time Series',
  ];
  var CORE_CATEGORY = 'AI 기초 / 핵심 개념';

  function main(){
    var nodes = window.AI_TECHTREE_NODES || [];
    var counts = {};
    nodes.forEach(function(n){ counts[n.category] = (counts[n.category] || 0) + 1; });

    function card(cat){
      return (
        '<a class="cat-card" href="./archive.html?category=' + encodeURIComponent(cat) + '">' +
          '<div class="cat-name"><i>&#9670;</i>' + cat + '</div>' +
          '<div class="cat-count">' + (counts[cat] || 0) + ' posts</div>' +
        '</a>'
      );
    }

    var html = '';
    if(counts[CORE_CATEGORY]){
      html += '<div class="section-group"><h2>핵심 개념</h2><div class="cat-grid">' + card(CORE_CATEGORY) + '</div></div>';
    }
    var domainCards = DOMAIN_ORDER.filter(function(c){ return counts[c]; }).map(card).join('');
    if(domainCards){
      html += '<div class="section-group"><h2>응용 분야</h2><div class="cat-grid">' + domainCards + '</div></div>';
    }
    document.getElementById('categories-root').innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', main);
})();
