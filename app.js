const STORAGE_KEY = 'desi-zaika-tasks-v1';
let tasks = loadTasks();
let currentFilter = 'all';

const $ = (selector) => document.querySelector(selector);
const taskForm = $('#task-form');
const taskInput = $('#task-input');
const taskList = $('#task-list');
const emptyState = $('#empty-state');

function loadTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}
function saveTasks() { localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)); }
function escapeHtml(value) { return value.replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#039;', '"': '&quot;' }[char])); }
function formatDate(timestamp) { return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(timestamp); }
function visibleTasks() {
  if (currentFilter === 'active') return tasks.filter(task => !task.completed);
  if (currentFilter === 'completed') return tasks.filter(task => task.completed);
  return tasks;
}
function render() {
  const visible = visibleTasks();
  taskList.innerHTML = visible.map(task => `
    <article class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
      <button class="check" type="button" aria-label="Mark ${escapeHtml(task.title)} as ${task.completed ? 'active' : 'completed'}"></button>
      <span class="task-title">${escapeHtml(task.title)}</span>
      <time class="task-date" datetime="${new Date(task.createdAt).toISOString()}">${formatDate(task.createdAt)}</time>
      <div class="task-actions"><button class="icon-button edit" type="button" aria-label="Edit task">✎</button><button class="icon-button delete" type="button" aria-label="Delete task">×</button></div>
    </article>`).join('');
  taskList.classList.toggle('hidden', visible.length === 0);
  emptyState.classList.toggle('hidden', visible.length !== 0);
  if (!tasks.length) { $('#empty-title').textContent = 'Your list is clear'; $('#empty-message').textContent = 'Add a task above and turn plans into progress.'; }
  else if (!visible.length) { $('#empty-title').textContent = currentFilter === 'completed' ? 'Nothing completed yet' : 'You are all caught up'; $('#empty-message').textContent = 'Try another filter or add a new task.'; }
  const completed = tasks.filter(task => task.completed).length;
  const active = tasks.length - completed;
  $('#total-count').textContent = tasks.length;
  $('#all-filter-count').textContent = tasks.length;
  $('#active-count').textContent = active;
  $('#done-count').textContent = completed;
  const percent = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;
  $('#progress-value').textContent = `${percent}%`;
  $('#progress-bar').style.width = `${percent}%`;
  document.querySelectorAll('.filter').forEach(button => { const activeFilter = button.dataset.filter === currentFilter; button.classList.toggle('active', activeFilter); button.setAttribute('aria-selected', activeFilter); });
}
function addTask(title) { tasks.unshift({ id: crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(), title: title.trim(), completed: false, createdAt: Date.now() }); saveTasks(); render(); }
function updateTask(id, changes) { tasks = tasks.map(task => task.id === id ? { ...task, ...changes } : task); saveTasks(); render(); }

taskForm.addEventListener('submit', (event) => { event.preventDefault(); if (taskInput.value.trim()) { addTask(taskInput.value); taskInput.value = ''; taskInput.focus(); } });
document.querySelectorAll('.filter').forEach(button => button.addEventListener('click', () => { currentFilter = button.dataset.filter; render(); }));
$('#clear-completed').addEventListener('click', () => { if (tasks.some(task => task.completed)) { tasks = tasks.filter(task => !task.completed); saveTasks(); render(); } });
taskList.addEventListener('click', (event) => { const item = event.target.closest('.task-item'); if (!item) return; const id = item.dataset.id; const task = tasks.find(entry => entry.id === id); if (event.target.closest('.check')) updateTask(id, { completed: !task.completed }); if (event.target.closest('.delete')) { tasks = tasks.filter(entry => entry.id !== id); saveTasks(); render(); } if (event.target.closest('.edit')) { const title = window.prompt('Update your task:', task.title); if (title && title.trim()) updateTask(id, { title: title.trim() }); } });
const today = new Date(); $('#day-name').textContent = new Intl.DateTimeFormat(undefined, { weekday: 'long' }).format(today); $('#date-label').textContent = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' }).format(today);
render();
