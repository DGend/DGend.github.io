# 콘텐츠 입력 가이드 (파일 기반)

논문 리뷰나 블로그 글을 프롬프트 없이 파일만으로 추가하는 방법입니다.

## 1. 마크다운 파일 작성

`content/<카테고리 폴더>/<slug>.md` 형태로 파일을 만듭니다. 폴더는 자유롭게
만들어도 됩니다(예: `content/papers/`, `content/blog/`, `content/nlp/`).

```markdown
---
title: "글 제목"
category: "NLP / LLM"      # 생략 시 폴더 이름에서 자동 생성
tags: ["survey", "transformer"]   # 생략 가능
type: "paper"               # paper | post (기본값 post)
date: "2026-09-11"          # 생략 시 오늘 날짜
---

여기부터 마크다운 본문입니다. 제목(#), 굵게(**...**), 링크, 목록 등
일반 마크다운 문법을 그대로 씁니다.
```

- `category`를 생략하면 파일이 들어있는 폴더 이름이 카테고리가 됩니다
  (`content/computer-vision/x.md` → 카테고리 "Computer Vision").
- 기존 8개 카테고리와 이름을 맞추면 해당 카테고리 페이지에 합쳐지고,
  새 이름을 쓰면 Categories/Docs/Archive에 새 카테고리가 자동으로 생깁니다.

## 2. 빌드 실행

```bash
pip install markdown PyYAML   # 최초 1회
python3 scripts/build_content.py
```

`content/**/*.md` 각 파일마다 `posts/<slug>/index.html`이 생성/갱신되고,
`assets/nodes-index.js`가 기존 58개 테크트리 노드 + 새 글 전체로 재생성됩니다.
검색·Archive·Categories·Docs·Series·Reading Compass에 자동으로 반영됩니다.

몇 번을 다시 실행해도 안전합니다(idempotent).

## 3. 커밋 & 푸시

```bash
git add content posts assets/nodes-index.js
git commit -m "글 추가: <제목>"
git push
```
