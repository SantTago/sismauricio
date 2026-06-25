const STORAGE_KEY = 'clinicflow_state_v5';
const paymentMethods = ['Pix','Espécie','Crédito','Débito'];
const financeMethodPalette = { Pix:'#00a884', 'Espécie':'#f59e0b', 'Crédito':'#7c3aed', 'Débito':'#0ea5e9' };
const statuses = [
  ['✅','Confirmado'],['😕','Faltou'],['🕒','Em espera'],['🪑','Em consulta'],['👁️','Dilatação'],
  ['🙂','Atendido'],['🚩','Desmarcado'],['📵','Não atendeu'],['🔕','Desligado'],['✕','Não estava'],['🟢','WhatsApp'],['🧽','Limpar status']
];
const appointmentTypes = ['Sessão','Avaliação'];
const appointmentNumberOptions = Array.from({length: 10}, (_, i) => i + 1);
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
  appointmentDate: document.getElementById('appointmentDate'),
  financeSummaryGrid: document.getElementById('financeSummaryGrid'),
  financeTableBody: document.getElementById('financeTableBody'),
  financeMonthlyReport: document.getElementById('financeMonthlyReport'),
  installmentsList: document.getElementById('installmentsList')
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try { return JSON.parse(raw); } catch (e) {}
  }
  const seedDate = '2026-06-21';
  return {
    selectedDate: seedDate,
    calendarDate: seedDate,
    viewMode: 'day',
    dayNotes: {[seedDate]: 'Lembrar de confirmar pacientes do turno da tarde.'},
    patients: [
      seedPatient({id: uid(), record:'15259', name:'Wicherlanny Nery Carvalho', birth:'1987-06-21', mobile:'86999427503', phone:'', gender:'Feminino', schooling:'Ensino médio completo', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'16701', name:'Patrícia Rodrigues de Sousa', birth:'2004-06-21', mobile:'86988577757', phone:'', gender:'Feminino', schooling:'Ensino médio completo', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'5139', name:'Abdias Cassimiro da Silva', birth:'1931-06-21', mobile:'86994226580', phone:'', gender:'Masculino', schooling:'Ensino fundamental completo', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'5662', name:'Abdias Pereira Rocha', birth:'1959-06-21', mobile:'981401633', phone:'', gender:'Masculino', schooling:'Ensino médio completo', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'5705', name:'Abdon Ferreira dos Santos', birth:'1943-06-21', mobile:'86994614249', phone:'', gender:'Masculino', schooling:'Ensino médio completo', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'12579', name:'Abdoral Felismino de Sousa', birth:'1954-03-18', mobile:'99984339010', phone:'', gender:'Masculino', schooling:'Ensino fundamental completo', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'21953', name:'Abel Almeida Guimaraes', birth:'1983-05-20', mobile:'86998445840', phone:'', gender:'Masculino', schooling:'Ensino médio completo', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'24526', name:'Abel da Silva Marques', birth:'1986-06-14', mobile:'86988050512', phone:'', gender:'Masculino', schooling:'Ensino fundamental completo', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'26747', name:'Aberlania da Costa Silva', birth:'1984-10-18', mobile:'86999244103', phone:'', gender:'Feminino', schooling:'Ensino fundamental completo', city:'Teresina', state:'PI'}),
      seedPatient({id: uid(), record:'29262', name:'Abigail Feitosa de Araújo', birth:'2002-11-17', mobile:'8695810385', phone:'', gender:'Feminino', schooling:'Ensino médio completo', city:'Teresina', state:'PI'})
    ],
    appointments: [],
    consultations: [],
    financial: createSeedFinancialState()
  };
}

function seedPatient(data) {
  return {
    photo:'',
    reminder:'não definido',
    bloodType:'', address:'', number:'', district:'', cep:'', city:'', state:'', commercialPhone:'', extension:'', birthPlace:'',
    schooling:'', profession:'', spouse:'', father:'', mother:'', cpf:'', rg:'', email:'', observations:'', insurance:'', insuranceNumber:'', insuranceValidity:'', insuranceAccommodation:'', insuranceNotes:'',
    notifications:true, inactive:false, blocked:false, dead:false, ...data
  };
}

function createSeedFinancialState() {
  return {
    activeFilter: 'all',
    payments: [
      {id:uid(), date:'2026-06-21', patient:'João da Silva', service:'Avaliação Neuropsicológica', total:499.99, received:250, method:'Pix', status:'Parcialmente Pago'},
      {id:uid(), date:'2026-06-21', patient:'Maria Souza', service:'Consulta', total:150, received:150, method:'Espécie', status:'Pago'},
      {id:uid(), date:'2026-06-21', patient:'Pedro Lima', service:'Avaliação', total:400, received:400, method:'Crédito', status:'Pago'},
      {id:uid(), date:'2026-06-21', patient:'Lucas Ribeiro', service:'Sessão', total:100, received:100, method:'Débito', status:'Pago'},
      {id:uid(), date:'2026-06-21', patient:'Carla Nunes', service:'Sessão', total:350, received:350, method:'Pix', status:'Pago'},
      {id:uid(), date:'2026-06-21', patient:'Ana Beatriz', service:'Avaliação', total:500, received:0, method:'Pix', status:'Pendente'},
      {id:uid(), date:'2026-06-18', patient:'Rafael Costa', service:'Consulta', total:500, received:500, method:'Espécie', status:'Pago'}
    ],
    monthlyTotals: { 'Pix': 5500, 'Crédito': 3000, 'Débito': 1500, 'Espécie': 2000 },
    installments: [
      {
        id:uid(),
        patient:'Joaquim Barbian Diniz',
        total:499.99,
        parts:[
          {number:1, total:250, status:'Pago'},
          {number:2, total:249.99, status:'Pendente'}
        ]
      }
    ]
  };
}

