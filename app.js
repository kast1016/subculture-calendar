import { supabase } from './supabaseClient.js';

const fetchIntervalMs = 3600000;

const currentMonthLabel = document.getElementById('currentMonthLabel');
const syncStatus = document.getElementById('syncStatus');
const calendarGrid = document.getElementById('calendarGrid');
const eventList = document.getElementById('eventList');
const monthEventCount = document.getElementById('monthEventCount');
const selectedDayLabel = document.getElementById('selectedDayLabel');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const todayBtn = document.getElementById('todayBtn');
const topAddEventBtn = document.getElementById('topAddEventBtn');
const yearSelect = document.getElementById('yearSelect');
const monthSelect = document.getElementById('monthSelect');
const fabAddEventBtn = document.getElementById('fabAddEventBtn');
const mobileTabbar = document.getElementById('mobileTabbar');
const tabCalendarBtn = document.getElementById('tabCalendarBtn');
const tabEventsBtn = document.getElementById('tabEventsBtn');
const modalBackdrop = document.getElementById('modalBackdrop');
const closeModalBtn = document.getElementById('closeModalBtn');
const eventForm = document.getElementById('eventForm');
const modalTitle = document.getElementById('modalTitle');
const deleteEventBtn = document.getElementById('deleteEventBtn');
const cancelModalBtn = document.getElementById('cancelModalBtn');
const eventTitle = document.getElementById('eventTitle');
const eventStart = document.getElementById('eventStart');
const eventEnd = document.getElementById('eventEnd');
const eventLocation = document.getElementById('eventLocation');
const eventCategory = document.getElementById('eventCategory');
const eventUrl = document.getElementById('eventUrl');
const eventNotes = document.getElementById('eventNotes');


const USER_EVENTS_KEY = 'subcultureCalendarEvents';
const LOCAL_EVENTS_FILE = 'events.json';

let userEvents = [];
let publicEvents = [];
let events = [];
let viewDate = new Date();
let selectedDate = null;
let selectedEventId = null;
let expandedEventId = null;
let editingEventId = null;
let mobileView = 'calendar';

function normalizeDate(value) {
  return value ? value.slice(0, 10) : '';
}

function parseDateString(dateString) {
  if (!dateString) return null;
  const [year, month, day] = String(dateString).split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatMonthLabel(date) {
  return `${date.getFullYear()}년 ${date.getMonth() + 1}월`;
}

function buildEventPayload(data) {
  const startDate = normalizeDate(data.startDate);
  const endDate = normalizeDate(data.endDate || data.startDate);
  return {
    title: data.title.trim(),
    startDate,
    endDate,
    location: data.location.trim(),
    category: data.category.trim(),
    url: data.url.trim(),
    notes: data.notes.trim(),
    updatedAt: new Date().toISOString(),
  };
}

function isValidExternalUrl(value) {
  const url = String(value || '').trim();
  if (!url) return false;
  if (!/^https?:\/\//i.test(url)) return false;

  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname === 'example.com' || hostname.endsWith('.example.com')) return false;
    if (hostname.includes('example.')) return false;
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1') return false;
    return true;
  } catch {
    return false;
  }
}

function getCategoryClass(category) {
  const value = String(category || '').toLowerCase();
  if (value.includes('코믹월드')) return 'category-comicworld';
  if (value.includes('일러스트')) return 'category-illust';
  if (value.includes('플레이엑스포') || value.includes('게임전시회')) return 'category-game';
  if (value.includes('종합컨벤션') || value.includes('서울팝콘')) return 'category-convention';
  if (value.includes('agf') || value.includes('대형페스티벌')) return 'category-festival';
  return 'category-default';
}

function getDayEvents(date) {
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return events.filter((event) => {
    const start = parseDateString(event.startDate);
    const end = parseDateString(event.endDate);
    if (!start || !end) return false;
    return target >= start && target <= end;
  });
}

function getMonthEvents(year, month) {
  const monthStart = new Date(year, month, 1);
  const monthEnd = new Date(year, month + 1, 0);
  return events.filter((event) => {
    const eventStart = parseDateString(event.startDate);
    const eventEnd = parseDateString(event.endDate);
    if (!eventStart || !eventEnd) return false;
    return eventStart <= monthEnd && eventEnd >= monthStart;
  });
}

