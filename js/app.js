let currentLang = localStorage.getItem('philoLang') || 'ko';
let cachedData = null;

// --- Dark Mode ---
(function() {
  const saved = localStorage.getItem('philoTheme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && prefersDark)) document.body.classList.add('dark');
})();

function initThemeToggle() {
  const btn = document.getElementById('theme-btn');
  btn.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark');
    localStorage.setItem('philoTheme', isDark ? 'dark' : 'light');
  });
}

function getContent(data) {
  if (currentLang === 'ko' || !data.translations?.[currentLang]) return data;
  const t = data.translations[currentLang];
  return {
    ...data,
    topic: { ...data.topic, ...t.topic },
    philosophers: {
      A: { ...data.philosophers.A, ...t.philosophers.A },
      B: { ...data.philosophers.B, ...t.philosophers.B },
    },
    debate: t.debate,
    summary: t.summary,
  };
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}
function initials(name) { return name.charAt(0); }
function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

// --- Lang Switcher ---
function initLangSwitcher() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    if (btn.dataset.lang === currentLang) btn.classList.add('active');
    btn.addEventListener('click', () => {
      if (btn.dataset.lang === currentLang) return;
      currentLang = btn.dataset.lang;
      localStorage.setItem('philoLang', currentLang);
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.toggle('active', b.dataset.lang === currentLang));
      if (cachedData) rerenderContent(cachedData);
    });
  });
}

function rerenderContent(data) {
  const d = getContent(data);
  renderHeader(d);
  renderDilemma(d);
  renderMessages(d.debate, d.philosophers);
  renderSummary(d.summary);
}

// --- Episode Panel ---
const overlay  = document.getElementById('panel-overlay');
const panel    = document.getElementById('episode-panel');
const btnOpen  = document.getElementById('ep-list-btn');
const btnClose = document.getElementById('panel-close');
function openPanel()  { panel.classList.add('open'); overlay.classList.add('open'); }
function closePanel() { panel.classList.remove('open'); overlay.classList.remove('open'); }
btnOpen.addEventListener('click', openPanel);
btnClose.addEventListener('click', closePanel);
overlay.addEventListener('click', closePanel);

// --- Philosopher Modal ---
const modalOverlay = document.getElementById('philo-modal-overlay');
const modal        = document.getElementById('philo-modal');
const modalClose   = document.getElementById('modal-close');
let currentPhilos  = null;

function openPhiloModal(side) {
  const p = currentPhilos[side];
  document.getElementById('modal-content').innerHTML = `
    <div class="modal-avatar ${side.toLowerCase()}">${initials(p.name)}</div>
    <div class="modal-name">${p.name}</div>
    <div class="modal-period">${p.period}</div>
    <div class="modal-section-label">주장</div>
    <div class="modal-text">${p.stance}</div>
    <div class="modal-section-label">핵심 철학</div>
    <div class="modal-text">${p.key_philosophy}</div>
  `;
  modalOverlay.classList.add('open');
}
function closeModal() { modalOverlay.classList.remove('open'); }
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

// --- Render ---
function renderHeader(data) {
  const a = data.philosophers.A, b = data.philosophers.B;
  document.getElementById('chat-header-names').textContent = `${a.name} · ${b.name}`;
  document.getElementById('chat-header-topic').textContent = data.topic.title;
  document.getElementById('chat-header-avatars').innerHTML = `
    <button class="header-avatar a" data-side="A" aria-label="${a.name} 프로필">${initials(a.name)}</button>
    <button class="header-avatar b" data-side="B" aria-label="${b.name} 프로필">${initials(b.name)}</button>
  `;
  document.querySelectorAll('.header-avatar').forEach(btn => {
    btn.addEventListener('click', () => openPhiloModal(btn.dataset.side));
  });
  document.title = `${data.topic.title} — Katabasis`;
}

function renderDilemma(data) {
  const { topic, date } = data;
  document.getElementById('dilemma-bar').innerHTML = `
    <div class="dilemma-meta">${topic.category} · ${topic.source} · ${formatDate(date)}</div>
    <div class="dilemma-q">${topic.dilemma}</div>
  `;
}

function renderMessages(debate, philosophers) {
  const msgs = debate.map(turn => {
    const side = turn.speaker;
    const p = philosophers[side];
    const cls = side.toLowerCase();
    return `
      <div class="msg-row ${cls}">
        <button class="msg-avatar ${cls}" data-side="${side}" aria-label="${p.name} 프로필">${initials(p.name)}</button>
        <div class="msg-body">
          <div class="msg-bubble ${cls}">${turn.message}</div>
          <div class="msg-turn">#${turn.turn}</div>
        </div>
      </div>
    `;
  }).join('');
  document.getElementById('chat-messages').innerHTML = msgs;
  document.querySelectorAll('.msg-avatar').forEach(btn => {
    btn.addEventListener('click', () => openPhiloModal(btn.dataset.side));
  });
}