function ensureFinancialState() {
  if (!state.financial) state.financial = createSeedFinancialState();
  if (!Array.isArray(state.financial.payments)) state.financial.payments = createSeedFinancialState().payments;
  if (!Array.isArray(state.financial.installments)) state.financial.installments = createSeedFinancialState().installments;
  if (!state.financial.monthlyTotals) state.financial.monthlyTotals = createSeedFinancialState().monthlyTotals;
  if (!state.financial.activeFilter) state.financial.activeFilter = 'all';
  if (!state.financial.selectedMonth) state.financial.selectedMonth = getMonthKey(state.selectedDate);
  state.financial.payments.forEach(item => {
    if (!paymentMethods.includes(item.method)) item.method = 'Pix';
    item.status = normalizeFinancialStatus(item.total, item.received);
  });
}

function seedDataPopulateAppointments() {
  if (state.appointments.length) return;
  const p1 = state.patients[0], p2 = state.patients[1], p3 = state.patients[2];
  state.appointments = [
    {id:uid(), date:'2026-06-21', time:'12:00', patientId:p1.id, patient:p1.name, procedure:'CONSULTA', type:'Sessão', status:'Atendido', statusTime:'17:05', notes:''},
    {id:uid(), date:'2026-06-21', time:'12:30', patientId:p2.id, patient:p2.name, procedure:'CONSULTA', type:'Avaliação neuropsicológica', status:'Atendido', statusTime:'15:28', notes:''},
    {id:uid(), date:'2026-06-21', time:'13:30', patientId:p3.id, patient:p3.name, procedure:'RETORNO', type:'Sessão', status:'Confirmado', statusTime:'', notes:''}
  ];
  state.consultations = [
    {id:uid(), patientId:p1.id, date:'2026-06-15', duration:'00:24:18', avaliacao:'Paciente em acompanhamento. Boa resposta ao tratamento.', impressao:'Quadro estável.', conduta:'Manter conduta e retorno em 30 dias.', diagnostico:'Transtorno de ansiedade generalizada', hipotese:'TAG', status:'finalizado', files:[]},
    {id:uid(), patientId:p1.id, date:'2026-06-02', duration:'00:18:40', avaliacao:'Primeira consulta com coleta de dados.', impressao:'Necessita seguimento.', conduta:'Solicitado retorno.', diagnostico:'Investigação clínica', hipotese:'', status:'rascunho', files:[]}
  ];
}
seedDataPopulateAppointments();
ensureFinancialState();
migrateAppointments();
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

function normalizeAppointmentKind(value='') {
  const text = String(value || '').trim().toLowerCase();
  if (text.includes('avali')) return 'Avaliação';
  if (text.includes('sess')) return 'Sessão';
  return appointmentTypes.includes(value) ? value : 'Sessão';
}

function migrateAppointments() {
  const counters = {};
  const sorted = [...state.appointments].sort((a,b) => `${a.patientId || ''}-${a.date || ''}-${a.time || ''}`.localeCompare(`${b.patientId || ''}-${b.date || ''}-${b.time || ''}`));
  sorted.forEach(ap => {
    const kind = normalizeAppointmentKind(ap.type || ap.procedure);
    const rawProcedure = String(ap.procedure || '').toLowerCase();
    const procedureAlreadyUsesNewKind = rawProcedure.includes('sess') || rawProcedure.includes('avali');
    ap.procedure = procedureAlreadyUsesNewKind ? normalizeAppointmentKind(ap.procedure) : kind;
    ap.type = normalizeAppointmentKind(ap.type || kind);
    const key = `${ap.patientId || ap.patient || ''}|${ap.type}`;
    counters[key] = counters[key] || 0;
    if (!Number(ap.attendanceNumber)) {
      counters[key] += 1;
      ap.attendanceNumber = Math.min(counters[key], 10);
    } else {
      counters[key] = Math.max(counters[key], Number(ap.attendanceNumber));
    }
  });
}

function getNextAttendanceNumber(patientId, kind, excludeId='') {
  const normalizedKind = normalizeAppointmentKind(kind);
  const sameKindAppointments = state.appointments.filter(a => {
    if (a.id === excludeId) return false;
    if (a.patientId !== patientId) return false;
    return normalizeAppointmentKind(a.type || a.procedure) === normalizedKind;
  });
  const highestNumber = Math.max(0, ...sameKindAppointments.map(a => Number(a.attendanceNumber) || 0));
  const next = highestNumber ? highestNumber + 1 : sameKindAppointments.length + 1;
  return Math.min(Math.max(next, 1), 10);
}

function renderAttendanceNumberOptions(selectedNumber) {
  const selected = Number(selectedNumber) || 1;
  return appointmentNumberOptions
    .map(number => `<option value="${number}"${number === selected ? ' selected' : ''}>${number}</option>`)
    .join('');
}


function renderInlineKindSelect(ap, field, extraClass='') {
  const selected = normalizeAppointmentKind(ap[field] || ap.type || ap.procedure);
  return `<div class="inline-select-wrap ${extraClass}"><select class="inline-kind-select ${extraClass}" data-id="${ap.id}" data-field="${field}" aria-label="Mudar ${field === 'procedure' ? 'procedimento' : 'tipo'}">${appointmentTypes.map(type => `<option value="${escapeHtml(type)}"${type === selected ? ' selected' : ''}>${escapeHtml(type)}</option>`).join('')}</select><span class="inline-select-arrow">▾</span></div>`;
}

