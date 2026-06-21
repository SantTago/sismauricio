const STORAGE_KEY = 'clinicflow_state_v2';
const statuses = [
  ['✅','Confirmado'],['😕','Faltou'],['🕒','Em espera'],['🪑','Em consulta'],['👁️','Dilatação'],
  ['🙂','Atendido'],['🚩','Desmarcado'],['📵','Não atendeu'],['🔕','Desligado'],['✕','Não estava'],['🟢','WhatsApp'],['🧽','Limpar status']
];
const months = ['Janeiro','Fevereiro','Março','Abril','Maio','Junho','Julho','Agosto','Setembro','Outubro','Novembro','Dezembro'];
const state = loadState();
let currentView = 'agenda';
let currentPatientId = state.patients[0]?.id || null;
let editingPatientId = null;
let consultStartTime = Date.now();
let consultTimerInterval = null;
let consultFiles = [];

const els = {
  daysGrid: document.getElementById('daysGrid'),
  calendarTitle: document.getElementById('calendarTitle'),
  noteDateLabel: document.getElementById('noteDateLabel'),
  dayNoteText: document.getElementById('dayNoteText'),
  birthdayList: document.getElementById('birthdayList'),
  scheduleRows: document.getElementById('scheduleRows'),
  totalRecords: document.getElementById('totalRecords'),
  appointmentSearch: document.getElementById('appointmentSearch'),
  patientsBody: document.getElementById('patientsBody'),
  patientSearch: document.getElementById('patientSearch'),
  recordSummary: document.getElementById('recordSummary'),
  consultationsList: document.getElementById('consultationsList'),
  consultPatientName: document.getElementById('consultPatientName'),
  consultDate: document.getElementById('consultDate'),
  consultTimer: document.getElementById('consultTimer'),
  consultFileList: document.getElementById('consultFileList'),
  patientAvatarPreview: document.getElementById('patientAvatarPreview'),
  patientsOptions: document.getElementById('patientsOptions'),
  appointmentDate: document.getElementById('appointmentDate')
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) {}
  }
  const seedDate = '2026-06-18';
  return {
    selectedDate: seedDate,
    calendarDate: seedDate,
    viewMode: 'day',
    dayNotes: {[seedDate]: 'Lembrar de confirmar pacientes do turno da tarde.'},
    patients: [
      seedPatient({id: uid(), record:'15259', name:'Wicherlanny Nery Carvalho', birth:'1987-06-04', mobile:'86999427503', phone:'', gender:'Feminino', insurance:'PLANO CLINICAL', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'16701', name:'Patrícia Rodrigues de Sousa', birth:'2004-08-16', mobile:'86988577757', phone:'', gender:'Feminino', insurance:'PLANO CLINICAL', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'5139', name:'Abdias Cassimiro da Silva', birth:'1931-11-08', mobile:'86994226580', phone:'', gender:'Masculino', insurance:'PARTICULAR', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'5662', name:'Abdias Pereira Rocha', birth:'1959-09-02', mobile:'981401633', phone:'', gender:'Masculino', insurance:'PLANO CLINICAL', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'5705', name:'Abdon Ferreira dos Santos', birth:'1943-07-30', mobile:'86994614249', phone:'', gender:'Masculino', insurance:'PLANO CLINICAL', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'12579', name:'Abdoral Felismino de Sousa', birth:'1954-03-18', mobile:'99984339010', phone:'', gender:'Masculino', insurance:'PARTICULAR', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'21953', name:'Abel Almeida Guimaraes', birth:'1983-05-20', mobile:'86998445840', phone:'', gender:'Masculino', insurance:'PLANO CLINICAL', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'24526', name:'Abel da Silva Marques', birth:'1986-06-14', mobile:'86988050512', phone:'', gender:'Masculino', insurance:'PARTICULAR', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'26747', name:'Aberlania da Costa Silva', birth:'1984-10-18', mobile:'86999244103', phone:'', gender:'Feminino', insurance:'PARTICULAR', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'29262', name:'Abigail Feitosa de Araújo', birth:'2002-11-17', mobile:'8695810385', phone:'', gender:'Feminino', insurance:'PLANO CLINICAL', city:'Teresina', state:'PI'})
    ],
    appointments: [],
    consultations: []
  };
}

function seedPatient(data) {
  return {
    photo:'',
    reminder:'não definido',
    bloodType:'', address:'', number:'', district:'', cep:'', city:'', state:'', commercialPhone:'', extension:'', birthPlace:'',
    profession:'', spouse:'', father:'', mother:'', cpf:'', rg:'', email:'', observations:'', insuranceNumber:'', insuranceValidity:'', insuranceAccommodation:'', insuranceNotes:'',
    notifications:true, inactive:false, blocked:false, dead:false, ...data
  };
}

