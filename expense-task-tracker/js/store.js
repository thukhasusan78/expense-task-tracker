/* workspace/tracker-app/js/store.js */

// Store helper module for localStorage management and string escaping

const STORAGE_KEYS = {
    EXPENSES: 'expenses',
    TASKS: 'tasks'
};

/**
 * HTML Escape utility function to prevent XSS / layout break when typing < > & etc.
 * @param {string} str 
 * @returns {string}
 */
function escapeHTML(str) {
    if (str === null || str === undefined) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/**
 * Retrieve expenses array from localStorage
 * @returns {Array}
 */
function getExpenses() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading expenses from localStorage:', e);
        return [];
    }
}

/**
 * Save expenses array to localStorage
 * @param {Array} expenses 
 */
function saveExpenses(expenses) {
    try {
        localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
        console.error('Error saving expenses to localStorage:', e);
    }
}

/**
 * Retrieve tasks array from localStorage
 * @returns {Array}
 */
function getTasks() {
    try {
        const data = localStorage.getItem(STORAGE_KEYS.TASKS);
        return data ? JSON.parse(data) : [];
    } catch (e) {
        console.error('Error reading tasks from localStorage:', e);
        return [];
    }
}

/**
 * Save tasks array to localStorage
 * @param {Array} tasks 
 */
function saveTasks(tasks) {
    try {
        localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
    } catch (e) {
        console.error('Error saving tasks to localStorage:', e);
    }
}
