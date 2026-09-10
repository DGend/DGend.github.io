# AI Field Map — Tech Tree Site

`index.html`을 홈 배너(전체 테크트리)로 사용하고, 각 블럭을 `blocks/<node-id>/index.html`로 분리한 정적 사이트입니다.

## 구조

```
index.html              ← 테크트리 전체 그림 (홈)
blocks/
  node-1/index.html      ← 노드별 상세 페이지 (58개)
  node-2/index.html
  ...
```

- 홈 화면에서 블럭을 클릭하면 해당 `blocks/<id>/index.html`로 바로 이동합니다.
- 우측 상단 "경로 탐색 모드"를 켜면 클릭 시 이동 대신 기존처럼 상위 경로가 강조됩니다 (원래 기능 유지).
- 각 블럭 페이지 하단의 "Reading Compass"는 그 블럭의 부모/자식 노드로 자동 연결됩니다 (99개 엣지 데이터 기준으로 생성).
- 각 블럭 페이지의 "개요" 섹션은 아직 빈 스텁입니다 — 기존에 정리해둔 콘텐츠(Notion 리뷰 등)가 있으면 해당 `index.html`을 열어 채워 넣으면 됩니다.

## GitHub Pages로 배포하기 (로컬 VSCode + Claude Code 기준)

1. GitHub에서 `<your-username>.github.io` 이름으로 새 저장소를 만듭니다 (계정당 이 이름의 저장소 1개만 Pages 루트로 자동 서빙됩니다).
2. 이 폴더 전체를 그 저장소의 내용으로 사용합니다:

   ```bash
   cd 이-폴더-경로
   git init
   git remote add origin https://github.com/<your-username>/<your-username>.github.io.git
   git add .
   git commit -m "Initial AI tech tree site"
   git branch -M main
   git push -u origin main
   ```

3. 저장소 Settings → Pages에서 Source가 `main` 브랜치, `/ (root)`로 되어 있는지 확인합니다 (`<username>.github.io` 저장소는 보통 자동으로 활성화됩니다).
4. 몇 분 후 `https://<your-username>.github.io/`에서 확인할 수 있습니다.

이미 같은 이름의 저장소가 있거나 다른 경로(`/ai-techtree/` 같은 서브패스)에 두고 싶다면, `index.html`과 각 블럭 페이지의 상대경로(`./blocks/...`, `../../index.html`)는 그대로 서브패스에서도 정상 동작합니다 (전부 상대경로라 저장소 이름에 의존하지 않습니다).

## 다음 단계 (이후 세션에서)

- `techtree-node-add` / `techtree-category-add` / `techtree-paper-link` 스킬로 홈(`index.html`)에 노드를 추가하면, 이 스킬을 다시 실행해 대응하는 `blocks/<id>/` 폴더를 함께 생성해야 합니다 (현재는 수동 동기화).
- 각 블럭 페이지의 "개요" 스텁을 실제 콘텐츠로 채우는 작업.
- Notion "한글 원본 챕터" DB와의 연동(계획 문서 참고) — 원본 28개 노드는 기존 Notion 페이지로 링크하거나, 여기 GitHub Pages 콘텐츠를 정본으로 삼고 Notion에서 임베드하는 방향 중 택일 필요.
