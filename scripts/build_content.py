#!/usr/bin/env python3
"""File-based content pipeline for the AI Tech Tree site.

Workflow to add a paper review or blog note (no prompting needed):
  1. Drop a Markdown file under content/<category-folder>/<slug>.md
     with a frontmatter block. See content/README.md for the schema.
  2. Run:  python3 scripts/build_content.py
  3. Commit + push the generated posts/<slug>/index.html and the
     updated assets/nodes-index.js.

Requires: pip install markdown PyYAML

Regenerates, every run (idempotent):
  - posts/<slug>/index.html for every content/**/*.md file
  - assets/nodes-index.js, merging the 58 hand-authored blocks/node-*/
    pages with every generated post, so search / Archive / Categories /
    Docs / Series / Reading Compass pick posts up automatically.
"""
import datetime
import html
import json
import pathlib
import re
import sys

try:
    import markdown
    import yaml
except ImportError:
    sys.exit(
        "필요한 패키지가 없습니다. 먼저 실행하세요:\n"
        "  pip install markdown PyYAML"
    )

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONTENT_DIR = ROOT / "content"
POSTS_DIR = ROOT / "posts"
BLOCKS_DIR = ROOT / "blocks"
NODES_INDEX = ROOT / "assets" / "nodes-index.js"


def slugify(name):
    s = re.sub(r"[^0-9a-zA-Z가-힣\-]+", "-", name.strip().lower())
    return re.sub(r"-+", "-", s).strip("-") or "post"


def tag_token(text):
    return re.sub(r"[^0-9A-Za-z가-힣]+", "", text)


def title_case_folder(name):
    return name.replace("-", " ").replace("_", " ").strip().title()


def read_frontmatter(text):
    m = re.match(r"^---\s*\n(.*?\n)---\s*\n?(.*)$", text, re.S)
    if not m:
        return {}, text
    fm = yaml.safe_load(m.group(1)) or {}
    return fm, m.group(2)