function seedDataPopulateAppointments() {
  if (state.appointments.length) return;
  const p1 = state.patients[0], p2 = state.patients[1], p3 = state.patients[2];
  state.appointments = [
    {id:uid(), date:'2026-06-18', time:'12:00', patientId:p1.id, patient:p1.name, insurance:p1.insurance, procedure:'CONSULTA PSIC...', type:'Consulta', status:'Atendido', statusTime:'17:05', notes:''},
    {id:uid(), date:'2026-06-18', time:'12:30', patientId:p2.id, patient:p2.name, insurance:p2.insurance, procedure:'CONSULTA PSIC...', type:'Consulta', status:'Atendido', statusTime:'15:28', notes:''},
    {id:uid(), date:'2026-06-18', time:'13:30', patientId:p3.id, patient:p3.name, insurance:p3.insurance, procedure:'RETORNO', type:'Consulta', status:'Confirmado', statusTime:'', notes:''}
  ];
  state.consultations = [
    {id:uid(), patientId:p1.id, date:'2026-06-15', duration:'00:24:18', avaliacao:'Paciente em acompanhamento. Boa resposta ao tratamento.', impressao:'Quadro estável.', conduta:'Manter conduta e retorno em 30 dias.', diagnostico:'Transtorno de ansiedade generalizada', hipotese:'TAG', status:'finalizado', files:[]},
    {id:uid(), patientId:p1.id, date:'2026-06-02', duration:'00:18:40', avaliacao:'Primeira consulta com coleta de dados.', impressao:'Necessita seguimento.', conduta:'Solicitado retorno.', diagnostico:'Investigação clínica', hipotese:'', status:'rascunho', files:[]}
  ];
}
seedDataPopulateAppointments();
saveState();

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function uid() { return Math.random().toString(36).slice(2,10); }
function formatDateBR(iso) {
  if (!iso) return '';
  const [y,m,d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
function normalizePhone(v) {
  return (v || '').replace(/\D/g,'');
}
function findPatient(id) { return state.patients.find(p => p.id === id); }
function patientAge(iso) {
  if (!iso) return '';
  const b = new Date(iso);
  const n = new Date();
  let age = n.getFullYear() - b.getFullYear();
  const m = n.getMonth() - b.getMonth();
  if (m < 0 || (m===0 && n.getDate() < b.getDate())) age--;
  return `${age} anos`;
}
function currentDateObj() { return new Date(state.selectedDate + 'T00:00:00'); }
function getBirthdaysForDate(dateIso) {
  const [,m,d] = dateIso.split('-');
  return state.patients.filter(p => p.birth && p.birth.slice(5) === `${m}-${d}`);
}
function formatStatusText(ap) {
  return ap.status ? `${ap.status}${ap.statusTime ? ' ' + ap.statusTime : ''}` : '';
}

function setView(viewId, options={}) {
  currentView = viewId;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
  document.getElementById(viewId).classList.add('active-view');
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === viewId));
  if (viewId === 'prontuario') renderRecordView();
  if (viewId === 'consulta') renderConsultView(options.consultation || null);
  if (viewId === 'cadastroPaciente') renderPatientEditForm(options.patientId || null);
}

function renderCalendar() {
  const calDate = new Date(state.calendarDate + 'T00:00:00');
  const year = calDate.getFullYear();
  const month = calDate.getMonth();
  const selected = new Date(state.selectedDate + 'T00:00:00');
  els.calendarTitle.textContent = `${months[month]} ${year}`;
  els.daysGrid.innerHTML = '';
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = 0; i < startOffset; i++) {
    const btn = document.createElement('button');
    btn.className = 'muted-day';
    btn.textContent = prevMonthDays - startOffset + i + 1;
    els.daysGrid.appendChild(btn);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    const btn = document.createElement('button');
    btn.textContent = day;
    const iso = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
    if (iso === state.selectedDate) btn.classList.add('active');
    btn.onclick = () => {
      state.selectedDate = iso;
      saveState();
      renderCalendar();
      renderAgenda();
    };
    els.daysGrid.appendChild(btn);
  }
}

function renderAgenda() {
  renderCalendar();
  document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.toggle('selected', btn.dataset.mode === state.viewMode));
  els.noteDateLabel.textContent = formatDateBR(state.selectedDate);
  els.dayNoteText.value = state.dayNotes[state.selectedDate] || '';
  const birthdays = getBirthdaysForDate(state.selectedDate).map(p => p.name.split(' ')[0]);
  els.birthdayList.textContent = birthdays.length ? birthdays.join(', ') : '—';
  renderSchedule();
}

