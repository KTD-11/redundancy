// ═══════════════════════════════════════════
//  SYNCARE — ChatbotPage.jsx
//  عطعوط - AI Assistant Chatbot + Voice Support
// ═══════════════════════════════════════════
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { bookAppointment, fetchAppointments, cancelAppointment } from '../api/appointments';
import './ChatbotPage.css';

/* ── Voice Detection Helpers ── */
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

function detectTime(text) {
  // Arabic word numbers → digits
  const wordMap = [
    [/واحد[ةه]?/g,'1'],[/اتنين|اثنين|تنين/g,'2'],[/تلات[ةه]?|ثلاث[ةه]?/g,'3'],
    [/اربع[ةه]?|أربع[ةه]?/g,'4'],[/خمس[ةه]?/g,'5'],[/ست[ةه]?/g,'6'],
    [/سبع[ةه]?/g,'7'],[/تمان[ةيه]?|ثماني[ةه]?/g,'8'],[/تسع[ةه]?/g,'9'],
    [/عشر[ةه]?/g,'10'],[/حداشر|احداشر|إحداشر/g,'11'],[/اتناشر|إتناشر|اثناعشر/g,'12'],
  ];
  let t = text;
  t = t.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  for (const [rx, val] of wordMap) t = t.replace(rx, val);

  // Only match مساء as a full word, not the single letter م anywhere
  const isPM = /مساء|مسائ/.test(t) || /\d\s*م\b/.test(t);

  const m = t.match(/(?:الساع[ةه]|ساع[ةه])\s*(\d{1,2})(?:\s*(?:و|:)\s*(\d{2}))?/i)
         || t.match(/(\d{1,2})(?:[:.]\s*(\d{2}))?\s*(?:صباح[اً]?)?/i);
  if (!m) return null;

  let h = parseInt(m[1], 10);
  let min = m[2] ? m[2] : '00';

  // Handle ونص (half) and وربع (quarter)
  if (/نص|نصف/.test(t)) min = '30';
  if (/و\s*ربع/.test(t)) min = '15';
  if (/إلا\s*ربع/.test(t)) { min = '45'; h = h - 1; }

  if (isPM && h < 12) h += 12;
  if (h < 8 || h > 12) return null;

  const ts = `${String(h).padStart(2,'0')}:${min}`;
  const VALID = ['08:00','08:15','08:30','08:45','09:00','09:15','09:30','09:45','10:00','10:15','10:30','10:45','11:00','11:15','11:30','11:45','12:00'];
  if (VALID.includes(ts)) return ts;
  return `${String(h).padStart(2,'0')}:00`;
}

function detectDate(text) {
  const days = [];
  for (let i = 0; i < 7; i++) { const d = new Date(); d.setDate(d.getDate() + i); days.push(d); }
  if (/النهارد[ةه]|النهاردا|اليوم|today/i.test(text)) return { date: days[0].toISOString().split('T')[0], label: 'النهارده' };
  if (/بكر[ةه]|بكرا|غد[اً]?|tomorrow/i.test(text)) return { date: days[1].toISOString().split('T')[0], label: 'بكره' };
  if (/بعد\s*بكر[ةه]|بعد\s*بكرا/i.test(text)) return { date: days[2].toISOString().split('T')[0], label: 'بعد بكره' };
  return null;
}

function detectIntent(text) {
  if (/إلغاء|الغاء|الغي|ألغي|cancel/i.test(text)) return 'cancel';
  if (/مواعيدي|مواعيد[يى]|عايز\s*[اأ]شوف|show.*appointment/i.test(text) && !/احجز|book/i.test(text)) return 'view';
  if (/احجز|اجوز|حجز|موعد|book/i.test(text)) return 'book';
  return null;
}

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || '';
}

const AVATAR = `${process.env.PUBLIC_URL}/bot-avatar.jpg`;
const avatarStyle = { width:'100%', height:'100%', objectFit:'cover', borderRadius:'50%' };

