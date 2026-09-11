// Shared site chrome: renders the top category/search bar into #site-topbar
// (data from nodes-index.js) and wires the block-page TOC scrollspy, if present.
(function(){
  function prefix(){
    return location.pathname.indexOf('/blocks/') !== -1 ? '../../' : './';
  }

  // `root` (.site-search) expanding/collapsing is driven by the search icon
  // button (renderTopbar); this only ever toggles the results dropdown itself.
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
      results.style.display = q ? 'block' : 'none';
      if(!q){ results.innerHTML = ''; return; }
      render(nodes.filter(function(n){
        return n.title.toLowerCase().indexOf(q) !== -1 || n.id.indexOf(q) !== -1;
      }));
    });
    document.addEventListener('click', function(e){
      if(!root.contains(e.target)) results.style.display = 'none';
    });
    input.addEventListener('keydown', function(e){
      if(e.key === 'Enter'){
        var first = results.querySelector('a');
        if(first) window.location.href = first.getAttribute('href');
      } else if(e.key === 'Escape'){
        results.style.display = 'none';
        input.blur();
      }
    });
  }

  function isHomePage(){
    var path = location.pathname;
    return path.indexOf('/blocks/') === -1 && path.indexOf('/list.html') === -1;
  }

  function wireTheme(){
    var toggle = document.getElementById('theme-toggle');
    var label = document.getElementById('theme-label');
    if(!toggle) return;
    var stored = null;
    try { stored = localStorage.getItem('ai-techtree-theme'); } catch(e){}
    var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    var isDark = stored ? stored === 'dark' : systemDark;
    toggle.checked = isDark;
    label.textContent = isDark ? 'DARK' : 'LIGHT';
    if(stored) document.documentElement.setAttribute('data-theme', stored);

    toggle.addEventListener('change', function(){
      var theme = toggle.checked ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', theme);
      label.textContent = theme.toUpperCase();
      try { localStorage.setItem('ai-techtree-theme', theme); } catch(e){}
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
    var catLinks = domains.map(function(d){
      return '<a href="' + p + 'index.html?domain=' + d[0] + '">' + d[1] + '</a>';
    }).join('') + '<a href="' + p + 'index.html">전체 테크트리</a>';

    mount.innerHTML =
      '<a class="brand' + (isHomePage() ? ' active' : '') + '" href="' + p + 'index.html">AI 테크트리</a>' +
      '<nav class="cats">' +
        '<div class="dropdown" id="cat-dropdown">' +
          '<button type="button" class="dropdown-toggle">Categories</button>' +
          '<div class="dropdown-menu">' + catLinks + '</div>' +
        '</div>' +
      '</nav>' +
      '<div class="topbar-right">' +
        '<button type="button" class="icon-btn" id="site-search-toggle" aria-label="검색">&#128269;</button>' +
        '<div class="site-search" id="site-search">' +
          '<input type="text" id="site-search-input" placeholder="노드 검색..." autocomplete="off">' +
          '<div class="results" id="site-search-results"></div>' +
        '</div>' +
        '<label class="theme-switch">' +
          '<span class="theme-label" id="theme-label">DARK</span>' +
          '<input type="checkbox" id="theme-toggle">' +
          '<span class="switch-track"><span class="switch-thumb"></span></span>' +
        '</label>' +
      '</div>';

    wireSearch(
      document.getElementById('site-search'),
      document.getElementById('site-search-results'),
      document.getElementById('site-search-input'),
      p
    );
    document.getElementById('site-search-toggle').addEventListener('click', function(){
      var box = document.getElementById('site-search');
      box.classList.toggle('open');
      if(box.classList.contains('open')) document.getElementById('site-search-input').focus();
    });

    var catDropdown = document.getElementById('cat-dropdown');
    catDropdown.querySelector('.dropdown-toggle').addEventListener('click', function(e){
      e.stopPropagation();
      catDropdown.classList.toggle('open');
    });
    document.addEventListener('click', function(e){
      if(!catDropdown.contains(e.target)) catDropdown.classList.remove('open');
    });

    wireTheme();
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
