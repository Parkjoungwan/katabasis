# Katabasis

> **Dead minds. Live questions.**
> 역사 속 두 철학자가 매일 오늘의 딜레마를 두고 토론한다.

[katabasis.shop](https://katabasis.shop)

---

## 개요

Katabasis는 매일 한 가지 현대적 딜레마를 두고 상반된 입장의 철학자 두 명이 채팅 형식으로 토론하는 정적 웹사이트다. 이름 *Katabasis*(κατάβασις)는 고대 그리스의 "지하 세계로의 하강"을 뜻하며, 죽은 사상가들을 다시 살아있는 담론으로 불러낸다는 의미를 담았다.

- 채팅 형식의 철학 토론 (회당 16~20개 발언)
- 4개 언어 지원: 한국어 · English · 中文 · 日本語
- 하루 1개 이상의 에피소드 (날짜 기반 ID)
- 다크 모드 / 라이트 모드

## 기술 스택

순수 정적 사이트 — 빌드 의존성 없음.

- Vanilla JavaScript (프레임워크 없음)
- HTML / CSS
- 콘텐츠는 JSON 파일로 관리
- Cloudflare Workers (정적 에셋 호스팅)

## 프로젝트 구조

```
.
├── index.html          # 메인 페이지 (오늘의 에피소드 + 목록 패널)
├── episode.html        # 개별 에피소드 페이지
├── css/style.css       # 스타일 (다크/라이트 모드 포함)
├── js/
│   ├── app.js          # 메인 앱 로직, 다국어, JSON-LD 주입
│   └── episode.js      # 에피소드 페이지 렌더링
├── philochat/
│   ├── episodes.json   # 전체 에피소드 인덱스
│   └── YYYY-MM-DD[-N]_philosopher_debate.json  # 개별 토론 데이터
├── build.sh            # dist/ 로 정적 에셋 복사
├── wrangler.toml       # Cloudflare 배포 설정
├── sitemap.xml         # SEO
├── robots.txt          # SEO
└── llms.txt            # GEO (LLM 크롤러용)
```

## 콘텐츠 데이터 형식

각 에피소드는 `philochat/YYYY-MM-DD[-N]_philosopher_debate.json` 파일이다.
같은 날 여러 에피소드는 `-2`, `-3` 접미사로 구분한다.

```json
{
  "date": "2026-06-22",
  "topic": { "title": "...", "category": "...", "source": "...", "dilemma": "..." },
  "philosophers": {
    "A": { "name": "...", "period": "...", "stance": "...", "key_philosophy": "..." },
    "B": { "name": "...", "period": "...", "stance": "...", "key_philosophy": "..." }
  },
  "debate": [ { "turn": 1, "speaker": "A", "message": "..." } ],
  "summary": { "core_disagreement": "...", "philosophical_keywords": ["..."] },
  "translations": { "en": { ... }, "zh": { ... }, "ja": { ... } }
}
```

`philochat/episodes.json` 에는 인덱스 항목을 추가한다:

```json
{ "id": "2026-06-22", "date": "2026-06-22", "topic": "...", "category": "...", "philosophers": ["A", "B"] }
```

## 로컬 실행

정적 파일이므로 아무 정적 서버로 띄우면 된다.

```bash
npx serve -p 3030 .
```

`http://localhost:3030` 접속.

## 배포

`main` 브랜치 push 시 Cloudflare가 자동 배포한다.

- Build command: `bash build.sh`
- Output: `dist/`
- `wrangler.toml` 의 `[assets]` 설정으로 `dist/` 만 배포 (node_modules 제외)

## SEO / GEO

- `sitemap.xml`, `robots.txt`, canonical, hreflang (ko/en/zh/ja)
- Open Graph / Twitter Card 메타
- `WebSite` + 에피소드별 `Article` JSON-LD (동적 주입)
- `llms.txt` — LLM 크롤러에 사이트 구조·인용 형식 안내
- Google Analytics (GA4) + Search Console 연동