# Uses __TOKEN__ placeholders (not str.format) because body_html is
# markdown-rendered user content that often contains literal { } (code
# blocks, JSON, JS) which would break str.format's brace parsing.
POST_TEMPLATE = """<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>__TITLE__ — AI 테크트리</title>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap">
<link rel="stylesheet" href="../../assets/site-chrome.css">
<style>
  :root{
    --bg:#f7f6f3; --ink:#1f2420; --ink-soft:#565f59; --line:#c9c4ba; --line-soft:#dedad2;
    --card-bg:#ffffff; --accent:#2f6f5e; --accent-ink:#153c32; --accent-bg:#e4efe9;
    --shadow: 0 1px 2px rgba(31,36,32,0.06), 0 1px 1px rgba(31,36,32,0.04);
  }
  @media (prefers-color-scheme: dark){
    :root:not([data-theme="light"]){
      --bg:#14181a; --ink:#e9ece9; --ink-soft:#9fa89f; --line:#3a413c; --line-soft:#2a302b;
      --card-bg:#1c2224; --accent:#6fbf9f; --accent-ink:#dff3e9; --accent-bg:#22332c;
      --shadow: 0 1px 3px rgba(0,0,0,0.4);
    }
  }
  :root[data-theme="dark"]{
    --bg:#14181a; --ink:#e9ece9; --ink-soft:#9fa89f; --line:#3a413c; --line-soft:#2a302b;
    --card-bg:#1c2224; --accent:#6fbf9f; --accent-ink:#dff3e9; --accent-bg:#22332c;
    --shadow: 0 1px 3px rgba(0,0,0,0.4);
  }
  *{box-sizing:border-box;}
  body{
    background:var(--bg); color:var(--ink); margin:0;
    font-family:'IBM Plex Sans KR','Pretendard',-apple-system,sans-serif;
  }
  .mono{ font-family:'IBM Plex Mono', ui-monospace, monospace; }
  .page{ max-width:1040px; margin:0 auto; padding:40px 24px 100px; }
  .breadcrumb{
    font-family:'IBM Plex Mono', monospace; font-size:11.5px; color:var(--ink-soft);
    margin-bottom:18px;
  }
  .breadcrumb a{ color:var(--accent); text-decoration:none; }
  .breadcrumb a:hover{ text-decoration:underline; }
  .eyebrow{
    font-family:'IBM Plex Mono', monospace; font-size:11px; letter-spacing:.12em;
    text-transform:uppercase; color:var(--accent); margin:0 0 10px;
  }
  h1{ font-size:clamp(24px,4vw,34px); font-weight:700; margin:0 0 6px; letter-spacing:-0.01em; }
  .badges{ display:flex; gap:8px; flex-wrap:wrap; margin:14px 0 28px; }
  .badge{
    font-family:'IBM Plex Mono', monospace; font-size:11px; color:var(--ink-soft);
    background:var(--card-bg); border:1px solid var(--line); border-radius:999px;
    padding:4px 11px;
  }
  section{ margin:28px 0; }
  h2{ font-size:14px; font-weight:600; color:var(--ink-soft); text-transform:uppercase;
       letter-spacing:.06em; margin:0 0 12px; border-bottom:1px solid var(--line-soft); padding-bottom:8px; }
  .content-box{
    background:var(--card-bg); border:1px solid var(--line-soft); border-radius:10px;
    padding:18px 20px; box-shadow:var(--shadow); color:var(--ink-soft); font-size:14px; line-height:1.7;
  }
  .content-box h1, .content-box h2, .content-box h3{ color:var(--ink); margin:20px 0 8px; }
  .content-box p{ margin:0 0 14px; }
  .content-box a{ color:var(--accent); }
  .content-box pre{
    background:var(--bg); border:1px solid var(--line-soft); border-radius:8px;
    padding:12px 14px; overflow-x:auto; font-size:12.5px;
  }
  .content-box code{ font-family:'IBM Plex Mono', monospace; }
  .home-link{
    display:inline-flex; align-items:center; gap:6px; margin-top:36px;
    font-family:'IBM Plex Mono', monospace; font-size:12.5px; color:var(--accent);
    text-decoration:none; border:1px solid var(--line); border-radius:8px; padding:8px 14px;
    background:var(--card-bg);
  }
  .home-link:hover{ border-color:var(--accent); }
</style>
</head>
<body>
<div id="site-topbar"></div>
<div class="page">
<div class="layout">
<main>
<div class="breadcrumb"><a href="../../index.html">AI 테크트리</a> / __TITLE__</div>
<p class="eyebrow">__EYEBROW__</p>
<h1>__TITLE__</h1>
<div class="badges">
  <span class="badge mono">__TYPE_BADGE__</span>
</div>

<section id="sec-content">
  <h2>내용</h2>
  <div class="content-box">
__BODY_HTML__
  </div>
</section>

<section class="meta-block">
  <div class="meta-grid">
    <div class="meta-item"><span class="meta-label">카테고리</span><span><a class="category-btn" href="../../archive.html?category=__CATEGORY_Q__">__CATEGORY__</a></span></div>
    <div class="meta-item"><span class="meta-label">Tag</span><span>__TAG_CHIPS__</span></div>
    <div class="meta-item"><span class="meta-label">업데이트</span><span>__DATE__</span></div>
  </div>
</section>

<section id="sec-compass">
  <div class="rc-panel">
    <p class="rc-eyebrow">// reading compass</p>
    <h2 class="rc-title">이 글과 이어지는 경로</h2>
    <p class="rc-sub">시리즈, 카테고리, 태그 겹침, 최신도를 점수화해 가까운 글일수록 중심에 배치합니다.</p>
    <div class="reading-compass-root" data-node-id="__SLUG__">
      <div class="rc-orbit-wrap">
        <div class="rc-orbit"></div>
        <div class="rc-hint">hover nodes or cards · click a node to pin</div>
      </div>
      <div class="rc-next">
        <div class="rc-next-head"><span>Next reads</span><span class="rc-next-count">0</span></div>
        <div class="rc-cards"></div>
      </div>
    </div>
  </div>
</section>

<a class="home-link" href="../../index.html">&larr; 테크트리 전체로 돌아가기</a>
</main>
<aside class="toc">
  <h3>On this page</h3>
  <ul>
    <li><a href="#sec-content">내용</a></li>
    <li><a href="#sec-compass">Reading Compass</a></li>
  </ul>
</aside>
</div>
</div>
<script src="../../assets/nodes-index.js"></script>
<script src="../../assets/site-chrome.js"></script>
<script src="../../assets/reading-compass.js"></script>
</body>
</html>
"""


def render_post_html(*, title, eyebrow, type_badge, body_html, category, category_q, tag_chips, date, slug):
    out = POST_TEMPLATE
    # __BODY_HTML__ replaced last since it's the one field that could (in
    # principle) contain another placeholder-looking token in user content.
    for token, value in [
        ("__TITLE__", title),
        ("__EYEBROW__", eyebrow),
        ("__TYPE_BADGE__", type_badge),
        ("__CATEGORY__", category),
        ("__CATEGORY_Q__", category_q),
        ("__TAG_CHIPS__", tag_chips),
        ("__DATE__", date),
        ("__SLUG__", slug),
    ]:
        out = out.replace(token, value)
    return out.replace("__BODY_HTML__", body_html)


