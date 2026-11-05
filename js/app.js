/* workspace/tracker-app/js/app.js */

// Main application entry point handling tab switching and app initialization

/**
 * Switch active view between Expenses and Tasks
 * @param {'expenses'|'tasks'} tabName 
 */
function switchTab(tabName) {
    const expensesSec = document.getElementById('expenses-section');
    const tasksSec = document.getElementById('tasks-section');
    const expBtn = document.getElementById('tab-expenses-btn');
    const taskBtn = document.getElementById('tab-tasks-btn');

    if (!expensesSec || !tasksSec || !expBtn || !taskBtn) return;

    if (tabName === 'expenses') {
        expensesSec.classList.remove('hidden');
        tasksSec.classList.add('hidden');

        expBtn.className = 'px-4 py-2 rounded-lg font-medium transition text-white bg-blue-600 shadow-md tab-btn';
        taskBtn.className = 'px-4 py-2 rounded-lg font-medium transition text-slate-400 hover:text-white tab-btn';
    } else {
        expensesSec.classList.add('hidden');
        tasksSec.classList.remove('hidden');

        taskBtn.className = 'px-4 py-2 rounded-lg font-medium transition text-white bg-blue-600 shadow-md tab-btn';
        expBtn.className = 'px-4 py-2 rounded-lg font-medium transition text-slate-400 hover:text-white tab-btn';
    }
}

/**
 * Initialize application state and setup listeners
 */
function initApp() {
    // Setup tab button click handlers
    const expBtn = document.getElementById('tab-expenses-btn');
    const taskBtn = document.getElementById('tab-tasks-btn');

    if (expBtn) expBtn.addEventListener('click', () => switchTab('expenses'));
    if (taskBtn) taskBtn.addEventListener('click', () => switchTab('tasks'));

    // Initialize modules
    setupExpenseListeners();
    setupTaskListeners();

    // Default dates to today (local time)
    resetExpenseForm();
    resetTaskForm();

    // Initial renders
    renderExpenses();
    renderTasks();
}

// Run app initialization when DOM content is fully loaded
document.addEventListener('DOMContentLoaded', initApp);