function getScheduleSlots() {
  const slots = [];
  for (let h=12; h<=18; h++) {
    slots.push(`${String(h).padStart(2,'0')}:00`);
    if (h < 18) slots.push(`${String(h).padStart(2,'0')}:30`);
  }
  return slots;
}

function getAppointmentsForSelectedDate() {
  let list = state.appointments.filter(a => a.date === state.selectedDate);
  const q = els.appointmentSearch.value.trim().toLowerCase();
  if (q) {
    list = list.filter(a => [a.patient,a.procedure,a.type,a.insurance,formatStatusText(a)].join(' ').toLowerCase().includes(q));
  }
  list.sort((a,b) => a.time.localeCompare(b.time));
  return list;
}

function renderSchedule() {
  const rows = els.scheduleRows;
  rows.innerHTML='';
  const appointments = getAppointmentsForSelectedDate();
  const map = Object.fromEntries(appointments.map(a => [a.time,a]));
  getScheduleSlots().forEach(time => {
    const ap = map[time];
    const div = document.createElement('div');
    div.className = 'schedule-row schedule-grid' + (ap ? '' : ' empty');
    if (ap) {
      div.innerHTML = `
        <span>${time}</span>
        <span>${escapeHtml(ap.patient)}</span>
        <span>${escapeHtml(ap.insurance || '')}</span>
        <span>${escapeHtml(ap.procedure || '')}</span>
        <span>${escapeHtml(ap.type || '')}</span>
        <span><button class="status-btn" data-id="${ap.id}">${statusIcon(ap.status)} ${escapeHtml(formatStatusText(ap) || 'Sem status')}</button></span>
        <span class="row-actions">
          <button class="action-btn" data-action="open-record" data-patient-id="${ap.patientId || ''}">☰</button>
          <button class="action-btn" data-action="edit-appt" data-id="${ap.id}">✎</button>
        </span>`;
    } else {
      div.innerHTML = `
        <span>${time}</span><span></span><span></span><span></span><span></span>
        <span><button class="status-btn" data-time="${time}">⊘</button></span>
        <span class="row-actions"><button class="action-btn" data-action="quick-add" data-time="${time}">＋</button></span>`;
    }
    rows.appendChild(div);
  });
  els.totalRecords.textContent = appointments.length;

  document.querySelectorAll('.status-btn').forEach(b => b.onclick = e => openStatusMenu(e, b.dataset.id, b.dataset.time));
  document.querySelectorAll('.action-btn').forEach(b => b.onclick = () => handleRowAction(b.dataset.action, b.dataset));
}

function statusIcon(status) {
  const found = statuses.find(s => s[1] === status);
  return found ? found[0] : '•';
}

function handleRowAction(action, data) {
  if (action === 'quick-add') openAppointmentModal({time: data.time, date: state.selectedDate});
  if (action === 'edit-appt') openAppointmentModal({appointmentId: data.id});
  if (action === 'open-record' && data.patientId) {
    currentPatientId = data.patientId;
    setView('prontuario');
  }
}

