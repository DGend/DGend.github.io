// Shared site chrome: renders the top category/search bar into #site-topbar
// (data from nodes-index.js) and wires the block-page TOC scrollspy, if present.
(function(){
  function prefix(){
    return location.pathname.indexOf('/blocks/') !== -1 ? '../../' : './';
  }

  function wireSearch(root, results, input, p){
    var nodes = window.AI_TECHTREE_NODES || [];

    function render(list){
      if(!list.length){
        results.innerHTML = '<div class="empty">검색 결과 없음</div>';
        return;
      }
      results.innerHTML = list.slice(0, 8).map(function(n){
        return '<a href="' + p + 'blocks/' + n.id + '/index.html">' + n.title +
          '<span class="cat">' + n.category + '</span></a>';
      }).join('');
    }

    input.addEventListener('input', function(){
      var q = input.value.trim().toLowerCase();
      root.classList.toggle('open', q.length > 0);
      if(!q){ results.innerHTML = ''; return; }
      render(nodes.filter(function(n){
        return n.title.toLowerCase().indexOf(q) !== -1 || n.id.indexOf(q) !== -1;
      }));
    });
    input.addEventListener('focus', function(){
      if(input.value.trim()) root.classList.add('open');
    });
    document.addEventListener('click', function(e){
      if(!root.contains(e.target)) root.classList.remove('open');
    });
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){
        var first = results.querySelector('a');
        if(first) window.location.href = first.getAttribute('href');
      } else if(e.key === 'Escape'){
        root.classList.remove('open');
        input.blur();
      }
    });
  }

  function renderTopbar(){
    var mount = document.getElementById('site-topbar');
    if(!mount) return;
    var p = prefix();
    var domains = [
      ['cv', 'Computer Vision'], ['nlp', 'NLP / LLM'], ['rl', 'Reinforcement Learning'],
      ['gen', 'Generative / Multi-Modal'], ['robot', 'Robotics / Embodied'],
      ['safety', 'Alignment & Safety'], ['ts', 'Time Series']
    ];
    var cats = domains.map(function(d){
      return '<a href="' + p + 'index.html?domain=' + d[0] + '">' + d[1] + '</a>';
    }).join('');
    mount.innerHTML =
      '<a class="brand" href="' + p + 'index.html">AI 테크트리</a>' +
      '<nav class="cats">' + cats + '</nav>' +
      '<div class="site-search" id="site-search">' +
        '<input type="text" id="site-search-input" placeholder="노드 검색..." autocomplete="off">' +
        '<div class="results" id="site-search-results"></div>' +
      '</div>';
    wireSearch(
      document.getElementById('site-search'),
      document.getElementById('site-search-results'),
      document.getElementById('site-search-input'),
      p
    );
  }

  function initTOC(){
    var links = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));
    if(!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    var sections = [];
    links.forEach(function(a){
      var id = a.getAttribute('href').slice(1);
      var el = document.getElementById(id);
      if(el){ map[id] = a; sections.push(el); }
    });
    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var link = map[entry.target.id];
        if(link) link.classList.toggle('active', entry.isIntersecting);
      });
    }, { rootMargin: '-20% 0px -70% 0px' });
    sections.forEach(function(s){ observer.observe(s); });
  }

  document.addEventListener('DOMContentLoaded', function(){
    renderTopbar();
    initTOC();
  });
})();