/* ── CONSTANTS ── */
const CLINICS = [
  { key:'adult_general', ar:'الباطنة العامة', en:'General Medicine', apiType:'Adult General Medicine', icon:'🩺' },
  { key:'surgery',       ar:'الجراحة',       en:'Surgery',          apiType:'General Surgery',        icon:'🔪' },
  { key:'womens',        ar:'النساء والتوليد',en:"Women's Health",   apiType:"Women's Health",         icon:'🤰' },
  { key:'children',      ar:'طب الأطفال',    en:'Pediatrics',       apiType:"Children's Health",      icon:'👶' },
  { key:'heart',         ar:'القلب والأوعية', en:'Heart Clinic',     apiType:'Heart Clinic',           icon:'❤️' },
  { key:'eye',           ar:'طب العيون',     en:'Eye Clinic',       apiType:'Eye Clinic',             icon:'👁️' },
  { key:'bones',         ar:'العظام والمفاصل',en:'Orthopedics',      apiType:'Bones and Joints',       icon:'🦴' },
  { key:'brain',         ar:'المخ والأعصاب', en:'Neurology',        apiType:'Brain and Nerves',       icon:'🧠' },
  { key:'skin',          ar:'الجلدية',       en:'Dermatology',      apiType:'Skin Clinic',            icon:'🧴' },
  { key:'oncology',      ar:'الأورام',       en:'Oncology',         apiType:'Cancer Care',            icon:'🎗️' },
  { key:'ent',           ar:'أنف وأذن وحنجرة',en:'ENT',             apiType:'Ear, Nose, and Throat',  icon:'👂' },
];