function renderPatients(filter='') {
  const q = filter.trim().toLowerCase();
  const body = els.patientsBody; body.innerHTML='';
  state.patients
    .filter(p => [p.record,p.name,p.mobile,p.phone].join(' ').toLowerCase().includes(q))
    .sort((a,b) => a.name.localeCompare(b.name))
    .forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(p.record || '')}</td>
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(formatDateBR(p.birth))}</td>
        <td>${escapeHtml(maskPhone(p.mobile))}</td>
        <td>${escapeHtml(maskPhone(p.phone))}</td>
        <td class="table-actions">
          <button title="Abrir prontuário" data-action="open" data-id="${p.id}">☰</button>
          <button title="Editar" data-action="edit" data-id="${p.id}">✎</button>
          <button title="Imprimir" data-action="print" data-id="${p.id}">🖨</button>
          <button title="Nova consulta" data-action="consult" data-id="${p.id}">📄</button>
          <button title="Excluir" data-action="delete" data-id="${p.id}">×</button>
        </td>`;
      body.appendChild(tr);
    });
  body.querySelectorAll('button').forEach(btn => btn.onclick = () => handlePatientAction(btn.dataset.action, btn.dataset.id));
  renderPatientsOptions();
}

function renderPatientsOptions() {
  els.patientsOptions.innerHTML = state.patients.map(p => `<option value="${escapeHtml(p.name)}"></option>`).join('');
}

function handlePatientAction(action, id) {
  const patient = findPatient(id);
  if (!patient) return;
  if (action === 'open') { currentPatientId = id; setView('prontuario'); }
  if (action === 'edit') { editingPatientId = id; setView('cadastroPaciente', {patientId:id}); }
  if (action === 'print') { printPatient(id); }
  if (action === 'consult') { currentPatientId = id; setView('consulta'); }
  if (action === 'delete') {
    if (confirm(`Excluir o paciente ${patient.name}?`)) {
      state.patients = state.patients.filter(p => p.id !== id);
      state.appointments = state.appointments.filter(a => a.patientId !== id);
      state.consultations = state.consultations.filter(c => c.patientId !== id);
      if (currentPatientId === id) currentPatientId = state.patients[0]?.id || null;
      saveState();
      renderPatients(els.patientSearch.value || '');
      renderAgenda();
    }
  }
}

function renderRecordView() {
  const patient = findPatient(currentPatientId);
  if (!patient) {
    els.recordSummary.innerHTML = '<div class="empty-state">Nenhum paciente selecionado.</div>';
    els.consultationsList.innerHTML = '';
    return;
  }
  els.recordSummary.innerHTML = `
    <div>
      <div class="avatar-circle">${patient.photo ? `<img src="${patient.photo}" alt="foto" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : '👤'}</div>
    </div>
    <div>
      <div class="patient-name-line">${escapeHtml(patient.record || '')} - ${escapeHtml(patient.name)}</div>
      <div class="patient-subtitle">(${patientAge(patient.birth)}) ${escapeHtml(patient.gender || 'Não informado')}</div>
      <div class="reminder-pill">Lembrete para consulta ${escapeHtml(patient.reminder || 'não definido')} <button id="editReminderBtn">✎</button></div>
      <div class="summary-grid">
        <div class="summary-item"><span>Sexo</span><strong>${escapeHtml(patient.gender || '—')}</strong></div>
        <div class="summary-item"><span>Data nasc.</span><strong>${escapeHtml(formatDateBR(patient.birth) || '—')}</strong></div>
        <div class="summary-item"><span>Convênio</span><strong>${escapeHtml(patient.insurance || '—')}</strong></div>
        <div class="summary-item"><span>Celular</span><strong>${escapeHtml(maskPhone(patient.mobile) || '—')}</strong></div>
        <div class="summary-item"><span>Email</span><strong>${escapeHtml(patient.email || '—')}</strong></div>
        <div class="summary-item"><span>Cidade</span><strong>${escapeHtml(patient.city || '—')}</strong></div>
        <div class="summary-item"><span>Observações</span><strong>${escapeHtml(patient.observations || '—')}</strong></div>
        <div class="summary-item"><span>Status</span><strong>${patient.inactive ? 'Inativo' : 'Ativo'}</strong></div>
      </div>
      <div class="record-badges">
        ${patient.blocked ? '<span class="badge">Bloqueado</span>' : ''}
        ${patient.dead ? '<span class="badge">Em óbito</span>' : ''}
        <button class="small-link" id="editCurrentPatientBtn">Editar cadastro</button>
      </div>
    </div>`;
  document.getElementById('editReminderBtn').onclick = () => {
    const value = prompt('Defina o lembrete para consulta:', patient.reminder || '');
    if (value !== null) {
      patient.reminder = value;
      saveState();
      renderRecordView();
    }
  };
  document.getElementById('editCurrentPatientBtn').onclick = () => setView('cadastroPaciente', {patientId: patient.id});
  renderConsultationsList(patient.id);
}

function renderConsultationsList(patientId) {
  const list = state.consultations.filter(c => c.patientId === patientId).sort((a,b) => b.date.localeCompare(a.date));
  els.consultationsList.innerHTML = list.length ? list.map(c => `
    <div class="consultation-item">
      <div class="consultation-item-head"><span>${escapeHtml(formatDateBR(c.date))}</span><span>${escapeHtml(c.status || 'finalizado')}</span></div>
      <div class="consultation-meta">Duração: ${escapeHtml(c.duration || '00:00:00')}</div>
      <div><strong>Diagnóstico:</strong> ${escapeHtml(c.diagnostico || '—')}</div>
      <div><strong>Conduta:</strong> ${escapeHtml(c.conduta || '—')}</div>
      <div style="margin-top:8px"><button class="small-link" data-consult-edit="${c.id}">Abrir consulta</button></div>
    </div>`).join('') : '<div class="empty-state">Nenhuma consulta registrada.</div>';
  els.consultationsList.querySelectorAll('[data-consult-edit]').forEach(btn => btn.onclick = () => {
    setView('consulta', {consultation: state.consultations.find(c => c.id === btn.dataset.consultEdit)});
  });
}