def build_posts():
    posts = []
    if not CONTENT_DIR.exists():
        return posts
    for md_file in sorted(CONTENT_DIR.rglob("*.md")):
        if md_file.name.lower() == "readme.md":
            continue
        text = md_file.read_text(encoding="utf-8")
        fm, body = read_frontmatter(text)

        title = str(fm.get("title") or md_file.stem)
        category = str(fm.get("category") or title_case_folder(md_file.parent.name))
        raw_tags = [str(t) for t in (fm.get("tags") or [])]
        post_type = str(fm.get("type") or "post")  # paper | post
        date = str(fm.get("date") or datetime.date.today().isoformat())
        slug = slugify(str(fm.get("slug") or md_file.stem))

        body_html = markdown.markdown(body, extensions=["extra", "sane_lists"])
        plain = re.sub(r"<[^>]+>", " ", body_html)
        plain = html.unescape(re.sub(r"\s+", " ", plain)).strip()
        excerpt = plain[:110] + ("…" if len(plain) > 110 else "")
        read_min = max(1, -(-len(plain) // 350))

        type_tag = "논문" if post_type == "paper" else "포스트"
        tags = list(dict.fromkeys([tag_token(t) for t in raw_tags] + [type_tag]))
        tag_chips = "".join(
            '<a class="tag-chip" href="../../archive.html?tag={t}">#{t}</a>'.format(t=t)
            for t in tags
        )

        out_dir = POSTS_DIR / slug
        out_dir.mkdir(parents=True, exist_ok=True)
        (out_dir / "index.html").write_text(
            render_post_html(
                title=html.escape(title),
                eyebrow="Paper Review" if post_type == "paper" else "Blog Post",
                type_badge=type_tag,
                body_html=body_html,
                category=html.escape(category),
                category_q=category.replace(" ", "%20").replace("/", "%2F"),
                tag_chips=tag_chips,
                date=date,
                slug=slug,
            ),
            encoding="utf-8",
        )
        posts.append(
            {
                "id": slug,
                "title": title,
                "category": category,
                "tags": tags,
                "updated": date,
                "type": "sub",
                "kind": "post",
                "href": "posts/" + slug + "/index.html",
                "excerpt": excerpt,
                "readMin": read_min,
            }
        )
        print("built post:", slug)
    return posts


def scan_blocks():
    nodes = []
    for d in sorted(BLOCKS_DIR.iterdir()):
        f = d / "index.html"
        if not (d.is_dir() and d.name.startswith("node-") and f.exists()):
            continue
        h = f.read_text(encoding="utf-8")

        title_m = re.search(r"<h1>(.*?)</h1>", h, re.S)
        title = re.sub(r"\s+", " ", html.unescape(re.sub(r"<br\s*/?>", " ", title_m.group(1)))).strip()

        cat_m = re.search(r"카테고리</span><span>(?:<a[^>]*>|<span[^>]*>)?([^<]*)", h)
        category = cat_m.group(1).strip() if cat_m else ""

        upd_m = re.search(r"업데이트</span><span>([^<]*)</span>", h)
        updated = upd_m.group(1) if upd_m else ""

        tag_m = re.search(
            r'Tag</span><span>(.*?)</span></div>\s*<div class="meta-item"><span class="meta-label">업데이트',
            h, re.S,
        )
        tags = re.findall(r"#([^<]+)</a>", tag_m.group(1)) if tag_m else []
        node_type = "main" if "원본노드" in tags else "sub"

        box_m = re.search(r'<div class="content-box">(.*?)</div>\s*</section>', h, re.S)
        box_html = box_m.group(1) if box_m else ""
        paras = re.findall(r"<p>(.*?)</p>", box_html, re.S)
        plain_all = html.unescape(re.sub(r"<[^>]+>", "", " ".join(paras)))
        plain_all = re.sub(r"\s+", " ", plain_all).strip()
        first_para = html.unescape(re.sub(r"<[^>]+>", "", paras[0])) if paras else plain_all[:120]
        first_para = re.sub(r"\s+", " ", first_para).strip()
        excerpt = first_para[:110] + ("…" if len(first_para) > 110 else "")
        read_min = max(1, -(-len(plain_all) // 350))

        nodes.append(
            {
                "id": d.name,
                "title": title,
                "category": category,
                "tags": tags,
                "updated": updated,
                "type": node_type,
                "kind": "node",
                "href": "blocks/" + d.name + "/index.html",
                "excerpt": excerpt,
                "readMin": read_min,
            }
        )
    return nodes


def main():
    posts = build_posts()
    nodes = scan_blocks()
    all_entries = nodes + posts
    js = (
        "// Auto-generated by scripts/build_content.py — do not hand-edit.\n"
        "// Regenerate: python3 scripts/build_content.py\n"
        "window.AI_TECHTREE_NODES = " + json.dumps(all_entries, ensure_ascii=False) + ";\n"
    )
    NODES_INDEX.write_text(js, encoding="utf-8")
    print(f"nodes-index.js: {len(nodes)} tech-tree nodes + {len(posts)} posts = {len(all_entries)} total")


if __name__ == "__main__":
    main()
