/* workspace/tracker-app/js/tasks.js */

// Module for managing tasks logic and DOM rendering

let currentTaskFilter = 'all';

/**
 * Render task list based on current filter, update counters, and handle DOM
 */
function renderTasks() {
    const tasks = getTasks();
    const container = document.getElementById('task-list-body');
    const totalEl = document.getElementById('total-tasks');
    const completedEl = document.getElementById('completed-tasks');
    const pendingEl = document.getElementById('pending-tasks');

    if (!container || !totalEl || !completedEl || !pendingEl) return;

    const completedCount = tasks.filter(t => t.completed).length;
    const pendingCount = tasks.length - completedCount;

    totalEl.textContent = `${tasks.length} ခု`;
    completedEl.textContent = `${completedCount} ခု`;
    pendingEl.textContent = `${pendingCount} ခု`;

    // Filter tasks
    let filteredTasks = tasks;
    if (currentTaskFilter === 'pending') {
        filteredTasks = tasks.filter(t => !t.completed);
    } else if (currentTaskFilter === 'completed') {
        filteredTasks = tasks.filter(t => t.completed);
    }

    container.innerHTML = '';

    if (filteredTasks.length === 0) {
        container.innerHTML = `
            <div class="p-6 text-center text-slate-500">
                လုပ်ဆောင်ရန် လုပ်ငန်းစဉ်များ မရှိသေးပါ။
            </div>
        `;
        return;
    }

    filteredTasks.forEach(task => {
        const itemDiv = document.createElement('div');
        itemDiv.className = `p-4 rounded-xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
            task.completed ? 'bg-slate-900/40 border-slate-800 opacity-60' : 'bg-slate-800/80 border-slate-700'
        }`;

        let priorityBadgeClass = 'bg-slate-700 text-slate-300';
        if (task.priority === 'High') priorityBadgeClass = 'bg-rose-500/20 text-rose-400 border border-rose-500/30';
        else if (task.priority === 'Medium') priorityBadgeClass = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
        else if (task.priority === 'Low') priorityBadgeClass = 'bg-blue-500/20 text-blue-400 border border-blue-500/30';

        itemDiv.innerHTML = `
            <div class="flex items-start gap-3 flex-1 min-w-0">
                <input type="checkbox" ${task.completed ? 'checked' : ''} class="mt-1 w-5 h-5 accent-blue-500 rounded cursor-pointer toggle-task-chk" data-id="${escapeHTML(task.id)}">
                <div class="flex-1 min-w-0">
                    <p class="font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'} break-words">
                        ${escapeHTML(task.title)}
                    </p>
                    <div class="flex items-center gap-2 mt-1 text-xs">
                        <span class="px-2 py-0.5 rounded ${priorityBadgeClass}">
                            ${escapeHTML(task.priority || 'Normal')}
                        </span>
                        ${task.dueDate ? `<span class="text-slate-400"><i class="fa-regular font-sans text-xs fa-clock mr-1"></i>${escapeHTML(task.dueDate)}</span>` : ''}
                    </div>
                </div>
            </div>
            <div class="flex items-center gap-2 self-end sm:self-center">
                <button class="text-blue-400 hover:text-blue-300 px-2 py-1 transition edit-task-btn" data-id="${escapeHTML(task.id)}">
                    <i class="fa-solid fa-pen-to-square"></i>
                </button>
                <button class="text-rose-400 hover:text-rose-300 px-2 py-1 transition delete-task-btn" data-id="${escapeHTML(task.id)}">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </div>
        `;

        container.appendChild(itemDiv);
    });

    // Attach event listeners for checkbox, edit, and delete buttons dynamically
    container.querySelectorAll('.toggle-task-chk').forEach(chk => {
        chk.addEventListener('change', () => toggleTask(chk.dataset.id));
    });
    container.querySelectorAll('.edit-task-btn').forEach(btn => {
        btn.addEventListener('click', () => editTask(btn.dataset.id));
    });
    container.querySelectorAll('.delete-task-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteTask(btn.dataset.id));
    });
}

/**
 * Toggle task completed status
 * @param {string} id 
 */
function toggleTask(id) {
    let tasks = getTasks();
    const task = tasks.find(t => String(t.id) === String(id));
    if (task) {
        task.completed = !task.completed;
        saveTasks(tasks);
        renderTasks();
    }
}

/**
 * Populate form for editing a task item
 * @param {string} id 
 */
function editTask(id) {
    const tasks = getTasks();
    const task = tasks.find(t => String(t.id) === String(id));
    if (!task) return;

    document.getElementById('task-id').value = task.id;
    document.getElementById('task-title').value = task.title;
    document.getElementById('task-priority').value = task.priority || 'Medium';
    document.getElementById('task-date').value = task.dueDate || '';

    const submitBtn = document.getElementById('task-submit-btn');
    const cancelBtn = document.getElementById('task-cancel-btn');

    if (submitBtn) submitBtn.textContent = 'ပြင်ဆင်ချက် သိမ်းမည်';
    if (cancelBtn) cancelBtn.classList.remove('hidden');

    document.getElementById('task-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Delete a task item by ID
 * @param {string} id 
 */
function deleteTask(id) {
    if (!confirm('ဤ Task ကို ဖျက်ရန် သေချာပါသလား။')) return;
    let tasks = getTasks();
    tasks = tasks.filter(t => String(t.id) !== String(id));
    saveTasks(tasks);

    const currentEditId = document.getElementById('task-id')?.value;
    if (currentEditId === String(id)) {
        resetTaskForm();
    }

    renderTasks();
}

/**
 * Reset Task form state
 */
function resetTaskForm() {
    const form = document.getElementById('task-form');
    if (form) form.reset();

    const idInput = document.getElementById('task-id');
    if (idInput) idInput.value = '';

    const dateInput = document.getElementById('task-date');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    const submitBtn = document.getElementById('task-submit-btn');
    const cancelBtn = document.getElementById('task-cancel-btn');

    if (submitBtn) submitBtn.textContent = 'ထည့်သွင်းမည်';
    if (cancelBtn) cancelBtn.classList.add('hidden');
}

/**
 * Handle task form submission (Create or Update)
 * @param {Event} event 
 */
function handleTaskSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('task-id').value;
    const title = document.getElementById('task-title').value.trim();
    const priority = document.getElementById('task-priority').value;
    const dueDate = document.getElementById('task-date').value;

    if (!title) return;

    let tasks = getTasks();

    if (id) {
        // Edit existing
        const index = tasks.findIndex(t => String(t.id) === String(id));
        if (index !== -1) {
            tasks[index] = { ...tasks[index], title, priority, dueDate };
        }
    } else {
        // Add new
        const newTask = {
            id: Date.now().toString(),
            title,
            priority,
            dueDate,
            completed: false
        };
        tasks.unshift(newTask);
    }

    saveTasks(tasks);
    resetTaskForm();
    renderTasks();
}

/**
 * Setup event listeners for task module
 */
function setupTaskListeners() {
    const form = document.getElementById('task-form');
    if (form) {
        form.addEventListener('submit', handleTaskSubmit);
    }

    const cancelBtn = document.getElementById('task-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', resetTaskForm);
    }

    const filterSelect = document.getElementById('task-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', (e) => {
            currentTaskFilter = e.target.value;
            renderTasks();
        });
    }
}