function renderConsultView(consultation = null) {
  const patient = findPatient(currentPatientId);
  if (!patient) return;
  els.consultPatientName.textContent = patient.name;
  els.consultDate.value = consultation?.date || state.selectedDate;
  document.getElementById('consultationForm').reset();
  consultFiles = [...(consultation?.files || [])];
  if (consultation) {
    for (const [key,val] of Object.entries(consultation)) {
      const field = document.querySelector(`#consultationForm [name="${key}"]`);
      if (field && typeof val === 'string') field.value = val;
    }
  }
  renderConsultFileList();
  startConsultTimer(consultation?.duration || null);
}

function renderConsultFileList() {
  els.consultFileList.innerHTML = consultFiles.length ? consultFiles.map(f => `<div>📎 ${escapeHtml(f)}</div>`).join('') : '<div>Nenhum arquivo anexado.</div>';
}

function startConsultTimer(initialDuration) {
  clearInterval(consultTimerInterval);
  if (initialDuration) {
    els.consultTimer.textContent = initialDuration;
    consultStartTime = Date.now() - parseDurationToMs(initialDuration);
  } else {
    consultStartTime = Date.now();
    els.consultTimer.textContent = '00:00:00';
  }
  consultTimerInterval = setInterval(() => {
    const elapsed = Date.now() - consultStartTime;
    els.consultTimer.textContent = msToDuration(elapsed);
  }, 1000);
}

function parseDurationToMs(text) {
  const [h,m,s] = (text || '0:0:0').split(':').map(Number);
  return ((h*60 + m)*60 + s) * 1000;
}
function msToDuration(ms) {
  const total = Math.floor(ms / 1000);
  const h = String(Math.floor(total / 3600)).padStart(2,'0');
  const m = String(Math.floor((total % 3600) / 60)).padStart(2,'0');
  const s = String(total % 60).padStart(2,'0');
  return `${h}:${m}:${s}`;
}

function renderPatientEditForm(patientId=null) {
  const patient = patientId ? findPatient(patientId) : seedPatient({id:uid(), record: String(Math.floor(10000 + Math.random()*89999)), name:'', birth:''});
  editingPatientId = patientId || null;
  const form = document.getElementById('patientEditForm');
  form.reset();
  setField('name', patient.name); setField('record', patient.record); setField('birthIso', patient.birth); setField('gender', patient.gender);
  setField('bloodType', patient.bloodType); setField('cep', patient.cep); setField('address', patient.address); setField('number', patient.number);
  setField('district', patient.district); setField('phone', patient.phone); setField('mobile', patient.mobile); setField('commercialPhone', patient.commercialPhone);
  setField('extension', patient.extension); setField('birthPlace', patient.birthPlace); setField('city', patient.city); setField('state', patient.state);
  setField('profession', patient.profession); setField('spouse', patient.spouse); setField('father', patient.father); setField('mother', patient.mother);
  setField('insurance', patient.insurance); setField('insuranceNumber', patient.insuranceNumber); setField('insuranceValidity', patient.insuranceValidity); setField('insuranceAccommodation', patient.insuranceAccommodation);
  setField('cpf', patient.cpf); setField('rg', patient.rg); setField('email', patient.email); setField('insuranceNotes', patient.insuranceNotes); setField('observations', patient.observations);
  form.querySelector('[name="notifications"]').checked = !!patient.notifications;
  form.querySelector('[name="inactive"]').checked = !!patient.inactive;
  form.querySelector('[name="blocked"]').checked = !!patient.blocked;
  form.querySelector('[name="dead"]').checked = !!patient.dead;
  renderAvatarPreview(patient.photo);

  document.getElementById('savePatientPageBtn').onclick = savePatientFromPage;
  document.getElementById('printPatientBtn').onclick = () => printPatient(patient.id || editingPatientId);
}

function setField(name, value) {
  const input = document.querySelector(`#patientEditForm [name="${name}"]`);
  if (input) input.value = value || '';
}

function renderAvatarPreview(photo) {
  els.patientAvatarPreview.innerHTML = photo ? `<img src="${photo}" alt="foto" style="width:100%;height:100%;object-fit:cover;border-radius:50%">` : '👤';
  els.patientAvatarPreview.dataset.photo = photo || '';
}