const TIMES = [
  '08:00','08:15','08:30','08:45',
  '09:00','09:15','09:30','09:45',
  '10:00','10:15','10:30','10:45',
  '11:00','11:15','11:30','11:45',
  '12:00',
];

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
  const { isLoggedIn } = useAuth();
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

  /* ── Voice State ── */
  const [isRecording, setIsRecording] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [ttsEnabled, setTtsEnabled] = useState(() => localStorage.getItem('syncare_tts') !== 'off');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [playingMsgIdx, setPlayingMsgIdx] = useState(-1);
  const [showOverlay, setShowOverlay] = useState(false);
  const recognitionRef = useRef(null);
  const waveCanvasRef = useRef(null);
  const audioCtxRef = useRef(null);
  const animFrameRef = useRef(null);

  const stepRef = useRef('idle');
  const bookingRef = useRef({});
  useEffect(() => { stepRef.current = step; }, [step]);
  useEffect(() => { bookingRef.current = booking; }, [booking]);
  useEffect(() => { localStorage.setItem('syncare_tts', ttsEnabled ? 'on' : 'off'); }, [ttsEnabled]);

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

  /* ── TTS Engine ── */
  const speak = useCallback((text) => {
    if (!ttsEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const clean = stripHtml(text).replace(/[✅❌📅📋🎉🌸⚠️🏥🩺🗑️➕💬]/g, '').trim();
    if (!clean || clean.length < 3) return;
    const utter = new SpeechSynthesisUtterance(clean);
    utter.lang = 'ar-SA';
    utter.rate = 0.95;
    utter.pitch = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const arVoice = voices.find(v => v.lang.startsWith('ar'));
    if (arVoice) utter.voice = arVoice;
    utter.onstart = () => setIsSpeaking(true);
    utter.onend = () => { setIsSpeaking(false); setPlayingMsgIdx(-1); };
    utter.onerror = () => { setIsSpeaking(false); setPlayingMsgIdx(-1); };
    window.speechSynthesis.speak(utter);
  }, [ttsEnabled]);

  const speakMsg = useCallback((text, idx) => {
    if (isSpeaking) { window.speechSynthesis.cancel(); setIsSpeaking(false); setPlayingMsgIdx(-1); return; }
    setPlayingMsgIdx(idx);
    speak(text);
  }, [isSpeaking, speak]);

  const stopTts = useCallback(() => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setPlayingMsgIdx(-1);
  }, []);

  /* ── STT Engine ── */
  const drawWave = useCallback((analyser, canvas) => {
    if (!analyser || !canvas) return;
    const ctx = canvas.getContext('2d');
    const bufLen = analyser.frequencyBinCount;
    const data = new Uint8Array(bufLen);
    const draw = () => {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(data);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#48cae4';
      ctx.shadowColor = '#00b4d8';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      const sliceW = canvas.width / bufLen;
      let x = 0;
      for (let i = 0; i < bufLen; i++) {
        const v = data[i] / 128.0;
        const y = (v * canvas.height) / 2;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
        x += sliceW;
      }
      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
  }, []);

  const startRecording = useCallback(() => {
    if (!SpeechRecognition) { showToastMsg('المتصفح مش بيدعم التعرف على الصوت'); return; }
    const rec = new SpeechRecognition();
    rec.lang = 'ar-EG';
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 1;
    recognitionRef.current = rec;
    setVoiceTranscript('');
    setIsRecording(true);
    setShowOverlay(true);

    // Audio context for waveform
    navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      const actx = new (window.AudioContext || window.webkitAudioContext)();
      audioCtxRef.current = actx;
      const src = actx.createMediaStreamSource(stream);
      const analyser = actx.createAnalyser();
      analyser.fftSize = 256;
      src.connect(analyser);
      setTimeout(() => {
        const canvas = waveCanvasRef.current;
        if (canvas) drawWave(analyser, canvas);
      }, 100);

      rec.onresult = (e) => {
        let transcript = '';
        for (let i = 0; i < e.results.length; i++) transcript += e.results[i][0].transcript;
        setVoiceTranscript(transcript);
      };
      rec.onend = () => {
        setIsRecording(false);
        setShowOverlay(false);
        stream.getTracks().forEach(t => t.stop());
        if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
        if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      };
      rec.onerror = () => {
        setIsRecording(false);
        setShowOverlay(false);
        stream.getTracks().forEach(t => t.stop());
        if (audioCtxRef.current) { audioCtxRef.current.close(); audioCtxRef.current = null; }
      };
      rec.start();
    }).catch(() => {
      setIsRecording(false);
      setShowOverlay(false);
      showToastMsg('مش قادر أوصل للمايك - اسمح بالوصول');
    });
    // eslint-disable-next-line
  }, [drawWave]);

  const stopRecording = useCallback(() => {
    if (recognitionRef.current) { recognitionRef.current.stop(); }
  }, []);

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
  const handlePickTime = useCallback((time) => {
    const b = bookingRef.current;
    const newB = { ...b, time };
    setBooking(newB); bookingRef.current = newB;
    addUserMsg(time);
    setStep('await_confirm'); stepRef.current = 'await_confirm';
    botReply(`ممتاز! تأكيد الحجز:
      <div class="cb-confirm-card" style="margin-top:10px">
        <div class="cb-cc-head"><div class="cb-cc-icon">📋</div><span>تفاصيل الحجز</span></div>
        <div class="cb-cc-row"><span class="cb-l">العيادة</span><span class="cb-v">${newB.clinic?.ar || ''}</span></div>
        <div class="cb-cc-row"><span class="cb-l">التاريخ</span><span class="cb-v">${newB.dateLabel || newB.date}</span></div>
        <div class="cb-cc-row"><span class="cb-l">الوقت</span><span class="cb-v">${time}</span></div>
      </div>
      <div style="margin-top:10px;display:flex;gap:8px">
        <div onclick="window.__cbConfirm(true)" style="flex:1;padding:10px;border-radius:12px;background:linear-gradient(135deg,#00b894,#00cec9);text-align:center;cursor:pointer;font-weight:700;font-size:13px;color:#fff">✅ تأكيد الحجز</div>
        <div onclick="window.__cbConfirm(false)" style="flex:1;padding:10px;border-radius:12px;background:rgba(255,77,109,0.15);border:1px solid rgba(255,77,109,0.3);text-align:center;cursor:pointer;font-weight:700;font-size:13px;color:#ff4d6d">❌ إلغاء</div>
      </div>`, 600);
  }, [botReply]);

  const handleConfirm = useCallback(async (confirmed) => {
    if (stepRef.current !== 'await_confirm') return;
    setStep('idle'); stepRef.current = 'idle';
    if (confirmed) {
      if (!isLoggedIn) {
        addUserMsg('تأكيد ✅');
        await botReply('⚠️ لازم تسجل دخول الأول عشان تقدر تحجز<br><strong>سجّل دخول</strong> وارجع حاول تاني', 600);
        setBooking({}); bookingRef.current = {};
        return;
      }
      addUserMsg('تأكيد ✅');
      setTyping(true); setInputDisabled(true);
      const b = bookingRef.current;
      // Convert date from YYYY-MM-DD to DD/MM/YYYY
      const [y, m, d] = (b.date || '').split('-');
      const apiDate = `${d}/${m}/${y}`;
      try {
        const res = await bookAppointment({ date: apiDate, time: b.time, type: b.clinic?.apiType || '' });
        setTyping(false); setInputDisabled(false);
        if (res) {
          addBotMsg(`✅ <strong>تم الحجز بنجاح!</strong>
            <div class="cb-confirm-card">
              <div class="cb-cc-head"><div class="cb-cc-icon">✅</div><span>موعدك محجوز!</span></div>
              <div class="cb-cc-row"><span class="cb-l">العيادة</span><span class="cb-v">${b.clinic?.ar || ''}</span></div>
              <div class="cb-cc-row"><span class="cb-l">التاريخ</span><span class="cb-v">${b.dateLabel || b.date}</span></div>
              <div class="cb-cc-row"><span class="cb-l">الوقت</span><span class="cb-v">${b.time}</span></div>
            </div>
            <div style="font-size:12px;color:#3d6e88;margin-top:10px">🌸 ${res.message || 'هنستناك في الموعد'}</div>`);
        }
      } catch (err) {
        setTyping(false); setInputDisabled(false);
        addBotMsg(`❌ مشكلة في الحجز: ${err.message || 'حاول تاني'}`);
      }
    } else {
      addUserMsg('إلغاء ❌');
      await botReply('تم الإلغاء ✅ لو عايز تحجز تاني اكتب <strong>"احجز موعد"</strong>', 500);
    }
    setBooking({}); bookingRef.current = {};
  }, [botReply, isLoggedIn, addBotMsg]);

  const selectClinic = useCallback((key, ar, en) => {
    const clinic = CLINICS.find(c => c.key === key);
    const days = getDays();
    const newBooking = { clinic, date: days[1].full, dateLabel: `${days[1].name} ${days[1].num} ${days[1].month}`, time: '' };
    setBooking(newBooking); bookingRef.current = newBooking;
    addUserMsg(`${ar} - ${en}`);
    setStep('await_time'); stepRef.current = 'await_time';
    botReply(buildTimeSlots(), 800);
  }, [botReply]);

  // Expose global functions for innerHTML onclick
  useEffect(() => {
    window.__cbSelectClinic = selectClinic;
    window.__cbPickTime = handlePickTime;
    window.__cbConfirm = handleConfirm;
    return () => { delete window.__cbSelectClinic; delete window.__cbPickTime; delete window.__cbConfirm; };
  }, [selectClinic, handlePickTime, handleConfirm]);

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
    // eslint-disable-next-line no-unused-vars
    const currentBooking = bookingRef.current;

    if (MEDICAL_KW.some(k => t.toLowerCase().includes(k)) && currentStep === 'idle') {
      await botReply('أنا مساعد للحجوزات والتنظيم فقط ومقدرش أقدم استشارات طبية 🩺<br>يُفضل التواصل مع دكتور متخصص.');
      return;
    }

    switch (currentStep) {
      case 'idle': {
        if (/عيادة|عيادات|clinic/i.test(t)) { await botReply(buildClinicsGrid(), 700); break; }
        if (/مواعيدي|appointment/i.test(t) && !/احجز|book/i.test(t)) {
          if (!isLoggedIn) { await botReply('⚠️ لازم تسجل دخول الأول عشان تشوف مواعيدك'); break; }
          setTyping(true); setInputDisabled(true);
          try {
            const res = await fetchAppointments();
            setTyping(false); setInputDisabled(false);
            const list = res.data || [];
            if (!list.length) {
              addBotMsg('مفيش مواعيد محجوزة دلوقتي 📅<br><span style="font-size:12px;color:#3d6e88">اضغط "احجز موعد" لحجز موعدك الأول</span>');
            } else {
              const cards = list.map(a => `
                <div class="cb-confirm-card" style="margin-top:8px">
                  <div class="cb-cc-head"><div class="cb-cc-icon">📅</div><span>موعد محجوز</span></div>
                  <div class="cb-cc-row"><span class="cb-l">العيادة</span><span class="cb-v">${a.appointment_type || a.appointment_name || ''}</span></div>
                  <div class="cb-cc-row"><span class="cb-l">التاريخ</span><span class="cb-v">${a.appointment_date || ''}</span></div>
                  <div class="cb-cc-row"><span class="cb-l">الوقت</span><span class="cb-v">${a.appointment_time || ''}</span></div>
                  <div class="cb-cc-row"><span class="cb-l">رقم</span><span class="cb-v" style="color:#48cae4;font-family:monospace">#${a.appointment_id}</span></div>
                </div>`).join('');
              addBotMsg(`📋 <strong>مواعيدك المحجوزة (${list.length})</strong>${cards}`);
            }
          } catch (err) {
            setTyping(false); setInputDisabled(false);
            addBotMsg(`❌ مشكلة في جلب المواعيد: ${err.message || 'حاول تاني'}`);
          }
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
        // User typed a time instead of clicking
        handlePickTime(t);
        break;
      }
      case 'await_confirm': {
        if (/أيوه|ايوه|نعم|yes|اكيد|تمام|ok|تأكيد|confirm/i.test(t)) {
          handleConfirm(true);
        } else if (/لا|no|الغ|cancel|إلغاء/i.test(t)) {
          handleConfirm(false);
        } else {
          await botReply('اكتب <strong>"أيوه"</strong> للتأكيد أو <strong>"لا"</strong> للإلغاء');
        }
        break;
      }
      case 'await_cancel': {
        if (!isLoggedIn) { await botReply('⚠️ لازم تسجل دخول الأول'); setStep('idle'); stepRef.current = 'idle'; break; }
        const cancelId = t.replace('#','').trim();
        setTyping(true); setInputDisabled(true);
        try {
          const res = await cancelAppointment(cancelId === '*' ? '*' : Number(cancelId));
          setTyping(false); setInputDisabled(false);
          addBotMsg(`✅ ${res.message || 'تم إلغاء الموعد بنجاح'}`);
        } catch (err) {
          setTyping(false); setInputDisabled(false);
          addBotMsg(`❌ ${err.message || 'مش لاقي موعد بالرقم ده'}`);
        }
        setStep('idle'); stepRef.current = 'idle';
        break;
      }
      default:
        setStep('idle'); stepRef.current = 'idle';
        await botReply('حاجة غلط 🤔 اكتب <strong>"احجز موعد"</strong> أو اضغط أحد الأزرار.');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [botReply, selectClinic, handlePickTime, handleConfirm]);

  /* ── Smart Voice Processing ── */
  const processVoiceInput = useCallback(async (text) => {
    if (!text || !text.trim()) return;
    const t = text.trim();
    const intent = detectIntent(t);
    const clinic = detectClinic(t);
    const date = detectDate(t);
    const time = detectTime(t);

    if (intent === 'cancel') {
      if (clinic) {
        addUserMsg(`🎤 ${t}`);
        await botReply(`فهمت! عايز تلغي موعد ${clinic.ar}\nاكتب رقم الحجز اللي عايز تلغيه 🗑️`, 600);
        setStep('await_cancel'); stepRef.current = 'await_cancel';
        speak('تمام، اكتب رقم الحجز');
      } else {
        processMessage(t);
      }
      return;
    }
    if (intent === 'view') { processMessage(t); return; }
    if (intent === 'book' && clinic && date && time) {
      // Full booking from voice!
      const ar = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
      const months = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
      const dd = new Date(date.date);
      const dateLabel = `${ar[dd.getDay()]} ${dd.getDate()} ${months[dd.getMonth()]}`;
      const newBooking = { clinic, date: date.date, dateLabel, time };
      setBooking(newBooking); bookingRef.current = newBooking;
      addUserMsg(`🎤 ${t}`);
      setStep('await_confirm'); stepRef.current = 'await_confirm';
      await botReply(`فهمتك! 🎯 تأكيد الحجز:
        <div class="cb-confirm-card" style="margin-top:10px">
          <div class="cb-cc-head"><div class="cb-cc-icon">📋</div><span>تفاصيل الحجز</span></div>
          <div class="cb-cc-row"><span class="cb-l">العيادة</span><span class="cb-v">${clinic.ar}</span></div>
          <div class="cb-cc-row"><span class="cb-l">التاريخ</span><span class="cb-v">${dateLabel}</span></div>
          <div class="cb-cc-row"><span class="cb-l">الوقت</span><span class="cb-v">${time}</span></div>
        </div>
        <div style="margin-top:10px;display:flex;gap:8px">
          <div onclick="window.__cbConfirm(true)" style="flex:1;padding:10px;border-radius:12px;background:linear-gradient(135deg,#00b894,#00cec9);text-align:center;cursor:pointer;font-weight:700;font-size:13px;color:#fff">✅ تأكيد الحجز</div>
          <div onclick="window.__cbConfirm(false)" style="flex:1;padding:10px;border-radius:12px;background:rgba(255,77,109,0.15);border:1px solid rgba(255,77,109,0.3);text-align:center;cursor:pointer;font-weight:700;font-size:13px;color:#ff4d6d">❌ إلغاء</div>
        </div>`, 700);
      speak('اختار تأكيد الحجز أو إلغاء');
      return;
    }
    // Partial or other — fall through to normal
    processMessage(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processMessage, botReply, speak]);

  // Process voice transcript when recording ends
  useEffect(() => {
    if (!isRecording && voiceTranscript) {
      processVoiceInput(voiceTranscript);
      setVoiceTranscript('');
    }
    // eslint-disable-next-line
  }, [isRecording]);

  // TTS auto-play on important bot messages
  useEffect(() => {
    if (!ttsEnabled || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.type !== 'bot') return;
    const txt = stripHtml(last.html || '');
    if (/تم الحجز بنجاح|موعدك محجوز/.test(txt)) speak('تم الحجز بنجاح');
    else if (/تم إلغاء الموعد|تم الإلغاء/.test(txt)) speak('تم إلغاء الموعد');
    else if (/مواعيدك المحجوزة/.test(txt)) speak('دي مواعيدك الحالية');
    else if (/لازم تسجل دخول/.test(txt)) speak('محتاج تسجل دخول الأول');
    else if (/اختار الوقت/.test(txt)) speak('اختار الساعة المناسبة');
    // eslint-disable-next-line
  }, [messages]);

  const handleSend = () => {
    const text = inputVal.trim();
    if (!text || inputDisabled) return;
    setInputVal('');
    processMessage(text);
  };

  const quickSend = (text) => { processMessage(text); };

  const handleKeyDown = (e) => { if (e.key === 'Enter') handleSend(); };
  const handleMicClick = () => { isRecording ? stopRecording() : startRecording(); };

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
              <button
                className={`cb-tts-toggle ${ttsEnabled ? 'active' : ''}`}
                onClick={() => setTtsEnabled(p => !p)}
                title={ttsEnabled ? 'إيقاف الصوت' : 'تشغيل الصوت'}
              >
                <span className="cb-tts-icon">{ttsEnabled ? '🔊' : '🔇'}</span>
                <span className="cb-tts-label">{ttsEnabled ? 'الصوت مفعّل' : 'الصوت مغلق'}</span>
              </button>
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
                  <div className="cb-msg-meta">
                    {msg.time}
                    {msg.type === 'bot' && (
                      <span
                        className={`cb-speaker-btn ${playingMsgIdx === i ? 'playing' : ''}`}
                        onClick={() => speakMsg(msg.html, i)}
                        title="استمع"
                      >
                        <span className="cb-sp-icon">🔊</span>
                        <span className="cb-sp-label">استمع</span>
                        <span className="cb-eq">
                          <span className="cb-eq-bar"></span>
                          <span className="cb-eq-bar"></span>
                          <span className="cb-eq-bar"></span>
                          <span className="cb-eq-bar"></span>
                        </span>
                      </span>
                    )}
                  </div>
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

          {/* TTS Playing Bar */}
          {isSpeaking && (
            <div className="cb-tts-playing-bar">
              <div className="cb-tts-wave">
                <div className="cb-tts-wave-bar"></div><div className="cb-tts-wave-bar"></div>
                <div className="cb-tts-wave-bar"></div><div className="cb-tts-wave-bar"></div>
                <div className="cb-tts-wave-bar"></div>
              </div>
              <span>جاري التحدث...</span>
              <button className="cb-tts-stop" onClick={stopTts}>⏹ إيقاف</button>
            </div>
          )}

          {/* Input */}
          <div className="cb-input-bar">
            <button
              className={`cb-mic-btn ${isRecording ? 'recording' : ''}`}
              onClick={handleMicClick}
              title={isRecording ? 'إيقاف التسجيل' : 'تسجيل صوتي'}
            >
              {isRecording ? '⏹' : '🎤'}
            </button>
            <div className="cb-input-wrap">
              <input
                ref={inputRef}
                className="cb-chat-input"
                placeholder="اكتب رسالتك أو اضغط 🎤 ..."
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

      {/* Recording Overlay */}
      {showOverlay && (
        <div className="cb-rec-overlay">
          <div className="cb-rec-ring">🎤</div>
          <div className="cb-rec-text">جاري الاستماع...</div>
          <div className="cb-rec-sub">اتكلم بوضوح بالعربي</div>
          <canvas ref={waveCanvasRef} className="cb-rec-wave" width={250} height={60}></canvas>
          {voiceTranscript && (
            <div className="cb-rec-transcript">{voiceTranscript}</div>
          )}
          <button className="cb-rec-stop" onClick={stopRecording}>⏹ إيقاف التسجيل</button>
        </div>
      )}
    </div>
  );
};

export default ChatbotPage;

function buildTimeSlots() {
  return `<div style="font-size:13px;margin-bottom:8px;font-weight:700">🕐 اختار الوقت المناسب</div>
    <div style="font-size:10.5px;color:#3d6e88;margin-bottom:8px">المواعيد من 8:00 ص حتى 12:00 م — كل ربع ساعة</div>
    <div class="cb-time-slots">
      ${TIMES.map(t => `<div class="cb-ts" onclick="
        document.querySelectorAll('.cb-ts').forEach(x=>x.classList.remove('selected'));
        this.classList.add('selected');
        window.__cbPickTime('${t}');
      ">${t}</div>`).join('')}
    </div>
    <div style="font-size:10.5px;color:#3d6e88;margin-top:8px">👆 اضغط على الوقت اللي يناسبك</div>`;
}
