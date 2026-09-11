// Renders archive.html: every node, newest first, grouped by year with a
// year-tab filter. All dates are real (from each block's own meta strip).
(function(){
  function main(){
    var nodes = (window.AI_TECHTREE_NODES || []).slice()
      .sort(function(a, b){ return b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title); });

    var byYear = {};
    nodes.forEach(function(n){
      var y = n.updated.slice(0, 4);
      (byYear[y] = byYear[y] || []).push(n);
    });
    var years = Object.keys(byYear).sort().reverse();

    document.getElementById('archive-sub').textContent = nodes.length + '개의 블럭을 연도별로 탐색해보세요.';

    var activeYear = null; // null = all years

    function renderTabs(){
      var tabsEl = document.getElementById('archive-tabs');
      tabsEl.innerHTML = years.map(function(y){
        return '<button type="button" data-year="' + y + '" class="' + (activeYear === y ? 'active' : '') + '">' +
          y + '<span class="n">' + byYear[y].length + '</span></button>';
      }).join('');
      tabsEl.querySelectorAll('button').forEach(function(btn){
        btn.addEventListener('click', function(){
          var y = btn.getAttribute('data-year');
          activeYear = activeYear === y ? null : y;
          renderTabs();
          renderList();
        });
      });
    }

    function renderList(){
      var shownYears = activeYear ? [activeYear] : years;
      var html = shownYears.map(function(y){
        var rows = byYear[y].map(function(n){
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
        return '<div class="archive-year-head">' + y + '</div><div class="feed-rows">' + rows + '</div>';
      }).join('');
      document.getElementById('archive-root').innerHTML = html;
    }

    renderTabs();
    renderList();
  }

  document.addEventListener('DOMContentLoaded', main);
})();
