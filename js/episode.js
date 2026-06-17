function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function initials(name) {
  return name.charAt(0);
}

function renderTopicBanner(data) {
  const { topic, date } = data;
  return `
    <div class="topic-category">${topic.category} &nbsp;·&nbsp; ${formatDate(date)}</div>
    <div class="topic-source">${topic.source}</div>
    <div class="topic-title">${topic.title}</div>
    <div class="topic-dilemma">${topic.dilemma}</div>
  `;
}

function renderPhiloCards(phils) {
  const a = phils.A;
  const b = phils.B;
  return `
    <div class="philo-cards">
      <div class="philo-card a">
        <div class="philo-name-row">
          <div class="philo-avatar a">${initials(a.name)}</div>
          <div>
            <div class="philo-name">${a.name}</div>
            <div class="philo-period">${a.period}</div>
          </div>
        </div>
        <div class="philo-stance-label">주장</div>
        <div class="philo-stance">${a.stance}</div>
      </div>
      <div class="philo-card b">
        <div class="philo-name-row">
          <div class="philo-avatar b">${initials(b.name)}</div>
          <div>
            <div class="philo-name">${b.name}</div>
            <div class="philo-period">${b.period}</div>
          </div>
        </div>
        <div class="philo-stance-label">주장</div>
        <div class="philo-stance">${b.stance}</div>
      </div>
    </div>
  `;
}

function renderMessages(debate, philosophers) {
  const msgs = debate.map(turn => {
    const side = turn.speaker.toLowerCase();
    const philo = philosophers[turn.speaker];
    return `
      <div class="msg ${side}">
        <div class="msg-avatar ${side}">${initials(philo.name)}</div>
        <div class="msg-body">
          <div class="msg-name">${philo.name} <span class="msg-turn">#${turn.turn}</span></div>
          <div class="msg-bubble">${turn.message}</div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <div class="chat-section">
      <div class="chat-section-label">토론</div>
      <div class="chat-messages">${msgs}</div>
    </div>
  `;
}

function renderSummary(summary) {
  const tags = summary.philosophical_keywords.map(k =>
    `<span class="keyword-tag">${k}</span>`
  ).join('');
  return `
    <div class="summary-section">
      <div class="summary-title">핵심 쟁점</div>
      <div class="summary-text">${summary.core_disagreement}</div>
      <div class="keywords">${tags}</div>
    </div>
  `;
}

async function init() {
  const id = getParam('id');
  if (!id) {
    window.location.href = 'index.html';
    return;
  }

  const bannerEl = document.getElementById('topic-banner');
  const philoWrap = document.getElementById('philo-cards-wrap');
  const chatWrap = document.getElementById('chat-wrap');
  const summaryWrap = document.getElementById('summary-wrap');

  try {
    const res = await fetch(`philochat/${id}_philosopher_debate.json`);
    if (!res.ok) throw new Error('not found');
    const data = await res.json();

    document.title = `${data.topic.title} — 철학자톡`;

    bannerEl.querySelector('.container').innerHTML = renderTopicBanner(data);
    philoWrap.innerHTML = renderPhiloCards(data.philosophers);
    chatWrap.innerHTML = renderMessages(data.debate, data.philosophers);
    summaryWrap.innerHTML = renderSummary(data.summary);
  } catch (e) {
    bannerEl.querySelector('.container').innerHTML =
      '<p class="error-msg">에피소드를 불러올 수 없습니다.</p>';
  }
}

init();