function formatAppointmentTypeCell(ap) {
  const number = Number(ap.attendanceNumber) || 1;
  return `<div class="appointment-type-cell">${renderInlineKindSelect(ap, 'type', 'type-select')}<div class="inline-select-wrap is-number"><select class="inline-attendance-number" data-id="${ap.id}" title="Mudar número do atendimento" aria-label="Número do atendimento">${renderAttendanceNumberOptions(number)}</select><span class="inline-select-arrow">▾</span></div></div>`;
}


const statusClassMap = {
  'Confirmado': 'confirmado',
  'Faltou': 'faltou',
  'Em espera': 'em-espera',
  'Em consulta': 'em-consulta',
  'Dilatação': 'dilatacao',
  'Atendido': 'atendido',
  'Desmarcado': 'desmarcado',
  'Não atendeu': 'nao-atendeu',
  'Desligado': 'desligado',
  'Não estava': 'nao-estava',
  'WhatsApp': 'whatsapp'
};

function statusClass(status) {
  return statusClassMap[status] || 'sem-status';
}

function setView(viewId, options={}) {
  currentView = viewId;
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active-view'));
  document.getElementById(viewId).classList.add('active-view');
  document.querySelectorAll('.nav-item').forEach(b => b.classList.toggle('active', b.dataset.view === viewId));
  if (viewId === 'prontuario') renderRecordView();
  if (viewId === 'consulta') renderConsultView(options.consultation || null);
  if (viewId === 'cadastroPaciente') renderPatientEditForm(options.patientId || null);
  if (viewId === 'financeiro') renderFinanceiro();
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
  renderBirthdays();
  renderSchedule();
}

function renderBirthdays() {
  const title = document.querySelector('.birthday-card strong');
  if (title) title.textContent = `Aniversariantes ${formatDateBR(state.selectedDate).slice(0,5)} 🎂`;
  const birthdays = getBirthdaysForDate(state.selectedDate);
  if (!birthdays.length) {
    els.birthdayList.innerHTML = '<span class="birthday-empty">Nenhum aniversariante.</span>';
    return;
  }
  els.birthdayList.innerHTML = birthdays.map(p => {
    const phone = normalizePhone(p.mobile || p.phone);
    const wa = phone ? `<span class="wa-badge" title="WhatsApp">☎</span>` : '';
    return `<span class="birthday-person">${escapeHtml(p.name)} ${wa}</span>`;
  }).join('');
}