function savePatientFromPage() {
  const form = document.getElementById('patientEditForm');
  const fd = new FormData(form);
  const patientData = seedPatient({
    id: editingPatientId || uid(),
    name: fd.get('name') || '',
    record: fd.get('record') || String(Math.floor(10000 + Math.random()*89999)),
    birth: fd.get('birthIso') || '',
    gender: fd.get('gender') || '',
    bloodType: fd.get('bloodType') || '',
    cep: fd.get('cep') || '',
    address: fd.get('address') || '',
    number: fd.get('number') || '',
    district: fd.get('district') || '',
    phone: fd.get('phone') || '',
    mobile: fd.get('mobile') || '',
    commercialPhone: fd.get('commercialPhone') || '',
    extension: fd.get('extension') || '',
    birthPlace: fd.get('birthPlace') || '',
    city: fd.get('city') || '',
    state: fd.get('state') || '',
    profession: fd.get('profession') || '',
    spouse: fd.get('spouse') || '',
    father: fd.get('father') || '',
    mother: fd.get('mother') || '',
    insurance: fd.get('insurance') || '',
    insuranceNumber: fd.get('insuranceNumber') || '',
    insuranceValidity: fd.get('insuranceValidity') || '',
    insuranceAccommodation: fd.get('insuranceAccommodation') || '',
    cpf: fd.get('cpf') || '', rg: fd.get('rg') || '', email: fd.get('email') || '',
    insuranceNotes: fd.get('insuranceNotes') || '', observations: fd.get('observations') || '',
    notifications: !!fd.get('notifications'), inactive: !!fd.get('inactive'), blocked: !!fd.get('blocked'), dead: !!fd.get('dead'),
    photo: els.patientAvatarPreview.dataset.photo || '', reminder: findPatient(editingPatientId)?.reminder || 'não definido'
  });
  if (!patientData.name.trim()) { alert('Informe o nome do paciente.'); return; }

  const idx = state.patients.findIndex(p => p.id === patientData.id);
  if (idx >= 0) state.patients[idx] = {...state.patients[idx], ...patientData};
  else state.patients.unshift(patientData);

  currentPatientId = patientData.id;
  saveState();
  renderPatients(els.patientSearch.value || '');
  renderAgenda();
  alert('Paciente salvo com sucesso.');
  setView('prontuario');
}

