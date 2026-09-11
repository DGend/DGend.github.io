// Renders the pinned/recent feed panel below the tree on index.html.
// Pinned = a small curated set of flagship concept nodes (real nodes, real
// content); recent = every node's own real updated date, newest first.
(function(){
  var PINNED_IDS = ['node-18', 'node-transformer', 'node-rlhf', 'node-vla'];
  var RECENT_LIMIT = 8;

  function main(){
    var root = document.getElementById('home-feed-root');
    if(!root) return;
    var nodes = window.AI_TECHTREE_NODES || [];
    var byId = {};
    nodes.forEach(function(n){ byId[n.id] = n; });

    var pinned = PINNED_IDS.map(function(id){ return byId[id]; }).filter(Boolean);
    var recent = nodes.slice()
      .sort(function(a, b){ return b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title); })
      .slice(0, RECENT_LIMIT);

    var pinnedHtml = pinned.map(function(n){
      return (
        '<div class="feed-card">' +
          '<span class="badge">' + n.category + '</span>' +
          '<h3><a href="./blocks/' + n.id + '/index.html">' + n.title + '</a></h3>' +
          '<p>' + n.excerpt + '</p>' +
          '<div class="feed-card-meta">' + n.updated + ' &middot; ' + n.readMin + ' 분 읽기</div>' +
        '</div>'
      );
    }).join('');

    var recentHtml = recent.map(function(n){
      return (
        '<div class="feed-row">' +
          '<time>' + n.updated + '</time>' +
          '<div>' +
            '<div class="feed-row-head">' +
              '<a href="./blocks/' + n.id + '/index.html">' + n.title + '</a>' +
              '<span class="badge">' + n.category + '</span>' +
              '<span class="readtime">' + n.readMin + ' 분 읽기</span>' +
            '</div>' +
            '<p>' + n.excerpt + '</p>' +
          '</div>' +
        '</div>'
      );
    }).join('');

    root.innerHTML =
      '<p class="feed-eyebrow">// pinned</p>' +
      '<div class="feed-pinned-grid">' + pinnedHtml + '</div>' +
      '<p class="feed-eyebrow">// recent</p>' +
      '<div class="feed-rows">' + recentHtml + '</div>';
  }

  document.addEventListener('DOMContentLoaded', main);
})();