function getScheduleSlots() {
  const slots = [];
  for (let h = 7; h <= 17; h++) {
    for (let m = 0; m < 60; m += 15) {
      // intervalo de almoço igual ao modelo de referência
      if (h === 12 || (h === 13 && m < 30)) continue;
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`);
    }
  }
  return slots;
}

function normalizeScheduleTime(value='') {
  const match = String(value || '').match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '09:00';
  const hour = Math.min(Math.max(Number(match[1]) || 0, 0), 23);
  const minute = Math.min(Math.max(Number(match[2]) || 0, 0), 59);
  return `${String(hour).padStart(2,'0')}:${String(minute).padStart(2,'0')}`;
}

function sortScheduleTimes(a, b) {
  return normalizeScheduleTime(a).localeCompare(normalizeScheduleTime(b));
}

function getScheduleTimesForSelectedDate(appointments) {
  const fixedSlots = getScheduleSlots();
  const appointmentTimes = appointments.map(a => normalizeScheduleTime(a.time)).filter(Boolean);
  return [...new Set([...fixedSlots, ...appointmentTimes])].sort(sortScheduleTimes);
}

function renderAppointmentTypeOptions() {
  const selects = [
    document.getElementById('appointmentProcedure'),
    document.getElementById('appointmentType')
  ].filter(Boolean);

  selects.forEach(select => {
    select.innerHTML = appointmentTypes
      .map(type => `<option value="${escapeHtml(type)}">${escapeHtml(type)}</option>`)
      .join('');
  });

  const numberSelect = document.getElementById('attendanceNumber');
  if (numberSelect) {
    numberSelect.innerHTML = appointmentNumberOptions
      .map(number => `<option value="${number}">${number}</option>`)
      .join('');
  }
}

function getAppointmentsForSelectedDate() {
  let list = state.appointments.filter(a => a.date === state.selectedDate);
  const q = els.appointmentSearch.value.trim().toLowerCase();
  if (q) {
    list = list.filter(a => [a.patient,a.procedure,a.type,a.attendanceNumber,formatStatusText(a)].join(' ').toLowerCase().includes(q));
  }
  list.sort((a,b) => a.time.localeCompare(b.time));
  return list;
}

function renderSchedule() {
  const rows = els.scheduleRows;
  rows.innerHTML='';
  const appointments = getAppointmentsForSelectedDate();
  const map = Object.fromEntries(appointments.map(a => [normalizeScheduleTime(a.time), {...a, time: normalizeScheduleTime(a.time)}]));
  const fixedSlots = new Set(getScheduleSlots());

  getScheduleTimesForSelectedDate(appointments).forEach(time => {
    const ap = map[time];
    const div = document.createElement('div');
    const rowStatusClass = ap ? statusClass(ap.status) : '';
    const isCustomTime = !fixedSlots.has(time);
    div.className = 'schedule-row schedule-grid' + (ap ? ` status-${rowStatusClass}` : ' empty') + (isCustomTime ? ' custom-time' : '') + (time === '13:30' ? ' break-before' : '');
    if (ap) {
      div.innerHTML = `
        <span data-label="Hora">${escapeHtml(time)}${isCustomTime ? '<em class="custom-time-badge">livre</em>' : ''}</span>
        <span data-label="Paciente" class="patient-status-name">${escapeHtml(ap.patient)}</span>
        <span data-label="Procedimento">${renderInlineKindSelect(ap, 'procedure', 'procedure-select')}</span>
        <span data-label="Tipo">${formatAppointmentTypeCell(ap)}</span>
        <span data-label="Status"><button class="status-btn status-${rowStatusClass}" data-id="${ap.id}"><span class="status-icon">${statusIcon(ap.status)}</span><span class="status-label"> ${escapeHtml(formatStatusText(ap) || 'Sem status')}</span></button></span>
        <span data-label="Ações" class="row-actions">
          <button class="action-btn" data-action="open-record" data-patient-id="${ap.patientId || ''}" title="Abrir prontuário">☰</button>
          <button class="action-btn" data-action="edit-appt" data-id="${ap.id}" title="Editar agendamento">✎</button>
        </span>`;
    } else {
      div.innerHTML = `
        <span data-label="Hora">${escapeHtml(time)}</span>
        <span data-label="Paciente"></span>
        <span data-label="Procedimento"></span>
        <span data-label="Tipo"></span>
        <span data-label="Status"><button class="status-btn" data-time="${escapeHtml(time)}"><span class="status-icon">⊘</span><span class="status-label">Livre</span></button></span>
        <span data-label="Ações" class="row-actions"><button class="action-btn" data-action="quick-add" data-time="${escapeHtml(time)}" title="Agendar neste horário">＋</button></span>`;
    }
    rows.appendChild(div);
  });
  els.totalRecords.textContent = appointments.length;

  document.querySelectorAll('.status-btn').forEach(b => b.onclick = e => openStatusMenu(e, b.dataset.id, b.dataset.time));
  document.querySelectorAll('.action-btn').forEach(b => b.onclick = () => handleRowAction(b.dataset.action, b.dataset));
  document.querySelectorAll('.inline-kind-select').forEach(select => {
    select.onclick = e => e.stopPropagation();
    select.onchange = () => updateAppointmentKindInline(select.dataset.id, select.dataset.field, select.value);
  });
  document.querySelectorAll('.inline-attendance-number').forEach(select => {
    select.onclick = e => e.stopPropagation();
    select.onchange = () => updateAttendanceNumberInline(select.dataset.id, select.value);
  });
}

function updateAppointmentKindInline(appointmentId, field, value) {
  const ap = state.appointments.find(a => a.id === appointmentId);
  if (!ap || !['procedure','type'].includes(field)) return;
  ap[field] = normalizeAppointmentKind(value);
  saveState();
  renderSchedule();
}

function updateAttendanceNumberInline(appointmentId, value) {
  const ap = state.appointments.find(a => a.id === appointmentId);
  if (!ap) return;
  const number = Number(value);
  ap.attendanceNumber = Math.min(Math.max(number || 1, 1), 10);
  saveState();
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
    .filter(p => [p.name,p.mobile,p.phone,p.email,p.cpf,p.city,p.father,p.mother,p.schooling].join(' ').toLowerCase().includes(q))
    .sort((a,b) => a.name.localeCompare(b.name))
    .forEach(p => {
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${escapeHtml(p.name)}</td>
        <td>${escapeHtml(patientAge(p.birth) || '—')}</td>
        <td>${escapeHtml(formatDateBR(p.birth))}</td>
        <td>${escapeHtml(maskPhone(p.mobile || p.phone))}</td>
        <td>${escapeHtml(p.email || '—')}</td>
        <td>${escapeHtml(p.city || '—')}</td>
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
      <div class="patient-subtitle">${escapeHtml(patientAge(patient.birth) || 'Idade não informada')}</div>
      <div class="reminder-pill">Lembrete para consulta ${escapeHtml(patient.reminder || 'não definido')} <button id="editReminderBtn">✎</button></div>
      <div class="summary-grid">
        <div class="summary-item"><span>Idade</span><strong>${escapeHtml(patientAge(patient.birth) || '—')}</strong></div>
        <div class="summary-item"><span>Data nasc.</span><strong>${escapeHtml(formatDateBR(patient.birth) || '—')}</strong></div>
        <div class="summary-item"><span>Telefone</span><strong>${escapeHtml(maskPhone(patient.mobile || patient.phone) || '—')}</strong></div>
        <div class="summary-item"><span>Email</span><strong>${escapeHtml(patient.email || '—')}</strong></div>
        <div class="summary-item"><span>CPF</span><strong>${escapeHtml(patient.cpf || '—')}</strong></div>
        <div class="summary-item"><span>Escolaridade</span><strong>${escapeHtml(patient.schooling || '—')}</strong></div>
        <div class="summary-item"><span>Cidade</span><strong>${escapeHtml(patient.city || '—')}</strong></div>
        <div class="summary-item"><span>Mãe</span><strong>${escapeHtml(patient.mother || '—')}</strong></div>
        <div class="summary-item"><span>Pai</span><strong>${escapeHtml(patient.father || '—')}</strong></div>
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
  setField('name', patient.name);
  setField('birthIso', patient.birth);
  setField('mobile', patient.mobile || patient.phone);
  setField('email', patient.email);
  setField('cpf', patient.cpf);
  setField('schooling', patient.schooling);
  setField('city', patient.city);
  setField('father', patient.father);
  setField('mother', patient.mother);
  renderAvatarPreview(patient.photo);
  updateAgePreview();
  const birthInput = document.getElementById('editBirth');
  if (birthInput) birthInput.oninput = updateAgePreview;

  document.getElementById('savePatientPageBtn').onclick = savePatientFromPage;
  document.getElementById('printPatientBtn').onclick = () => printPatient(patient.id || editingPatientId);
}

function updateAgePreview() {
  const birth = document.getElementById('editBirth')?.value || '';
  const ageField = document.getElementById('editAge');
  if (ageField) ageField.value = patientAge(birth) || '';
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
  const existing = findPatient(editingPatientId) || {};
  const patientData = seedPatient({
    ...existing,
    id: editingPatientId || uid(),
    name: fd.get('name') || '',
    record: existing.record || String(Math.floor(10000 + Math.random()*89999)),
    birth: fd.get('birthIso') || '',
    mobile: fd.get('mobile') || '',
    phone: fd.get('mobile') || '',
    email: fd.get('email') || '',
    cpf: fd.get('cpf') || '',
    schooling: fd.get('schooling') || '',
    city: fd.get('city') || '',
    father: fd.get('father') || '',
    mother: fd.get('mother') || '',
    photo: els.patientAvatarPreview.dataset.photo || '',
    reminder: existing.reminder || 'não definido'
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
        <tr><td><strong>Data de nascimento</strong></td><td>${escapeHtml(formatDateBR(patient.birth))}</td></tr>
        <tr><td><strong>Idade</strong></td><td>${escapeHtml(patientAge(patient.birth) || '')}</td></tr>
        <tr><td><strong>Telefone</strong></td><td>${escapeHtml(maskPhone(patient.mobile || patient.phone))}</td></tr>
        <tr><td><strong>E-mail</strong></td><td>${escapeHtml(patient.email || '')}</td></tr>
        <tr><td><strong>CPF</strong></td><td>${escapeHtml(patient.cpf || '')}</td></tr>
        <tr><td><strong>Escolaridade</strong></td><td>${escapeHtml(patient.schooling || '')}</td></tr>
        <tr><td><strong>Cidade</strong></td><td>${escapeHtml(patient.city || '')}</td></tr>
        <tr><td><strong>Mãe</strong></td><td>${escapeHtml(patient.mother || '')}</td></tr>
        <tr><td><strong>Pai</strong></td><td>${escapeHtml(patient.father || '')}</td></tr>
      </table>
      <script>window.print();</script>
    </body></html>`;
  const w = window.open('', '_blank');
  w.document.write(html); w.document.close();
}


function openCustomTimeAppointment() {
  const input = document.getElementById('customTimeInput');
  const time = normalizeScheduleTime(input?.value || '08:05');
  if (input) input.value = time;
  openAppointmentModal({time, date: state.selectedDate});
}

function openAppointmentModal({time=null, date=null, appointmentId=null}={}) {
  const modal = document.getElementById('appointmentModal');
  const form = document.getElementById('appointmentForm');
  form.reset();
  form.dataset.editId = appointmentId || '';
  form.dataset.numberManual = 'false';

  const targetDate = date || state.selectedDate;
  els.appointmentDate.value = targetDate;
  form.querySelector('[name="procedure"]').value = appointmentTypes[0];
  form.querySelector('[name="type"]').value = appointmentTypes[0];
  form.querySelector('[name="attendanceNumber"]').value = '1';

  if (time) form.querySelector('[name="time"]').value = normalizeScheduleTime(time);

  if (appointmentId) {
    const ap = state.appointments.find(a => a.id === appointmentId);
    if (ap) {
      const kind = normalizeAppointmentKind(ap.type || ap.procedure);
      form.querySelector('[name="patient"]').value = ap.patient;
      form.querySelector('[name="date"]').value = ap.date;
      form.querySelector('[name="time"]').value = normalizeScheduleTime(ap.time);
      form.querySelector('[name="procedure"]').value = normalizeAppointmentKind(ap.procedure || kind);
      form.querySelector('[name="type"]').value = kind;
      form.querySelector('[name="attendanceNumber"]').value = String(Number(ap.attendanceNumber) || getNextAttendanceNumber(ap.patientId, kind, ap.id));
      form.querySelector('[name="notes"]').value = ap.notes || '';
      form.dataset.numberManual = 'true';
    }
  } else {
    syncAppointmentNumberFromForm(true);
  }

  modal.classList.add('show');
}

function syncAppointmentNumberFromForm(force=false) {
  const form = document.getElementById('appointmentForm');
  if (!form) return;
  if (!force && form.dataset.numberManual === 'true') return;

  const numberSelect = form.querySelector('[name="attendanceNumber"]');
  if (!numberSelect) return;

  const patientName = (form.querySelector('[name="patient"]')?.value || '').trim();
  const patient = state.patients.find(p => p.name.toLowerCase() === patientName.toLowerCase());
  const kind = form.querySelector('[name="type"]')?.value || appointmentTypes[0];
  numberSelect.value = String(patient ? getNextAttendanceNumber(patient.id, kind, form.dataset.editId || '') : 1);
}

function setupAppointmentAutoNumberListeners() {
  const form = document.getElementById('appointmentForm');
  if (!form) return;

  const patientInput = form.querySelector('[name="patient"]');
  const procedureSelect = form.querySelector('[name="procedure"]');
  const typeSelect = form.querySelector('[name="type"]');
  const numberSelect = form.querySelector('[name="attendanceNumber"]');

  patientInput?.addEventListener('input', () => syncAppointmentNumberFromForm());

  procedureSelect?.addEventListener('change', () => {
    // Procedimento e Tipo são independentes: mudar um não altera o outro.
  });

  typeSelect?.addEventListener('change', () => {
    syncAppointmentNumberFromForm();
  });

  numberSelect?.addEventListener('change', () => {
    form.dataset.numberManual = 'true';
  });
}


function openStatusMenu(e, appointmentId, emptyTime) {
  const menu = document.getElementById('statusMenu');
  menu.innerHTML = '';
  statuses.forEach(([icon,label]) => {
    const b = document.createElement('button');
    b.className = 'status-option status-option-' + statusClass(label);
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
  menu.classList.add('show');

  // Mantém a lista de status sempre dentro da tela, sem cortar no canto direito.
  const target = e.currentTarget || e.target;
  const rect = target.getBoundingClientRect();
  const menuRect = menu.getBoundingClientRect();
  const margin = 8;
  let left = rect.left - menuRect.width - margin;
  if (left < margin) left = rect.right + margin;
  if (left + menuRect.width > window.innerWidth - margin) left = window.innerWidth - menuRect.width - margin;
  let top = rect.top;
  if (top + menuRect.height > window.innerHeight - margin) top = window.innerHeight - menuRect.height - margin;
  if (top < margin) top = margin;
  menu.style.left = left + 'px';
  menu.style.top = top + 'px';
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
    patient = seedPatient({id:uid(), record:String(Math.floor(10000+Math.random()*89999)), name: patientName, birth:'', mobile:'', phone:''});
    state.patients.unshift(patient);
  }

  const type = normalizeAppointmentKind(fd.get('type') || appointmentTypes[0]);
  const procedure = normalizeAppointmentKind(fd.get('procedure') || type);
  const manualNumber = Number(fd.get('attendanceNumber'));

  const payload = {
    id: form.dataset.editId || uid(),
    date: fd.get('date'),
    time: normalizeScheduleTime(fd.get('time')), 
    patientId: patient.id,
    patient: patient.name,
    procedure,
    type,
    attendanceNumber: manualNumber || getNextAttendanceNumber(patient.id, type, form.dataset.editId || ''),
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


function formatMoney(value) {
  return new Intl.NumberFormat('pt-BR', {style:'currency', currency:'BRL'}).format(Number(value) || 0);
}

function normalizeFinancialStatus(total, received) {
  const totalValue = Number(total) || 0;
  const receivedValue = Number(received) || 0;
  if (receivedValue <= 0) return 'Pendente';
  if (receivedValue >= totalValue && totalValue > 0) return 'Pago';
  return 'Parcialmente Pago';
}

function financeStatusClass(status='') {
  return String(status || '').toLowerCase().replaceAll(' ','-');
}

function financeMethodClass(method='') {
  return String(method || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g,'-');
}

function getMonthKey(dateIso) {
  const fallback = new Date().toISOString().slice(0,7);
  return String(dateIso || fallback).slice(0,7);
}

function getFinanceMonthKey() {
  ensureFinancialState();
  return state.financial.selectedMonth || getMonthKey(state.selectedDate);
}

function getMonthLabel(monthKey) {
  const [year, month] = String(monthKey || getMonthKey()).split('-');
  const monthIndex = Math.max(0, Math.min(11, Number(month) - 1));
  return `${months[monthIndex]}/${year}`;
}

function shiftFinanceMonth(direction) {
  ensureFinancialState();
  const [year, month] = getFinanceMonthKey().split('-').map(Number);
  const d = new Date(year, month - 1 + direction, 1);
  state.financial.selectedMonth = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
  saveState();
  renderFinanceiro();
}

function setCurrentFinanceMonth() {
  ensureFinancialState();
  state.financial.selectedMonth = getMonthKey(new Date().toISOString().slice(0,10));
  saveState();
  renderFinanceiro();
}

function getPaymentsForFinanceMonth(monthKey=getFinanceMonthKey()) {
  return state.financial.payments.filter(item => getMonthKey(item.date) === monthKey);
}

function getFinanceMonthTotals(monthKey=getFinanceMonthKey()) {
  const totals = Object.fromEntries(paymentMethods.map(method => [method, 0]));
  getPaymentsForFinanceMonth(monthKey).forEach(item => {
    const method = paymentMethods.includes(item.method) ? item.method : 'Pix';
    totals[method] += Number(item.received) || 0;
  });
  return totals;
}

function renderFinanceiro() {
  if (!els.financeSummaryGrid) return;
  ensureFinancialState();
  renderFinanceSummary();
  renderFinanceTable();
  renderFinanceMonthlyReport();
  renderInstallments();
  updatePaymentStatusPreview();
  const dateInput = document.getElementById('paymentDate');
  if (dateInput && !dateInput.value) dateInput.value = state.selectedDate;
}

function getFinanceSummaryData() {
  const monthKey = getFinanceMonthKey();
  const monthPayments = getPaymentsForFinanceMonth(monthKey);
  const totalReceived = monthPayments.reduce((sum, item) => sum + (Number(item.received) || 0), 0);
  const byMethod = getFinanceMonthTotals(monthKey);
  const pending = monthPayments.reduce((sum, item) => {
    const open = Math.max((Number(item.total) || 0) - (Number(item.received) || 0), 0);
    return sum + open;
  }, 0);
  return [
    {label:'Recebido no mês', value: totalReceived, meta: getMonthLabel(monthKey), method:'total'},
    {label:'Pix', value: byMethod['Pix'], meta:'Total do mês', method:'Pix'},
    {label:'Espécie', value: byMethod['Espécie'], meta:'Dinheiro recebido', method:'Espécie'},
    {label:'Crédito', value: byMethod['Crédito'], meta:'Cartão no mês', method:'Crédito'},
    {label:'Débito', value: byMethod['Débito'], meta:'Cartão no mês', method:'Débito'},
    {label:'Pendente', value: pending, meta:'Saldo em aberto', method:'pending'}
  ];
}

function renderFinanceSummary() {
  const cards = getFinanceSummaryData();
  els.financeSummaryGrid.innerHTML = cards.map(card => `
    <div class="finance-summary-card method-${escapeHtml(financeMethodClass(card.method))}" style="--method-color:${escapeHtml(financeMethodPalette[card.method] || '#1a73e8')}">
      <span class="finance-summary-label">${escapeHtml(card.label)}</span>
      <strong class="finance-summary-value">${escapeHtml(formatMoney(card.value))}</strong>
      <span class="finance-summary-meta">${escapeHtml(card.meta)}</span>
    </div>`).join('');
}

function getFilteredPayments() {
  const active = state.financial.activeFilter || 'all';
  const monthKey = getFinanceMonthKey();
  const all = getPaymentsForFinanceMonth(monthKey).sort((a,b) => (b.date + b.patient).localeCompare(a.date + a.patient));
  if (active === 'all') return all;
  return all.filter(item => item.status === active);
}

function renderFinanceTable() {
  if (!els.financeTableBody) return;
  const rows = getFilteredPayments();
  const monthLabel = getMonthLabel(getFinanceMonthKey());
  els.financeTableBody.innerHTML = rows.length ? rows.map(item => `
    <tr>
      <td data-label="Data">${escapeHtml(formatDateBR(item.date))}</td>
      <td data-label="Paciente">${escapeHtml(item.patient)}</td>
      <td data-label="Serviço">${escapeHtml(item.service)}</td>
      <td data-label="Forma"><span class="method-pill method-${escapeHtml(financeMethodClass(item.method))}">${escapeHtml(item.method)}</span></td>
      <td data-label="Status"><span class="finance-status-badge ${financeStatusClass(item.status)}">${escapeHtml(item.status)}</span></td>
      <td data-label="Valor">${escapeHtml(formatMoney(item.received || item.total))}</td>
    </tr>`).join('') : `<tr><td colspan="6">Nenhum lançamento em ${escapeHtml(monthLabel)}.</td></tr>`;
  document.querySelectorAll('#financeFilters .filter-pill').forEach(btn => btn.classList.toggle('active', btn.dataset.filter === (state.financial.activeFilter || 'all')));
}

function renderFinanceMonthlyReport() {
  if (!els.financeMonthlyReport) return;
  const monthKey = getFinanceMonthKey();
  const totals = getFinanceMonthTotals(monthKey);
  const totalGeral = Object.values(totals).reduce((sum, value) => sum + (Number(value) || 0), 0);
  const rows = paymentMethods.map(method => {
    const value = Number(totals[method] || 0);
    const percentage = totalGeral ? Math.round((value / totalGeral) * 100) : 0;
    return `<div class="report-row method-${escapeHtml(financeMethodClass(method))}" style="--method-color:${escapeHtml(financeMethodPalette[method])};--bar-width:${percentage}%">
      <div class="report-method"><span class="method-dot"></span><span>${escapeHtml(method)}</span></div>
      <div class="report-value"><strong>${escapeHtml(formatMoney(value))}</strong><small>${percentage}%</small></div>
      <div class="report-bar"><span></span></div>
    </div>`;
  }).join('');
  els.financeMonthlyReport.innerHTML = `
    <div class="finance-chart-card">
      <div class="finance-total-month"><span>Total do mês</span><strong>${escapeHtml(formatMoney(totalGeral))}</strong></div>
      <div class="finance-donut" style="--pix:${totalGeral ? (totals['Pix']/totalGeral*100).toFixed(2) : 0}%;--especie:${totalGeral ? (totals['Espécie']/totalGeral*100).toFixed(2) : 0}%;--credito:${totalGeral ? (totals['Crédito']/totalGeral*100).toFixed(2) : 0}%"><span>${escapeHtml(formatMoney(totalGeral))}</span></div>
    </div>
    <div class="report-list">${rows}<div class="report-row total-row"><span>Total geral</span><strong>${escapeHtml(formatMoney(totalGeral))}</strong></div></div>`;
  const monthLabel = document.getElementById('financeMonthLabel');
  if (monthLabel) monthLabel.textContent = getMonthLabel(monthKey);
}

function renderInstallments() {
  if (!els.installmentsList) return;
  const items = state.financial.installments || [];
  els.installmentsList.innerHTML = items.length ? `<div class="installment-list">${items.map(item => {
    const balance = (item.parts || []).filter(part => part.status !== 'Pago').reduce((sum, part) => sum + (Number(part.total) || 0), 0);
    return `<div class="installment-card"><div class="installment-top"><div><strong>${escapeHtml(item.patient)}</strong><div class="installment-balance">Saldo em aberto: ${escapeHtml(formatMoney(balance))}</div></div><strong>${escapeHtml(formatMoney(item.total))}</strong></div><div class="installment-parts">${(item.parts || []).map(part => `<div class="installment-part"><span>Parcela ${part.number}/${item.parts.length}</span><span>${escapeHtml(formatMoney(part.total))} · ${escapeHtml(part.status)}</span></div>`).join('')}</div></div>`;
  }).join('')}</div>` : '<div class="empty-state">Nenhum parcelamento cadastrado.</div>';
}

function updatePaymentStatusPreview() {
  const total = Number(document.getElementById('paymentTotal')?.value || 0);
  const received = Number(document.getElementById('paymentReceived')?.value || 0);
  const preview = document.getElementById('paymentStatusPreview');
  if (!preview) return;
  preview.innerHTML = `Status previsto: <strong>${escapeHtml(normalizeFinancialStatus(total, received))}</strong>`;
}

function savePayment(e) {
  e.preventDefault();
  const form = document.getElementById('paymentForm');
  const fd = new FormData(form);
  const patient = String(fd.get('patient') || '').trim();
  const total = Number(fd.get('total') || 0);
  const received = Number(fd.get('received') || 0);
  if (!patient) { alert('Informe o nome do paciente.'); return; }
  if (!total) { alert('Informe o valor total.'); return; }
  const item = {
    id: uid(),
    patient,
    service: String(fd.get('service') || 'Sessão'),
    total,
    received,
    method: String(fd.get('method') || 'Pix'),
    date: String(fd.get('date') || state.selectedDate),
    status: normalizeFinancialStatus(total, received)
  };
  state.financial.payments.unshift(item);
  state.financial.selectedMonth = getMonthKey(item.date);
  saveState();
  form.reset();
  const dateInput = document.getElementById('paymentDate');
  if (dateInput) dateInput.value = state.selectedDate;
  updatePaymentStatusPreview();
  renderFinanceiro();
  alert('Pagamento salvo com sucesso.');
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


function toggleMobileMenu(force) {
  const open = typeof force === 'boolean' ? force : !document.body.classList.contains('mobile-menu-open');
  document.body.classList.toggle('mobile-menu-open', open);
}

function closeMobileMenu() {
  toggleMobileMenu(false);
}

function toggleSettingsPanel(force) {
  const panel = document.getElementById('settingsPanel');
  if (!panel) return;
  const open = typeof force === 'boolean' ? force : !panel.classList.contains('show');
  panel.classList.toggle('show', open);
  panel.setAttribute('aria-hidden', open ? 'false' : 'true');
}

function downloadLocalData() {
  const payload = {
    app: 'Maurício.Sis',
    storageKey: STORAGE_KEY,
    exportedAt: new Date().toISOString(),
    state
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], {type: 'application/json'});
  const a = document.createElement('a');
  const today = new Date().toISOString().slice(0,10);
  a.href = URL.createObjectURL(blob);
  a.download = `mauricio-sis-dados-${today}.json`;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(a.href);
  a.remove();
}

function importLocalData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      const importedState = data.state || data;
      if (!importedState || !Array.isArray(importedState.patients) || !Array.isArray(importedState.appointments)) {
        alert('Arquivo inválido. Envie um backup JSON gerado pelo sistema.');
        return;
      }
      if (!confirm('Enviar estes dados vai substituir os dados salvos neste navegador. Deseja continuar?')) return;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(importedState));
      alert('Dados enviados com sucesso. O sistema será recarregado.');
      location.reload();
    } catch (err) {
      alert('Não foi possível ler o arquivo. Verifique se ele é um JSON válido.');
    }
  };
  reader.readAsText(file);
}

function clearLocalData() {
  if (!confirm('Tem certeza que deseja apagar todos os dados salvos neste navegador?')) return;
  if (!confirm('Essa ação não pode ser desfeita sem um backup. Confirmar exclusão?')) return;
  localStorage.removeItem(STORAGE_KEY);
  alert('Dados apagados. O sistema será recarregado com os dados iniciais.');
  location.reload();
}

// Global interactions

document.querySelectorAll('.nav-item').forEach(btn => btn.onclick = () => { setView(btn.dataset.view); closeMobileMenu(); });
document.getElementById('menuToggle')?.addEventListener('click', () => toggleMobileMenu());
document.getElementById('sidebarBackdrop')?.addEventListener('click', closeMobileMenu);
document.getElementById('settingsBtn')?.addEventListener('click', e => { e.stopPropagation(); toggleSettingsPanel(); });
document.getElementById('closeSettingsBtn')?.addEventListener('click', () => toggleSettingsPanel(false));
document.getElementById('downloadDataBtn')?.addEventListener('click', downloadLocalData);
document.getElementById('importDataBtn')?.addEventListener('click', () => document.getElementById('importDataInput').click());
document.getElementById('importDataInput')?.addEventListener('change', e => { importLocalData(e.target.files[0]); e.target.value = ''; });
document.getElementById('clearDataBtn')?.addEventListener('click', clearLocalData);
document.getElementById('fitPatientBtn').onclick = () => openAppointmentModal({date: state.selectedDate});
document.getElementById('customTimeAddBtn')?.addEventListener('click', openCustomTimeAppointment);
document.getElementById('customTimeInput')?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); openCustomTimeAppointment(); } });
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
document.getElementById('goTodayBtn').onclick = () => { state.selectedDate = '2026-06-21'; state.calendarDate = '2026-06-21'; saveState(); renderAgenda(); };
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

