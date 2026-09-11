// Renders list.html: filters AI_TECHTREE_NODES by ?type=category|tag&value=...
// and shows the matching blocks as cards. Category/tag chips on this page
// link back into itself, so users can pivot from one category/tag to another.
(function(){
  function main(){
    var qs = new URLSearchParams(location.search);
    var type = qs.get('type') === 'tag' ? 'tag' : 'category';
    var value = qs.get('value') || '';
    var nodes = window.AI_TECHTREE_NODES || [];

    var matched = nodes.filter(function(n){
      if(type === 'tag') return (n.tags || []).indexOf(value) !== -1;
      return n.category === value;
    });

    var label = type === 'tag' ? '#' + value : value;
    document.title = label + ' — AI 테크트리';
    document.getElementById('list-heading-crumb').textContent = label;
    document.getElementById('list-title').textContent = label;
    document.getElementById('list-sub').textContent =
      (type === 'tag' ? '태그 "' + label + '"' : '카테고리 "' + label + '"') +
      '에 해당하는 블럭 ' + matched.length + '개입니다.';

    var grid = document.getElementById('list-grid');
    var empty = document.getElementById('list-empty');
    if(!matched.length){
      empty.hidden = false;
      return;
    }
    grid.innerHTML = matched.map(function(n){
      var tags = (n.tags || []).map(function(t){
        return '<a href="./list.html?type=tag&value=' + encodeURIComponent(t) + '">#' + t + '</a>';
      }).join('');
      return (
        '<div class="list-card">' +
          '<h3><a href="./blocks/' + n.id + '/index.html">' + n.title + '</a></h3>' +
          '<div class="list-meta">' +
            '<a href="./list.html?type=category&value=' + encodeURIComponent(n.category) + '">' + n.category + '</a>' +
            '<span>' + n.updated + '</span>' +
          '</div>' +
          '<div class="list-tags">' + tags + '</div>' +
        '</div>'
      );
    }).join('');
  }

  document.addEventListener('DOMContentLoaded', main);
})();