function printPatient(id) {
  const patient = findPatient(id || editingPatientId || currentPatientId);
  if (!patient) return;
  const html = `
    <html><head><title>Ficha do paciente</title><style>body{font-family:Arial;padding:30px;color:#1b2b42}h1{font-size:22px;margin-bottom:18px}table{border-collapse:collapse;width:100%}td{border:1px solid #d9e0ea;padding:10px}</style></head>
    <body>
      <h1>Ficha do paciente</h1>
      <table>
        <tr><td><strong>Nome</strong></td><td>${escapeHtml(patient.name)}</td></tr>
        <tr><td><strong>Prontuário</strong></td><td>${escapeHtml(patient.record || '')}</td></tr>
        <tr><td><strong>Nascimento</strong></td><td>${escapeHtml(formatDateBR(patient.birth))}</td></tr>
        <tr><td><strong>Celular</strong></td><td>${escapeHtml(maskPhone(patient.mobile))}</td></tr>
        <tr><td><strong>Convênio</strong></td><td>${escapeHtml(patient.insurance || '')}</td></tr>
        <tr><td><strong>Observações</strong></td><td>${escapeHtml(patient.observations || '')}</td></tr>
      </table>
      <script>window.print();</script>
    </body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html); w.document.close();
}

function openAppointmentModal({time=null, date=null, appointmentId=null}={}) {
  const modal = document.getElementById('appointmentModal');
  const form = document.getElementById('appointmentForm');
  form.reset();
  form.dataset.editId = appointmentId || '';
  const targetDate = date || state.selectedDate;
  els.appointmentDate.value = targetDate;
  if (time) form.querySelector('[name="time"]').value = time;
  if (appointmentId) {
    const ap = state.appointments.find(a => a.id === appointmentId);
    if (ap) {
      form.querySelector('[name="patient"]').value = ap.patient;
      form.querySelector('[name="date"]').value = ap.date;
      form.querySelector('[name="time"]').value = ap.time;
      form.querySelector('[name="insurance"]').value = ap.insurance || '';
      form.querySelector('[name="procedure"]').value = ap.procedure || '';
      form.querySelector('[name="type"]').value = ap.type || 'Consulta';
      form.querySelector('[name="notes"]').value = ap.notes || '';
    }
  }
  modal.classList.add('show');
}

function openStatusMenu(e, appointmentId, emptyTime) {
  const menu = document.getElementById('statusMenu');
  menu.innerHTML = '';
  statuses.forEach(([icon,label]) => {
    const b = document.createElement('button');
    b.className = 'status-option';
    b.innerHTML = `<span>${icon}</span>${label}`;
    b.onclick = () => {
      if (appointmentId) {
        const ap = state.appointments.find(a => a.id === appointmentId);
        if (ap) {
          if (label === 'Limpar status') { ap.status = ''; ap.statusTime=''; }
          else { ap.status = label; ap.statusTime = label ? currentClock() : ''; }
        }
      } else if (emptyTime && label !== 'Limpar status') {
        openAppointmentModal({time: emptyTime, date: state.selectedDate});
      }
      saveState();
      menu.classList.remove('show');
      renderAgenda();
    };
    menu.appendChild(b);
  });
  menu.style.left = Math.min(e.clientX, window.innerWidth - 230) + 'px';
  menu.style.top = Math.min(e.clientY, window.innerHeight - 430) + 'px';
  menu.classList.add('show');
}

function currentClock() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
}

function saveAppointment(e) {
  e.preventDefault();
  const form = e.target;
  const fd = new FormData(form);
  const patientName = (fd.get('patient') || '').trim();
  if (!patientName) return;
  let patient = state.patients.find(p => p.name.toLowerCase() === patientName.toLowerCase());
  if (!patient) {
    patient = seedPatient({id:uid(), record:String(Math.floor(10000+Math.random()*89999)), name: patientName, birth:'', mobile:'', phone:'', gender:'Não informado', insurance: fd.get('insurance') || 'PARTICULAR'});
    state.patients.unshift(patient);
  }
  const payload = {
    id: form.dataset.editId || uid(),
    date: fd.get('date'),
    time: fd.get('time'),
    patientId: patient.id,
    patient: patient.name,
    insurance: fd.get('insurance') || patient.insurance || '',
    procedure: fd.get('procedure') || '',
    type: fd.get('type') || '',
    status: 'Confirmado',
    statusTime: currentClock(),
    notes: fd.get('notes') || ''
  };
  const idx = state.appointments.findIndex(a => a.id === payload.id);
  if (idx >= 0) state.appointments[idx] = {...state.appointments[idx], ...payload};
  else state.appointments.push(payload);
  saveState();
  document.getElementById('appointmentModal').classList.remove('show');
  renderPatients(els.patientSearch.value || '');
  renderAgenda();
}

function saveConsultation(status='finalizado') {
  const form = document.getElementById('consultationForm');
  const fd = new FormData(form);
  const payload = {
    id: uid(),
    patientId: currentPatientId,
    date: fd.get('data') || state.selectedDate,
    duration: els.consultTimer.textContent,
    avaliacao: fd.get('avaliacao') || '',
    impressao: fd.get('impressao') || '',
    conduta: fd.get('conduta') || '',
    diagnostico: fd.get('diagnostico') || '',
    hipotese: fd.get('hipotese') || '',
    queixa: fd.get('queixa') || '',
    hda: fd.get('hda') || '',
    antecedentes: fd.get('antecedentes') || '',
    habitos: fd.get('habitos') || '',
    sintomas: fd.get('sintomas') || '',
    medicacoes: fd.get('medicacoes') || '',
    outras_obs: fd.get('outras_obs') || '',
    peso: fd.get('peso') || '',
    altura: fd.get('altura') || '',
    exame_fisico: fd.get('exame_fisico') || '',
    cirurgia: fd.get('cirurgia') || '',
    atestado: fd.get('atestado') || '',
    receituario: fd.get('receituario') || '',
    files: [...consultFiles],
    status
  };
  state.consultations.unshift(payload);
  // if patient has appointment today, mark attended
  const todayAppt = state.appointments.find(a => a.patientId === currentPatientId && a.date === payload.date);
  if (todayAppt) { todayAppt.status = 'Atendido'; todayAppt.statusTime = currentClock(); }
  saveState();
  clearInterval(consultTimerInterval);
  alert(status === 'rascunho' ? 'Rascunho salvo.' : 'Atendimento finalizado com sucesso.');
  setView('prontuario');
}

function maskPhone(value) {
  const v = normalizePhone(value);
  if (!v) return '';
  if (v.length === 11) return `(${v.slice(0,2)}) ${v.slice(2,7)}-${v.slice(7)}`;
  if (v.length === 10) return `(${v.slice(0,2)}) ${v.slice(2,6)}-${v.slice(6)}`;
  return value;
}

function escapeHtml(str='') {
  return String(str)
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}

// Global interactions

document.querySelectorAll('.nav-item').forEach(btn => btn.onclick = () => setView(btn.dataset.view));
document.getElementById('fitPatientBtn').onclick = () => openAppointmentModal({date: state.selectedDate});
document.querySelectorAll('.close-modal').forEach(btn => btn.onclick = () => document.getElementById('appointmentModal').classList.remove('show'));
document.getElementById('appointmentForm').onsubmit = saveAppointment;
document.getElementById('patientSearch').oninput = e => renderPatients(e.target.value);
document.getElementById('appointmentSearch').oninput = () => renderSchedule();
document.getElementById('newPatientBtn').onclick = () => setView('cadastroPaciente');
document.getElementById('newConsultationBtn').onclick = () => setView('consulta');
document.getElementById('saveDraftBtn').onclick = () => saveConsultation('rascunho');
document.getElementById('consultationForm').onsubmit = e => { e.preventDefault(); saveConsultation('finalizado'); };
document.getElementById('summarizeBtn').onclick = summarizeHistory;
document.getElementById('summarizeHistoryBtn').onclick = summarizeHistory;
document.getElementById('saveNoteBtn').onclick = () => { state.dayNotes[state.selectedDate] = els.dayNoteText.value; saveState(); alert('Lembrete salvo.'); };
document.getElementById('goTodayBtn').onclick = () => { state.selectedDate = '2026-06-18'; state.calendarDate = '2026-06-18'; saveState(); renderAgenda(); };
document.getElementById('prevMonthBtn').onclick = () => shiftMonth(-1);
document.getElementById('nextMonthBtn').onclick = () => shiftMonth(1);
document.querySelectorAll('.mode-btn').forEach(btn => btn.onclick = () => { state.viewMode = btn.dataset.mode; saveState(); renderAgenda(); });
document.querySelectorAll('[data-record-tab]').forEach(btn => btn.onclick = () => switchTabs(btn, '[data-record-tab]', '#record-tab-'));
document.querySelectorAll('[data-consult-tab]').forEach(btn => btn.onclick = () => switchTabs(btn, '[data-consult-tab]', '#consult-tab-'));
document.querySelectorAll('[data-edit-tab]').forEach(btn => btn.onclick = () => switchTabs(btn, '[data-edit-tab]', '#edit-tab-'));
document.getElementById('patientPhotoInput').addEventListener('change', handlePhotoChange);
document.getElementById('removePhotoBtn').onclick = () => renderAvatarPreview('');
document.getElementById('consultFileInput').addEventListener('change', e => {
  consultFiles = [...consultFiles, ...Array.from(e.target.files).map(f => f.name)];
  renderConsultFileList();
  e.target.value = '';
});
document.addEventListener('click', e => {
  if (!e.target.closest('.status-btn') && !e.target.closest('#statusMenu')) document.getElementById('statusMenu').classList.remove('show');
});

function shiftMonth(direction) {
  const d = new Date(state.calendarDate + 'T00:00:00');
  d.setMonth(d.getMonth() + direction);
  state.calendarDate = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-01`;
  saveState();
  renderCalendar();
}

