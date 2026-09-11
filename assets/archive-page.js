// Renders archive.html: the single canonical "all posts" list. Accepts
// ?category=X or ?tag=X to pre-filter (every category/tag chip site-wide
// links here now, matching the reference site's year-archive pattern),
// plus a year-tab filter on top. Year tabs always show the GLOBAL count
// per year (unaffected by the active category/tag filter); the row list
// below only shows matching, non-empty years.
(function(){
  function main(){
    var qs = new URLSearchParams(location.search);
    var filterCategory = qs.get('category');
    var filterTag = qs.get('tag');

    var allNodes = (window.AI_TECHTREE_NODES || []).slice()
      .sort(function(a, b){ return b.updated.localeCompare(a.updated) || a.title.localeCompare(b.title); });

    var filtered = allNodes.filter(function(n){
      if(filterCategory) return n.category === filterCategory;
      if(filterTag) return (n.tags || []).indexOf(filterTag) !== -1;
      return true;
    });

    var byYearAll = {};
    allNodes.forEach(function(n){
      var y = n.updated.slice(0, 4);
      (byYearAll[y] = byYearAll[y] || []).push(n);
    });
    var byYearFiltered = {};
    filtered.forEach(function(n){
      var y = n.updated.slice(0, 4);
      (byYearFiltered[y] = byYearFiltered[y] || []).push(n);
    });
    var years = Object.keys(byYearAll).sort().reverse();

    document.getElementById('archive-sub').textContent =
      allNodes.length + '개의 글을 카테고리와 연도로 탐색해보세요.';

    var filterBar = document.getElementById('archive-filter');
    if(filterCategory || filterTag){
      var label = filterCategory ? '카테고리' : '태그';
      var value = filterCategory || filterTag;
      filterBar.innerHTML =
        '<span>' + label + ': <strong>' + value + '</strong></span>' +
        '<a href="./archive.html">전체보기 &times;</a>';
      filterBar.hidden = false;
    } else {
      filterBar.hidden = true;
    }

    var activeYear = null; // null = all years

    function renderTabs(){
      var tabsEl = document.getElementById('archive-tabs');
      tabsEl.innerHTML = years.map(function(y){
        return '<button type="button" data-year="' + y + '" class="' + (activeYear === y ? 'active' : '') + '">' +
          y + '<span class="n">' + byYearAll[y].length + '</span></button>';
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
      var shownYears = (activeYear ? [activeYear] : years).filter(function(y){
        return byYearFiltered[y] && byYearFiltered[y].length;
      });
      var root = document.getElementById('archive-root');
      if(!shownYears.length){
        root.innerHTML = '<p class="list-empty">해당 조건에 맞는 글이 없습니다.</p>';
        return;
      }
      root.innerHTML = shownYears.map(function(y){
        var rows = byYearFiltered[y].map(function(n){
          return (
            '<div class="feed-row">' +
              '<time>' + n.updated + '</time>' +
              '<div>' +
                '<div class="feed-row-head">' +
                  '<a href="./' + n.href + '">' + n.title + '</a>' +
                  '<a class="badge" href="./archive.html?category=' + encodeURIComponent(n.category) + '">' + n.category + '</a>' +
                  '<span class="readtime">' + n.readMin + ' 분 읽기</span>' +
                '</div>' +
                '<p>' + n.excerpt + '</p>' +
              '</div>' +
            '</div>'
          );
        }).join('');
        return '<div class="archive-year-head">' + y + '</div><div class="feed-rows">' + rows + '</div>';
      }).join('');
    }

    renderTabs();
    renderList();
  }

  document.addEventListener('DOMContentLoaded', main);
})();
