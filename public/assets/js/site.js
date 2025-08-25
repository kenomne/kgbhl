// Simple namespace
const HL = (() => {
  const ACTIVE = document.body.getAttribute('data-active') || 'home';
  const STORAGE_PREFIX = 'hl1_template_';
  const uid = (() => {
    let u = localStorage.getItem(STORAGE_PREFIX+'uid');
    if(!u){ u = Math.random().toString(36).slice(2); localStorage.setItem(STORAGE_PREFIX+'uid', u); }
    return u;
  })();

  // Clock
  function tickClock(){
    const el = document.getElementById('clock');
    if(!el) return;
    const d = new Date();
    el.textContent = d.toLocaleTimeString();
  }
  setInterval(tickClock, 1000);
  tickClock();

  // Calendar
  function buildCalendar(){
    const el = document.getElementById('calendar');
    if(!el) return;
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m+1, 0);
    const weeks = [];
    let w = [];
    for(let i=0;i<first.getDay();i++){ w.push(''); }
    for(let d=1; d<=last.getDate(); d++){
      w.push(d);
      if(w.length===7){ weeks.push(w); w=[]; }
    }
    if(w.length) { while(w.length<7) w.push(''); weeks.push(w); }
    let html = '<table class="table"><thead><tr><th>Su</th><th>Mo</th><th>Tu</th><th>We</th><th>Th</th><th>Fr</th><th>Sa</th></tr></thead><tbody>';
    weeks.forEach(row => {
      html += '<tr>' + row.map(d => {
        const today = (d===now.getDate()) ? ' style="color:var(--accent);font-weight:800"' : '';
        return `<td${today}>${d||''}</td>`;
      }).join('') + '</tr>';
    });
    html += '</tbody></table>';
    el.innerHTML = html;
  }
  buildCalendar();

  // Menu toggle
  function toggleMenu(){
    const sb = document.getElementById('sidebar');
    if(!sb) return;
    sb.classList.toggle('open');
  }

  // Activate current menu item
  function activateMenu(){
    document.querySelectorAll('.mi').forEach(a => {
      if(a.dataset.mi === ACTIVE) a.classList.add('active');
    });
  }
  activateMenu();

  // Stats (local-only)
  function bumpViews(){
    const pageKey = STORAGE_PREFIX + 'views_' + location.pathname.split('/').pop();
    const totalKey = STORAGE_PREFIX + 'views_total';
    const page = (parseInt(localStorage.getItem(pageKey))||0)+1;
    const total = (parseInt(localStorage.getItem(totalKey))||0)+1;
    localStorage.setItem(pageKey, page);
    localStorage.setItem(totalKey, total);
    const sp = document.getElementById('statPage');
    const st = document.getElementById('statTotal');
    if(sp) sp.textContent = page;
    if(st) st.textContent = total;
  }
  bumpViews();

  // "Online" estimation via heartbeat in localStorage
  function heartbeat(){
    const hbKey = STORAGE_PREFIX + 'heartbeats';
    const now = Date.now();
    const arr = JSON.parse(localStorage.getItem(hbKey) || '[]').filter(ts => now - ts < 15000);
    arr.push(now);
    localStorage.setItem(hbKey, JSON.stringify(arr));
    const online = new Set(arr.map(ts => Math.round(ts/5000))).size; // rough uniqueness
    const el = document.getElementById('statOnline');
    if(el) el.textContent = online;
  }
  setInterval(heartbeat, 5000);
  heartbeat();

  // Poll
  function renderPoll(){
    const key = STORAGE_PREFIX+'poll';
    const data = JSON.parse(localStorage.getItem(key) || '{"1":0,"2":0,"3":0,"4":0,"5":0}');
    const total = Object.values(data).reduce((a,b)=>a+b,0) || 1;
    const el = document.getElementById('pollResults');
    if(!el) return;
    el.innerHTML = ['5','4','3','2','1'].map(v => {
      const pct = Math.round((data[v]/total)*100);
      return `<div class="bar"><span>${v}★</span><div class="barline"><i style="width:${pct}%"></i></div><b>${pct}%</b></div>`;
    }).join('');
  }
  function submitPoll(e){
    e.preventDefault();
    const form = e.target;
    const val = (new FormData(form)).get('rating');
    if(!val) return false;
    const key = STORAGE_PREFIX+'poll';
    const votedKey = STORAGE_PREFIX+'voted';
    if(localStorage.getItem(votedKey)) { alert('You already voted (local).'); return false; }
    const data = JSON.parse(localStorage.getItem(key) || '{"1":0,"2":0,"3":0,"4":0,"5":0}');
    data[val] = (data[val]||0)+1;
    localStorage.setItem(key, JSON.stringify(data));
    localStorage.setItem(votedKey, '1');
    renderPoll();
    return false;
  }
  renderPoll();

  // Chat (local-only)
  function loadChat(){
    const box = document.getElementById('chatMessages');
    if(!box) return;
    const logs = JSON.parse(localStorage.getItem(STORAGE_PREFIX+'chat')||'[]').slice(-100);
    box.innerHTML = logs.map(m => `<div class="msg"><span class="by">${m.name}:</span> <span>${m.text}</span></div>`).join('');
    box.scrollTop = box.scrollHeight;
  }
  function sendChat(e){
    e.preventDefault();
    const name = document.getElementById('chatName').value.trim() || 'guest';
    const text = document.getElementById('chatText').value.trim();
    if(!text) return false;
    const logs = JSON.parse(localStorage.getItem(STORAGE_PREFIX+'chat')||'[]');
    logs.push({name:name.slice(0,24), text:text.slice(0,200), t:Date.now()});
    localStorage.setItem(STORAGE_PREFIX+'chat', JSON.stringify(logs));
    document.getElementById('chatText').value='';
    loadChat();
    return false;
  }
  window.addEventListener('storage', (ev)=>{
    if(ev.key && ev.key.startsWith(STORAGE_PREFIX)) { loadChat(); renderPoll(); heartbeat(); }
  });
  loadChat();
  document.getElementById('chat-toggle').addEventListener('click', function(){
    document.getElementById('chat-box').classList.toggle('open');
  });

  document.addEventListener('DOMContentLoaded', function() {
    var chatInput = document.getElementById('chat-input');
    if(chatInput) {
        chatInput.addEventListener('keypress', function(e){
            if(e.key === 'Enter'){
                let msg = this.value.trim();
                if(msg !== ''){
                    let messages = document.getElementById('chat-messages');
                    messages.innerHTML += `<div>${msg}</div>`;
                    this.value = '';
                    messages.scrollTop = messages.scrollHeight;
                }
            }
        });
    }
});


  // Search
  async function searchSite(e){
    e.preventDefault();
    const q = (document.getElementById('siteSearch').value||'').toLowerCase().trim();
    if(!q) return false;
    const res = await fetch('assets/js/search-index.json').then(r=>r.json()).catch(()=>[]);
    const hits = res.filter(it => it.title.toLowerCase().includes(q) || it.snippet.toLowerCase().includes(q));
    const html = hits.slice(0,20).map(h => `<div class="section"><a class="link" href="${h.href}"><b>${h.title}</b></a><div class="small muted">${h.snippet}</div></div>`).join('') || '<div class="section">No results.</div>';
    const main = document.querySelector('main.content');
    const wrap = document.createElement('div');
    wrap.innerHTML = `<div class="section"><h3>Search results for: ${q}</h3></div>` + html;
    main.prepend(wrap);
    return false;
  }

  // Expose
  return { toggleMenu, submitPoll, sendChat, searchSite };
})();