function mergeEvents() {
  const officialEvents = publicEvents.map((event) => {
    const normalizedId = event.id
      ? event.id.toString().startsWith('official-')
        ? event.id
        : `official-${event.id}`
      : `official-${event.title}-${event.startDate}`;

    return {
      ...event,
      source: 'official',
      id: normalizedId,
    };
  });

  events = [...userEvents, ...officialEvents].sort((a, b) => {
    const dateA = new Date(a.startDate);
    const dateB = new Date(b.startDate);
    return dateA - dateB || a.title.localeCompare(b.title);
  });
}

function normalizeSupabaseEvent(event) {
  return {
    id: event.id ? `official-${event.id}` : `official-${event.title}-${event.start_date}`,
    title: event.title || '공식 일정',
    startDate: event.start_date || event.startDate || '',
    endDate: event.end_date || event.endDate || event.start_date || '',
    location: event.location || '',
    category: event.category || '공식',
    url: event.url || '',
    notes: event.notes || '',
    source: 'official',
  };
}

async function fetchSupabaseEvents() {
  if (!supabase) {
    syncStatus.textContent = 'Supabase 구성 필요';
    return;
  }

  syncStatus.textContent = 'Supabase 이벤트 로딩 중...';
  const { data, error } = await supabase.from('events').select('*');
  if (error) {
    console.error('Supabase 로드 오류', error);
    syncStatus.textContent = 'Supabase 로드 실패';
    return;
  }

  publicEvents = (data || []).map(normalizeSupabaseEvent);
  mergeEvents();
  render();
  syncStatus.textContent = 'Supabase 이벤트 로드 완료';
}

async function subscribeSupabaseEvents() {
  if (!supabase) return;

  const channel = supabase
    .channel('public:events')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
      fetchSupabaseEvents();
    });

  await channel.subscribe();
}

async function addSupabaseEvent(data) {
  if (!supabase) {
    alert('Supabase가 구성되지 않았습니다. supabaseClient.js에 URL과 Anon Key를 설정하세요.');
    return;
  }

  const eventPayload = buildEventPayload(data);
  const row = {
    id: crypto.randomUUID ? crypto.randomUUID() : `event-${Date.now()}`,
    title: eventPayload.title,
    start_date: eventPayload.startDate,
    end_date: eventPayload.endDate,
    location: eventPayload.location,
    category: eventPayload.category,
    url: eventPayload.url,
    notes: eventPayload.notes,
    source: eventPayload.category || 'supabase',
  };

  const { error } = await supabase.from('events').insert([row]);
  if (error) {
    console.error('Supabase 추가 오류', error);
    alert('행사 추가 중 오류가 발생했습니다. 콘솔을 확인하세요.');
    return;
  }

  await fetchSupabaseEvents();
}

async function updateSupabaseEvent(eventId, data) {
  if (!supabase) return;

  const supabaseId = eventId.replace(/^official-/, '');
  const eventPayload = buildEventPayload(data);
  const row = {
    title: eventPayload.title,
    start_date: eventPayload.startDate,
    end_date: eventPayload.endDate,
    location: eventPayload.location,
    category: eventPayload.category,
    url: eventPayload.url,
    notes: eventPayload.notes,
    source: eventPayload.category || 'supabase',
  };

  const { error } = await supabase.from('events').update(row).eq('id', supabaseId);
  if (error) {
    console.error('Supabase 수정 오류', error);
    alert('행사 수정 중 오류가 발생했습니다. 콘솔을 확인하세요.');
    return;
  }

  await fetchSupabaseEvents();
}

function buildJumpControls() {
  if (!yearSelect || !monthSelect) return;
  const minYear = 2000;
  const maxYear = 2100;
  yearSelect.innerHTML = Array.from({ length: maxYear - minYear + 1 }, (_, i) => {
    const year = minYear + i;
    return `<option value="${year}">${year}년</option>`;
  }).join('');
  monthSelect.innerHTML = Array.from({ length: 12 }, (_, i) => `<option value="${i}">${i + 1}월</option>`).join('');
}

function updateJumpControls() {
  if (!yearSelect || !monthSelect) return;
  if (!yearSelect.options.length) {
    buildJumpControls();
  }
  const currentYear = viewDate.getFullYear();
  const clampedYear = Math.min(Math.max(currentYear, 2000), 2100);
  yearSelect.value = clampedYear;
  monthSelect.value = viewDate.getMonth();
}