function switchTabs(button, selector, panelPrefix) {
  const parent = button.parentElement;
  parent.querySelectorAll(selector).forEach(b => b.classList.remove('active'));
  button.classList.add('active');
  const panels = button.closest('.record-card, .consult-card, .patient-edit-card')?.querySelectorAll('.tab-panel') || document.querySelectorAll('.tab-panel');
  panels.forEach(p => p.classList.remove('active'));
  const key = button.dataset.recordTab || button.dataset.consultTab || button.dataset.editTab;
  const panel = document.querySelector(`${panelPrefix}${key}`);
  if (panel) panel.classList.add('active');
}

function summarizeHistory() {
  const patient = findPatient(currentPatientId);
  if (!patient) return;
  const list = state.consultations.filter(c => c.patientId === patient.id);
  if (!list.length) {
    alert('Nenhuma consulta registrada para resumir.');
    return;
  }
  const latest = list[0];
  alert(`Resumo do histórico de ${patient.name}:\n\nÚltima consulta em ${formatDateBR(latest.date)}.\nDiagnóstico: ${latest.diagnostico || 'não informado'}.\nConduta: ${latest.conduta || 'não informada'}.\nTotal de consultas registradas: ${list.length}.`);
}

function handlePhotoChange(e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => renderAvatarPreview(reader.result);
  reader.readAsDataURL(file);
}

// init
renderPatients();
renderAgenda();
setView('agenda');
