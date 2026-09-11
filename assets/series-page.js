// Renders series.html: treats each of the 7 real domains as a "series",
// episode count = actual number of nodes tagged with that domain.
(function(){
  var SERIES = [
    ['Computer Vision', '이미지·영상 인식 관련 개념 계열'],
    ['NLP / LLM', '언어 처리와 대규모 언어모델 계열'],
    ['Reinforcement Learning', '보상 기반 학습과 정책 최적화 계열'],
    ['Generative / Multi-Modal', '생성 모델과 멀티모달 학습 계열'],
    ['Robotics / Embodied AI', '로봇·물리 상호작용 관련 개념 계열'],
    ['Alignment & Safety', '정렬·안전성 관련 개념 계열'],
    ['Time Series', '시계열 데이터 처리 계열'],
  ];

  function main(){
    var nodes = window.AI_TECHTREE_NODES || [];
    var counts = {};
    nodes.forEach(function(n){ counts[n.category] = (counts[n.category] || 0) + 1; });

    var html = SERIES.filter(function(s){ return counts[s[0]]; }).map(function(s){
      var cat = s[0], desc = s[1];
      return (
        '<a class="row-item" href="./archive.html?category=' + encodeURIComponent(cat) + '">' +
          '<span class="row-title">' + cat + '<span class="row-sub">' + desc + '</span></span>' +
          '<span class="row-count">' + counts[cat] + ' episodes</span>' +
          '<span class="chev">&#8250;</span>' +
        '</a>'
      );
    }).join('');
    document.getElementById('series-root').innerHTML = html;
  }

  document.addEventListener('DOMContentLoaded', main);
})();