function jumpToSelectedMonth() {
  if (!yearSelect || !monthSelect) return;
  const year = Number(yearSelect.value);
  const month = Number(monthSelect.value);
  if (Number.isNaN(year) || Number.isNaN(month)) return;
  viewDate = new Date(year, month, 1);
  selectedDate = null;
  render();
}

function selectDay(date) {
  const clickedDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (selectedDate && selectedDate.getTime() === clickedDate.getTime()) {
    selectedDate = null;
    selectedEventId = null;
  } else {
    selectedDate = clickedDate;
    selectedEventId = null;
    if (isMobileLayout()) {
      mobileView = 'events';
    }
  }
  render();
}

function renderCalendar() {
  calendarGrid.innerHTML = '';
  const weekDays = ['일', '월', '화', '수', '목', '금', '토'];
  weekDays.forEach((name) => {
    const label = document.createElement('div');
    label.textContent = name;
    label.className = 'day-name';
    calendarGrid.appendChild(label);
  });

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevDays = new Date(year, month, 0).getDate();

  const totalCells = 42;
  const today = new Date();
  const selectedTime = selectedDate ? selectedDate.getTime() : null;

  for (let i = 0; i < totalCells; i += 1) {
    const cell = document.createElement('div');
    cell.className = 'day-cell';

    let cellDay;
    let cellDate;
    if (i < firstDay) {
      cellDay = prevDays - (firstDay - 1 - i);
      cell.classList.add('inactive');
      cellDate = new Date(year, month - 1, cellDay);
    } else if (i >= firstDay + daysInMonth) {
      cellDay = i - firstDay - daysInMonth + 1;
      cell.classList.add('inactive');
      cellDate = new Date(year, month + 1, cellDay);
    } else {
      cellDay = i - firstDay + 1;
      cellDate = new Date(year, month, cellDay);
    }

    const number = document.createElement('div');
    number.className = 'day-number';
    number.textContent = cellDay;
    cell.appendChild(number);

    const dayEvents = getDayEvents(cellDate);
    if (dayEvents.length > 0) {
      const indicatorWrapper = document.createElement('div');
      indicatorWrapper.className = 'day-indicators';
      const hasOfficial = dayEvents.some((event) => event.source === 'official');
      const hasUser = dayEvents.some((event) => event.source !== 'official');

      if (hasOfficial) {
        const dot = document.createElement('div');
        dot.className = 'day-indicator official';
        dot.setAttribute('aria-label', '공식 일정 있음');
        indicatorWrapper.appendChild(dot);
      }
      if (hasUser) {
        const dot = document.createElement('div');
        dot.className = 'day-indicator user';
        dot.setAttribute('aria-label', '개인 일정 있음');
        indicatorWrapper.appendChild(dot);
      }
      cell.appendChild(indicatorWrapper);
    }

    if (cellDate.toDateString() === today.toDateString()) {
      cell.classList.add('today');
    }

    if (selectedTime && cellDate.getTime() === selectedTime) {
      cell.classList.add('selected');
    }

    cell.addEventListener('click', () => {
      selectDay(cellDate);
    });

    cell.addEventListener('dblclick', () => {
      const dayEvents = getDayEvents(cellDate);
      const firstUrl = dayEvents.find((event) => isValidExternalUrl(event.url));
      if (firstUrl) {
        window.open(firstUrl.url, '_blank');
      }
    });

    calendarGrid.appendChild(cell);
  }

  currentMonthLabel.textContent = formatMonthLabel(viewDate);
}

