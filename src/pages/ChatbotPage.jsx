// ═══════════════════════════════════════════
//  SYNCARE — ChatbotPage.jsx
//  عطعوط - AI Assistant Chatbot
// ═══════════════════════════════════════════
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChatbotPage.css';

const AVATAR = `${process.env.PUBLIC_URL}/bot-avatar.jpg`;
const avatarStyle = { width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' };

/* ── CONSTANTS ── */
const CLINICS = [
  { key:'adult_general', ar:'الباطنة العامة', en:'General Medicine', icon:'🩺' },
  { key:'surgery',       ar:'الجراحة',       en:'Surgery',          icon:'🔪' },
  { key:'womens',        ar:'النساء والتوليد',en:"Women's Health",   icon:'🤰' },
  { key:'children',      ar:'طب الأطفال',    en:'Pediatrics',       icon:'👶' },
  { key:'heart',         ar:'القلب والأوعية', en:'Heart Clinic',     icon:'❤️' },
  { key:'eye',           ar:'طب العيون',     en:'Eye Clinic',       icon:'👁️' },
  { key:'bones',         ar:'العظام والمفاصل',en:'Orthopedics',      icon:'🦴' },
  { key:'brain',         ar:'المخ والأعصاب', en:'Neurology',        icon:'🧠' },
  { key:'skin',          ar:'الجلدية',       en:'Dermatology',      icon:'🧴' },
  { key:'oncology',      ar:'الأورام',       en:'Oncology',         icon:'🎗️' },
  { key:'ent',           ar:'أنف وأذن وحنجرة',en:'ENT',             icon:'👂' },
];

const TIMES = ['09:00 AM','10:00 AM','11:00 AM','12:00 PM','01:00 PM','02:00 PM','03:00 PM','04:00 PM','05:00 PM'];

const MEDICAL_KW = ['صداع','ألم','حرارة','كحة','إسهال','دوخة','حساسية','ضغط','سكر','headache','pain','fever','nausea'];

// eslint-disable-next-line no-unused-vars
const CONFIG = {
  API_BASE: 'https://syncare-api.onrender.com',
  ENDPOINTS: { BOOK:'/patient/appointments/book/', APPOINTMENTS:'/patient/appointments/', CANCEL:'/patient/appointments/cancel/' },
};

function getDays() {
  const days = [];
  const ar = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
  const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  for (let i = 0; i < 7; i++) {
    const d = new Date(); d.setDate(d.getDate() + i);
    days.push({ name: ar[d.getDay()], num: d.getDate(), month: months[d.getMonth()], full: d.toISOString().split('T')[0] });
  }
  return days;
}

function getTime() {
  return new Date().toLocaleTimeString('ar-EG', { hour:'2-digit', minute:'2-digit' });
}

function detectClinic(text) {
  const map = [
    { keys:['باطنة','internal','general medicine'], key:'adult_general' },
    { keys:['جراح','surgery'], key:'surgery' },
    { keys:['نسا','women'], key:'womens' },
    { keys:['أطفال','children','طفل'], key:'children' },
    { keys:['قلب','heart','cardiac'], key:'heart' },
    { keys:['عين','عيون','eye'], key:'eye' },
    { keys:['عظم','عظام','bone','joint'], key:'bones' },
    { keys:['مخ','أعصاب','brain','neuro'], key:'brain' },
    { keys:['جلد','skin'], key:'skin' },
    { keys:['ورم','أورام','cancer'], key:'oncology' },
    { keys:['أنف','أذن','حنجرة','ent','ear'], key:'ent' },
  ];
  const t = text.toLowerCase();
  for (const m of map) if (m.keys.some(k => t.includes(k))) return CLINICS.find(c => c.key === m.key);
  return null;
}

/* ── COMPONENT ── */
const ChatbotPage = () => {
  const navigate = useNavigate();
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState([]);
  const [typing, setTyping] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [toast, setToast] = useState('');
  const [step, setStep] = useState('idle');
  const [booking, setBooking] = useState({});

  const stepRef = useRef('idle');
  const bookingRef = useRef({});
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { bookingRef.current = booking; }, [booking]);

  // Scroll to bottom
  useEffect(() => {
    if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
  }, [messages, typing]);

  // Init
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 700);
    const t2 = setTimeout(() => {
      addBotMsg('مرحباً! 👋<br>أنا عطعوط، مساعدك الذكي من <strong>Syncare</strong><br>أنا هنا لمساعدتك في حجز المواعيد، عرض مواعيدك، وإلغاء المواعيد بسهولة.');
    }, 1200);
    return () => { clearTimeout(t); clearTimeout(t2); };
    // eslint-disable-next-line
  }, []);

  // eslint-disable-next-line no-unused-vars
  const showToastMsg = (msg) => { setToast(msg); setTimeout(() => setToast(''), 2500); };

  const addBotMsg = useCallback((html) => {
    setMessages(prev => [...prev, { type:'bot', html, time: getTime() }]);
  }, []);

  const addUserMsg = (text) => {
    setMessages(prev => [...prev, { type:'user', text, time: getTime() }]);
  };

  const botReply = useCallback((html, delay = 900) => {
    setTyping(true); setInputDisabled(true);
    return new Promise(resolve => {
      setTimeout(() => { setTyping(false); addBotMsg(html); setInputDisabled(false); resolve(); }, delay);
    });
  }, [addBotMsg]);

  /* ── CLINIC SELECTION ── */
  const selectClinic = useCallback((key, ar, en) => {
    const clinic = CLINICS.find(c => c.key === key);
    const days = getDays();
    const newBooking = { clinic, date: days[1].full, dateLabel: `${days[1].name} ${days[1].num} ${days[1].month}` };
    setBooking(newBooking);
    bookingRef.current = newBooking;
    addUserMsg(`${ar} - ${en}`);
    setStep('await_time');
    stepRef.current = 'await_time';
    const newB = { ...newBooking, time: '02:00 PM' };
    setBooking(newB);
    bookingRef.current = newB;
    botReply(buildTimeSlots(), 800);
  }, [botReply]);

  // Make selectClinic available globally for innerHTML onclick
  useEffect(() => {
    window.__cbSelectClinic = selectClinic;
    return () => { delete window.__cbSelectClinic; };
  }, [selectClinic]);

  /* ── HTML Builders ── */
  const buildClinicsGrid = () => {
    return `<div style="font-size:13px;margin-bottom:8px;">اختار العيادة 🏥</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px">
        ${CLINICS.map(c => `
          <div onclick="window.__cbSelectClinic('${c.key}','${c.ar}','${c.en}')" style="
            background:rgba(5,12,28,.8);border:1px solid rgba(0,180,216,.1);border-radius:12px;
            padding:9px 11px;display:flex;align-items:center;gap:8px;cursor:pointer;transition:all .2s">
            <div style="width:30px;height:30px;border-radius:8px;background:rgba(0,180,216,.1);
              border:1px solid rgba(0,180,216,.1);display:flex;align-items:center;justify-content:center;font-size:15px">${c.icon}</div>
            <div>
              <div style="font-size:12px;font-weight:700">${c.ar}</div>
              <div style="font-size:9.5px;color:#3d6e88;margin-top:1px">${c.en}</div>
            </div>
          </div>`).join('')}
      </div>`;
  };

  /* ── PROCESS ── */
  const processMessage = useCallback(async (text) => {
    const t = text.trim();
    if (!t) return;
    addUserMsg(t);
    const currentStep = stepRef.current;
    const currentBooking = bookingRef.current;

    if (MEDICAL_KW.some(k => t.toLowerCase().includes(k)) && currentStep === 'idle') {
      await botReply('أنا مساعد للحجوزات والتنظيم فقط ومقدرش أقدم استشارات طبية 🩺<br>يُفضل التواصل مع دكتور متخصص.');
      return;
    }

    switch (currentStep) {
      case 'idle': {
        if (/عيادة|عيادات|clinic/i.test(t)) { await botReply(buildClinicsGrid(), 700); break; }
        if (/مواعيدي|appointment/i.test(t) && !/احجز|book/i.test(t)) {
          await botReply('مفيش مواعيد محجوزة دلوقتي 📅<br><span style="font-size:12px;color:#3d6e88">اضغط "احجز موعد" لحجز موعدك الأول</span>');
          break;
        }
        if (/إلغاء|الغاء|cancel/i.test(t)) {
          setStep('await_cancel'); stepRef.current = 'await_cancel';
          await botReply('تمام، اكتب رقم الحجز اللي عايز تلغيه 🗑️');
          break;
        }
        if (/احجز|اجوز|موعد|حجز|book/i.test(t)) {
          const clinic = detectClinic(t);
          if (clinic) { selectClinic(clinic.key, clinic.ar, clinic.en); }
          else { setStep('await_clinic'); stepRef.current = 'await_clinic'; await botReply('اختار العيادة الأول 👇<br>' + buildClinicsGrid(), 700); }
          break;
        }
        if (/أهلا|هلو|مرحبا|السلام|hi|hello/i.test(t)) {
          await botReply('أهلاً وسهلاً! 👋 أنا <strong>عطعوط</strong><br>إزاي أقدر أساعدك النهارده؟');
          break;
        }
        await botReply('مش فاهم 😅 جرّب: <strong>"احجز موعد"</strong> أو اضغط أحد الأزرار.');
        break;
      }
      case 'await_clinic': {
        const clinic = detectClinic(t);
        if (clinic) { selectClinic(clinic.key, clinic.ar, clinic.en); }
        else { await botReply('مش لاقيش العيادة دي 😕 اختار من القايمة.'); }
        break;
      }
      case 'await_time': {
        const newB = { ...currentBooking, time: t };
        setBooking(newB); bookingRef.current = newB;
        setStep('await_confirm'); stepRef.current = 'await_confirm';
        await botReply(`ممتاز! تأكيد الحجز:<div class="cb-confirm-card" style="margin-top:10px">
          <div class="cb-cc-row"><span class="cb-l">العيادة</span><span class="cb-v">${newB.clinic?.ar || ''}</span></div>
          <div class="cb-cc-row"><span class="cb-l">التاريخ</span><span class="cb-v">${newB.dateLabel || newB.date}</span></div>
          <div class="cb-cc-row"><span class="cb-l">الوقت</span><span class="cb-v">${newB.time}</span></div>
        </div>اكتب <strong>أيوه</strong> للتأكيد أو <strong>لا</strong> للإلغاء`);
        break;
      }
      case 'await_confirm': {
        if (/أيوه|ايوه|نعم|yes|اكيد|تمام|ok/i.test(t)) {
          const ref = '#' + Math.random().toString(36).substring(2, 7).toUpperCase();
          const b = bookingRef.current;
          await botReply(`✅ <strong>تأكيد الحجز</strong>
            <div class="cb-confirm-card">
              <div class="cb-cc-head"><div class="cb-cc-icon">✅</div><span>تم الحجز بنجاح!</span></div>
              <div class="cb-cc-row"><span class="cb-l">العيادة</span><span class="cb-v">${b.clinic?.ar || ''}</span></div>
              <div class="cb-cc-row"><span class="cb-l">التاريخ</span><span class="cb-v">${b.dateLabel || b.date}</span></div>
              <div class="cb-cc-row"><span class="cb-l">الوقت</span><span class="cb-v">${b.time}</span></div>
              <div class="cb-cc-row"><span class="cb-l">رقم الحجز</span><span class="cb-v" style="color:#48cae4;font-family:monospace">${ref}</span></div>
            </div>
            <div style="font-size:11.5px;color:#3d6e88;margin-top:8px">🌸 هنستناك في الموعد</div>`);
        } else {
          await botReply('تم الإلغاء ✅');
        }
        setStep('idle'); stepRef.current = 'idle'; setBooking({}); bookingRef.current = {};
        break;
      }
      case 'await_cancel': {
        await botReply(`مش لاقي موعد بالرقم ده 😕`);
        setStep('idle'); stepRef.current = 'idle';
        break;
      }
      default:
        setStep('idle'); stepRef.current = 'idle';
        await botReply('حاجة غلط 🤔 اكتب "احجز موعد".');
    }
  }, [botReply, selectClinic]);

  const handleSend = () => {
    const text = inputVal.trim();
    if (!text || inputDisabled) return;
    setInputVal('');
    processMessage(text);
  };

  const quickSend = (text) => { processMessage(text); };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSend(); };

  const dateStr = new Date().toLocaleDateString('ar-EG', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  return (
    <div className="chatbot-page">
      {/* Loading */}
      <div className={`cb-loading ${!loading ? 'hide' : ''}`}>
        <div className="cb-spin"></div>
        <div className="cb-loading-txt">جاري تحميل عطعوط...</div>
      </div>

      {/* Background */}
      <div className="cb-orb cb-o1"></div><div className="cb-orb cb-o2"></div><div className="cb-orb cb-o3"></div>
      <div className="cb-grid-bg"></div>

      {/* Back button */}
      <div className="cb-back-btn" onClick={() => navigate('/')} title="رجوع">✕</div>

      {/* Toast */}
      <div className={`cb-toast ${toast ? 'show' : ''}`}>{toast}</div>

      <div className="cb-app">
        {/* SIDEBAR */}
        <aside className="cb-sidebar">
          <div className="cb-sidebar-logo">
            <div className="cb-logo-icon">💙</div>
            <div className="cb-logo-text">Syncare</div>
          </div>
          <div className="cb-profile-card">
            <div className="cb-profile-avatar"><img src={AVATAR} alt="avatar" style={avatarStyle} /></div>
            <div className="cb-profile-name">مستخدم Syncare</div>
            <div className="cb-profile-role">مريض</div>
            <div className="cb-profile-badge"><div className="cb-badge-dot"></div>متصل الآن</div>
          </div>
          <div className="cb-nav">
            <div className="cb-nav-label">القائمة</div>
            <div className="cb-nav-item active"><span>💬</span> المحادثات</div>
            <div className="cb-nav-item" onClick={() => quickSend('مواعيدي')}><span>📅</span> مواعيدي</div>
            <div className="cb-nav-item" onClick={() => quickSend('احجز موعد')}><span>➕</span> حجز جديد</div>
          </div>
          <div className="cb-support-box">
            <div className="cb-support-title">الدعم الفني</div>
            <div className="cb-support-sub">متاح على مدار الساعة</div>
            <div className="cb-support-num">📞 16676</div>
          </div>
        </aside>

        {/* MAIN CHAT */}
        <div className="cb-main">
          <div className="cb-chat-header">
            <div className="cb-hdr-avatar"><img src={AVATAR} alt="عطعوط" style={avatarStyle} /></div>
            <div className="cb-hdr-info">
              <div className="cb-name">عطعوط<span className="cb-dot-sep">•</span>Syncare</div>
              <div className="cb-hdr-status"><div className="cb-status-dot"></div>متصل الآن</div>
            </div>
            <div className="cb-hdr-actions">
              <div className="cb-hdr-btn" onClick={() => navigate('/')}>🏠</div>
            </div>
          </div>

          {/* Messages */}
          <div className="cb-messages" ref={messagesRef}>
            <div className="cb-date-chip">{dateStr}</div>
            {messages.map((msg, i) => (
              <div key={i} className={`cb-msg ${msg.type}`}>
                <div className="cb-msg-av"><img src={AVATAR} alt="av" style={avatarStyle} /></div>
                <div className="cb-msg-body">
                  <div className="cb-bubble" dangerouslySetInnerHTML={{ __html: msg.type === 'bot' ? msg.html : msg.text }}></div>
                  <div className="cb-msg-meta">{msg.time}</div>
                </div>
              </div>
            ))}
            {/* Typing */}
            <div className={`cb-typing ${typing ? 'show' : ''}`}>
              <div className="cb-msg-av"><img src={AVATAR} alt="typing" style={avatarStyle} /></div>
              <div className="cb-t-bubble"><div className="cb-td"></div><div className="cb-td"></div><div className="cb-td"></div></div>
            </div>
          </div>

          {/* Quick bar */}
          <div className="cb-quick-bar">
            <button className="cb-qbtn" onClick={() => quickSend('احجز موعد')}>📅 احجز موعد</button>
            <button className="cb-qbtn" onClick={() => quickSend('مواعيدي')}>📋 مواعيدي</button>
            <button className="cb-qbtn" onClick={() => quickSend('عيادات')}>🏥 العيادات</button>
            <button className="cb-qbtn" onClick={() => quickSend('إلغاء موعد')}>🗑️ إلغاء موعد</button>
          </div>

          {/* Input */}
          <div className="cb-input-bar">
            <div className="cb-input-wrap">
              <input
                ref={inputRef}
                className="cb-chat-input"
                placeholder="اكتب رسالتك هنا..."
                value={inputVal}
                onChange={e => setInputVal(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={inputDisabled}
              />
            </div>
            <button className="cb-send-btn" onClick={handleSend} disabled={inputDisabled}>➤</button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="cb-right-panel">
          <div className="cb-panel-header">
            <div className="cb-panel-header-icon">🏥</div>
            العيادات المتاحة
          </div>
          {CLINICS.map(c => (
            <div key={c.key} className="cb-clinic-list-item" onClick={() => selectClinic(c.key, c.ar, c.en)}>
              <div className="cb-cli-icon">{c.icon}</div>
              <div className="cb-cli-text"><div className="cb-ar">{c.ar}</div><div className="cb-en">{c.en}</div></div>
              <div className="cb-cli-arrow">›</div>
            </div>
          ))}
          <div className="cb-footer">Powered by <span>Syncare</span> AI</div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;

function buildTimeSlots() {
  return `<div style="font-size:13px;margin-bottom:6px;">اختار الوقت المناسب 🕐</div>
    <div class="cb-time-slots">
      ${TIMES.map(t => `<div class="cb-ts" onclick="
        document.querySelectorAll('.cb-ts').forEach(x=>x.classList.remove('selected'));
        this.classList.add('selected');
      ">${t}</div>`).join('')}
    </div>
    <div style="font-size:11px;color:#3d6e88;margin-top:8px">أو اكتب الوقت اللي يناسبك</div>`;
}
