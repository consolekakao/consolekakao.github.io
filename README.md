# consolekakao.github.io

소프트웨어와 하드웨어 사이 어딘가에서 만든 것들, 그리고 삽질 기록.

[Jekyll](https://jekyllrb.com) + [Just the Docs](https://just-the-docs.github.io/just-the-docs/)로
빌드하고 GitHub Pages에 배포한다.

## 구조

```
docs/
├── software/        소프트웨어 개발 — 서버 · 앱 · 프론트 · 인프라
├── hardware/        하드웨어 개발 — ROS · 센서 · 로봇 · 회로
│   └── smart-factory.md + ros-*.md   (시리즈)
├── cs/              CS 지식 — 프로토콜 · DB · 네트워크
├── retrospective/   회고
└── assets/<카테고리>/<슬러그>/   이미지

_sass/custom/
├── setup.scss       색 팔레트 · 타이포 변수 (테마 기본값 덮어쓰기)
└── custom.scss      레이아웃 · 컴포넌트 스타일

_includes/
├── head_custom.html            폰트 로딩
├── components/sidebar.html     테마 오버라이드 (사이트 한 줄 소개 추가)
├── toc_heading_custom.html     하위 글 목록 제목
└── search_placeholder_custom.html
```

## 로컬 실행

```bash
bundle install
bundle exec jekyll serve --livereload
# http://127.0.0.1:4000
```

Ruby 3.4 이상에서는 `logger` / `csv` / `base64` / `bigdecimal` 이 기본 젬에서 빠져
Gemfile에 명시해 두었다.

## 새 글 쓰기

```bash
./_private/new-post.sh <sw|hw|cs|retro> <슬러그> "<제목>"
```

Claude Code에서는 `/post`, 기존 글을 다듬을 땐 `/polish`.

작성 규칙은 `_private/WRITING_GUIDE.md`에 있다. (`_private/`는 커밋되지 않는다)