document.getElementById('newPaymentBtn')?.addEventListener('click', () => {
  setView('financeiro');
  document.getElementById('paymentPatient')?.focus();
});
document.getElementById('paymentForm')?.addEventListener('submit', savePayment);
document.getElementById('paymentTotal')?.addEventListener('input', updatePaymentStatusPreview);
document.getElementById('paymentReceived')?.addEventListener('input', updatePaymentStatusPreview);
document.getElementById('prevFinanceMonthBtn')?.addEventListener('click', () => shiftFinanceMonth(-1));
document.getElementById('nextFinanceMonthBtn')?.addEventListener('click', () => shiftFinanceMonth(1));
document.getElementById('currentFinanceMonthBtn')?.addEventListener('click', setCurrentFinanceMonth);
document.querySelectorAll('#financeFilters .filter-pill').forEach(btn => btn.addEventListener('click', () => {
  state.financial.activeFilter = btn.dataset.filter;
  saveState();
  renderFinanceTable();
}));

document.addEventListener('click', e => {
  if (!e.target.closest('.status-btn') && !e.target.closest('#statusMenu')) document.getElementById('statusMenu').classList.remove('show');
  if (!e.target.closest('#settingsPanel') && !e.target.closest('#settingsBtn')) toggleSettingsPanel(false);
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
renderAppointmentTypeOptions();
setupAppointmentAutoNumberListeners();
renderPatients();
renderAgenda();
renderFinanceiro();
setView('agenda');