function renderSummary(summary) {
  const tags = summary.philosophical_keywords
    .map(k => `<span class="keyword-tag">${k}</span>`).join('');
  document.getElementById('summary-wrap').innerHTML = `
    <div class="summary-section">
      <div class="summary-title">핵심 쟁점</div>
      <div class="summary-text">${summary.core_disagreement}</div>
      <div class="keywords">${tags}</div>
    </div>
  `;
}

function renderPanelList(episodes, activeId) {
  const sorted = [...episodes].sort((a, b) =>
    b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
  );
  document.getElementById('panel-list').innerHTML = sorted.map(ep => {
    const [philoA, philoB] = ep.philosophers;
    return `
      <button class="panel-ep-card${ep.id === activeId ? ' active' : ''}" data-id="${ep.id}">
        <div class="pep-meta">
          <span class="ep-date">${formatDate(ep.date)}</span>
          <span class="ep-badge">${ep.category}</span>
        </div>
        <div class="pep-topic">${ep.topic}</div>
        <div class="ep-philosophers">
          <div class="ep-philo"><span class="ep-philo-dot a"></span><span>${philoA}</span></div>
          <span class="ep-vs">VS</span>
          <div class="ep-philo"><span class="ep-philo-dot b"></span><span>${philoB}</span></div>
        </div>
      </button>
    `;
  }).join('');
  document.querySelectorAll('.panel-ep-card').forEach(card => {
    card.addEventListener('click', () => { loadEpisode(card.dataset.id); closePanel(); });
  });
}

// --- Article Schema ---
function injectArticleSchema(data, id) {
  const existing = document.getElementById('episode-schema');
  if (existing) existing.remove();
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': data.topic.title,
    'description': data.topic.dilemma,
    'datePublished': data.date,
    'url': `https://katabasis.shop/?id=${id}`,
    'author': [
      { '@type': 'Person', 'name': data.philosophers.A.name },
      { '@type': 'Person', 'name': data.philosophers.B.name }
    ],
    'keywords': data.summary.philosophical_keywords.join(', '),
    'about': { '@type': 'Thing', 'name': data.topic.category },
    'publisher': { '@type': 'Organization', 'name': 'Katabasis', 'url': 'https://katabasis.shop' }
  };
  const script = document.createElement('script');
  script.id = 'episode-schema';
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

// --- Load Episode ---
let allEpisodes = [];

async function loadEpisode(id) {
  document.getElementById('loading-state').style.display = 'block';
  document.getElementById('episode-content').style.display = 'none';
  try {
    const res = await fetch(`philochat/${id}_philosopher_debate.json`);
    if (!res.ok) throw new Error();
    const data = await res.json();
    cachedData = data;
    const d = getContent(data);
    currentPhilos = d.philosophers;
    renderHeader(d);
    renderDilemma(d);
    renderMessages(d.debate, d.philosophers);
    renderSummary(d.summary);
    document.getElementById('loading-state').style.display = 'none';
    document.getElementById('episode-content').style.display = 'block';
    injectArticleSchema(data, id);
    history.replaceState(null, '', `?id=${id}`);
    renderPanelList(allEpisodes, id);
    window.scrollTo(0, 0);
  } catch(e) {
    document.getElementById('loading-state').innerHTML = '<p class="error-msg">에피소드를 불러올 수 없습니다.</p>';
  }
}

async function init() {
  try {
    const res = await fetch('philochat/episodes.json');
    if (!res.ok) throw new Error();
    allEpisodes = await res.json();
    const urlId  = new URLSearchParams(window.location.search).get('id');
    const today  = todayStr();
    const sorted = [...allEpisodes].sort((a, b) =>
      b.date.localeCompare(a.date) || b.id.localeCompare(a.id)
    );
    let targetId;
    if (urlId && allEpisodes.find(e => e.id === urlId)) targetId = urlId;
    else targetId = sorted.find(e => e.date === today)?.id || sorted[0]?.id;
    initLangSwitcher();
    initThemeToggle();
    renderPanelList(allEpisodes, targetId);
    if (targetId) await loadEpisode(targetId);
  } catch(e) {
    document.getElementById('loading-state').innerHTML = '<p class="error-msg">에피소드를 불러올 수 없습니다.</p>';
  }
}

init();