function renderEventList() {
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const monthEvents = getMonthEvents(year, month).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  const selectedText = selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : '전체';
  selectedDayLabel.textContent = selectedEventId ? '선택된 행사 상세보기' : `선택된 날짜: ${selectedText}`;

  let visibleEvents = [];
  if (selectedEventId) {
    const selectedEvent = events.find((event) => event.id === selectedEventId);
    visibleEvents = selectedEvent ? [selectedEvent] : [];
  } else if (selectedDate) {
    visibleEvents = getDayEvents(selectedDate).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  } else {
    visibleEvents = monthEvents;
  }

  monthEventCount.textContent = visibleEvents.length;
  eventList.innerHTML = '';
  if (visibleEvents.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'event-card';
    empty.innerHTML = `<p>${selectedEventId ? '선택된 행사가 없습니다.' : selectedDate ? '선택된 날짜의 행사가 없습니다.' : '이 달에는 등록된 행사가 없습니다.'}</p>`;
    eventList.appendChild(empty);
    return;
  }

  visibleEvents.forEach((event) => {
    const isExpanded = expandedEventId === event.id;
    const card = document.createElement('div');
    card.className = `event-card${event.source === 'official' ? ' official' : ''}${isExpanded ? ' expanded' : ''}`;

    const start = event.startDate;
    const end = event.endDate;
    const dateLabel = start === end ? start : `${start} ~ ${end}`;

    card.innerHTML = `
      <div class="event-card-main">
        <div class="event-card-title-group">
          ${event.source === 'official' ? '<span class="event-badge">공식</span>' : ''}
          <div class="event-card-title" title="${event.title}">${event.title}</div>
          <div class="event-card-date" title="${dateLabel}">${dateLabel}</div>
        </div>
      </div>
      <div class="event-card-details">
        ${event.location ? `<div class="event-detail-row"><strong>장소</strong><span>${event.location}</span></div>` : ''}
        ${event.notes ? `<div class="event-detail-row"><strong>설명</strong><span>${event.notes}</span></div>` : ''}
        ${isValidExternalUrl(event.url) ? `<a class="event-link-button" href="${event.url}" target="_blank" rel="noopener">홈페이지</a>` : ''}
      </div>
    `;

    card.addEventListener('click', () => {
      expandedEventId = isExpanded ? null : event.id;
      renderEventList();
    });

    const linkButton = card.querySelector('.event-link-button');
    if (linkButton) {
      linkButton.addEventListener('click', (event) => {
        event.stopPropagation();
      });
    }

    if (event.source === 'user') {
      const actionBar = document.createElement('div');
      actionBar.className = 'event-card-actions';

      const editButton = document.createElement('button');
      editButton.type = 'button';
      editButton.className = 'secondary';
      editButton.textContent = '수정';
      editButton.addEventListener('click', (e) => {
        e.stopPropagation();
        openModal('edit', null, event.id);
      });

      const deleteButton = document.createElement('button');
      deleteButton.type = 'button';
      deleteButton.className = 'danger';
      deleteButton.textContent = '삭제';
      deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        if (confirm('이 행사를 삭제하시겠습니까?')) {
          deleteUserEvent(event.id);
          if (editingEventId === event.id) closeModal();
        }
      });

      actionBar.appendChild(editButton);
      actionBar.appendChild(deleteButton);
      card.appendChild(actionBar);
    }

    eventList.appendChild(card);
  });
}

function isMobileLayout() {
  return window.matchMedia('(max-width: 820px), (orientation: portrait) and (max-height: 1200px)').matches;
}

function updateMobileViewUI() {
  if (!mobileTabbar) return;
  const calendarPanel = document.querySelector('.calendar-panel');
  const eventPanel = document.querySelector('.event-panel');
  if (!calendarPanel || !eventPanel) return;

  if (isMobileLayout()) {
    mobileTabbar.classList.remove('hidden');
    calendarPanel.classList.toggle('hidden', mobileView === 'events');
    const showSheet = mobileView === 'events' || selectedDate;
    eventPanel.classList.toggle('hidden', !showSheet);
    eventPanel.classList.toggle('sheet-open', showSheet);
    tabCalendarBtn.classList.toggle('active', mobileView === 'calendar');
    tabCalendarBtn.setAttribute('aria-selected', String(mobileView === 'calendar'));
    tabEventsBtn.classList.toggle('active', mobileView === 'events');
    tabEventsBtn.setAttribute('aria-selected', String(mobileView === 'events'));
  } else {
    mobileTabbar.classList.add('hidden');
    calendarPanel.classList.remove('hidden');
    eventPanel.classList.remove('hidden');
    eventPanel.classList.remove('sheet-open');
  }
}

function render() {
  renderCalendar();
  renderEventList();
  updateJumpControls();
  updateMobileViewUI();
}

function openModal(mode, date = null, eventId = null) {
  modalBackdrop.classList.remove('hidden');
  deleteEventBtn.classList.toggle('hidden', mode !== 'edit');
  modalTitle.textContent = mode === 'edit' ? '행사 수정' : '행사 추가';
  editingEventId = mode === 'edit' ? eventId : null;

  if (mode === 'edit') {
    const event = events.find((item) => item.id === eventId && item.source === 'user');
    if (event) {
      eventTitle.value = event.title;
      eventStart.value = event.startDate;
      eventEnd.value = event.endDate;
      eventLocation.value = event.location;
      eventCategory.value = event.category;
      eventUrl.value = event.url;
      eventNotes.value = event.notes;
    }
  } else {
    eventTitle.value = '';
    eventStart.value = date ? date.toISOString().slice(0, 10) : '';
    eventEnd.value = date ? date.toISOString().slice(0, 10) : '';
    eventLocation.value = '';
    eventCategory.value = '';
    eventUrl.value = '';
    eventNotes.value = '';
  }
}

function closeModal() {
  modalBackdrop.classList.add('hidden');
}

function generateId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `evt-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

function loadUserEvents() {
  const stored = localStorage.getItem(USER_EVENTS_KEY);
  if (!stored) {
    userEvents = [];
    return;
  }

  try {
    userEvents = JSON.parse(stored).map((event) => ({ ...event, source: 'user' }));
  } catch (error) {
    console.warn('저장된 일정 로드 실패', error);
    userEvents = [];
  }
}

function saveUserEvents() {
  localStorage.setItem(USER_EVENTS_KEY, JSON.stringify(userEvents));
}

function addUserEvent(data) {
  const newEvent = {
    id: generateId(),
    source: 'user',
    ...buildEventPayload(data),
  };
  userEvents.push(newEvent);
  saveUserEvents();
  mergeEvents();
  render();
}

function updateUserEvent(eventId, data) {
  const index = userEvents.findIndex((event) => event.id === eventId);
  if (index === -1) return;
  userEvents[index] = {
    ...userEvents[index],
    ...buildEventPayload(data),
  };
  saveUserEvents();
  mergeEvents();
  render();
}

function deleteUserEvent(eventId) {
  userEvents = userEvents.filter((event) => event.id !== eventId);
  saveUserEvents();
  mergeEvents();
  render();
}

async function loadEventsFile() {
  if (window.electronAPI?.readJsonFile) {
    return window.electronAPI.readJsonFile(LOCAL_EVENTS_FILE);
  }

  const localUrl = new URL(LOCAL_EVENTS_FILE, location.href).href;
  const response = await fetch(localUrl, { cache: 'no-store' });
  if (!response.ok) throw new Error(`로컬 일정 파일 로드 실패 (${response.status})`);
  return response.json();
}

async function fetchLocalEvents() {
  syncStatus.textContent = '로컬 이벤트 로딩 중...';
  try {
    const data = await loadEventsFile();
    if (!Array.isArray(data)) throw new Error('로컬 일정 형식 오류');

    publicEvents = data.map((event) => {
      const startDate = event.startDate || event.date;
      const endDate = event.endDate || event.date;
      const normalizedId = event.id
        ? event.id.toString().startsWith('official-')
          ? event.id
          : `official-${event.id}`
        : `official-${event.title}-${startDate}`;
      return {
        id: normalizedId,
        title: event.title || '공식 일정',
        startDate,
        endDate,
        location: event.location || '',
        category: event.category || event.type || '공식',
        url: event.url || '',
        notes: event.notes || event.description || `원출처: ${event.source || 'JSON'}`,
      };
    }).sort((a, b) => {
      const dateA = new Date(a.startDate);
      const dateB = new Date(b.startDate);
      return dateA - dateB || a.title.localeCompare(b.title);
    });

    mergeEvents();

    if (events.length > 0) {
      const monthEvents = getMonthEvents(viewDate.getFullYear(), viewDate.getMonth());
      const monthStart = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1);
      const monthEnd = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0);
      const officialMonthEvents = publicEvents.filter((event) => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        return eventStart <= monthEnd && eventEnd >= monthStart;
      });

      if (officialMonthEvents.length === 0) {
        const firstOfficialEvent = publicEvents[0];
        if (firstOfficialEvent) {
          const firstEventMonth = new Date(firstOfficialEvent.startDate);
          viewDate = new Date(firstEventMonth.getFullYear(), firstEventMonth.getMonth(), 1);
        }
      } else if (monthEvents.length === 0) {
        const firstEventMonth = new Date(events[0].startDate);
        viewDate = new Date(firstEventMonth.getFullYear(), firstEventMonth.getMonth(), 1);
      }
    }
    render();
    syncStatus.textContent = `로컬 이벤트 로드 완료`;
  } catch (error) {
    console.error('로컬 이벤트 로드 실패', error);
    if (window.electronAPI) {
      syncStatus.textContent = '데스크톱 앱 로드 완료, events.json 파일을 읽는 중 오류가 발생했습니다.';
    } else if (location.protocol === 'file:') {
      syncStatus.textContent = '로컬 파일 로드 실패: 브라우저 보안으로 인해 file:// 경로에서 events.json을 불러올 수 없습니다. npm start로 실행하세요.';
    } else {
      syncStatus.textContent = `이벤트 로드 실패: ${error.message}`;
    }
  }
}

function bindEvents() {
  prevMonthBtn.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() - 1);
    render();
  });

  nextMonthBtn.addEventListener('click', () => {
    viewDate.setMonth(viewDate.getMonth() + 1);
    render();
  });

  if (todayBtn) {
    todayBtn.addEventListener('click', () => {
      viewDate = new Date();
      selectedDate = null;
      render();
    });
  }

  if (topAddEventBtn) {
    topAddEventBtn.addEventListener('click', () => {
      openModal('add', selectedDate || new Date());
    });
  }

  if (fabAddEventBtn) {
    fabAddEventBtn.addEventListener('click', () => {
      openModal('add', selectedDate || new Date());
    });
  }

  if (tabCalendarBtn && tabEventsBtn) {
    tabCalendarBtn.addEventListener('click', () => {
      mobileView = 'calendar';
      updateMobileViewUI();
    });
    tabEventsBtn.addEventListener('click', () => {
      mobileView = 'events';
      updateMobileViewUI();
    });
  }

  if (yearSelect) {
    yearSelect.addEventListener('change', jumpToSelectedMonth);
  }

  if (monthSelect) {
    monthSelect.addEventListener('change', jumpToSelectedMonth);
  }

  closeModalBtn.addEventListener('click', closeModal);
  if (cancelModalBtn) {
    cancelModalBtn.addEventListener('click', closeModal);
  }
  window.addEventListener('resize', updateMobileViewUI);
  modalBackdrop.addEventListener('click', (event) => {
    if (event.target === modalBackdrop) closeModal();
  });

  eventForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const startDateValue = eventStart.value || new Date().toISOString().slice(0, 10);
    const endDateValue = eventEnd.value || startDateValue;
    const normalizedStart = normalizeDate(startDateValue);
    let normalizedEnd = normalizeDate(endDateValue) || normalizedStart;

    if (normalizedStart && normalizedEnd) {
      if (new Date(normalizedEnd) < new Date(normalizedStart)) {
        normalizedEnd = normalizedStart;
      }
    }

    const formData = {
      title: eventTitle.value.trim(),
      startDate: normalizedStart,
      endDate: normalizedEnd,
      location: eventLocation.value,
      category: eventCategory.value,
      url: eventUrl.value,
      notes: eventNotes.value,
    };

    if (!formData.title) {
      alert('행사명은 반드시 입력해야 합니다.');
      eventTitle.focus();
      return;
    }

    if (!formData.startDate) {
      alert('시작일을 올바르게 입력해주세요.');
      eventStart.focus();
      return;
    }

    if (editingEventId) {
      updateUserEvent(editingEventId, formData);
    } else {
      addUserEvent(formData);
    }

    closeModal();
  });

  deleteEventBtn.addEventListener('click', () => {
    if (!editingEventId) return;
    if (confirm('이 행사를 삭제하시겠습니까?')) {
      deleteUserEvent(editingEventId);
      closeModal();
    }
  });
}

async function initialize() {
  loadUserEvents();
  bindEvents();
  fetchLocalEvents();
  await fetchSupabaseEvents();
  await subscribeSupabaseEvents();
  render();
  setInterval(fetchLocalEvents, fetchIntervalMs);
}

initialize();

