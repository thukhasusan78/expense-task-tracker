/* workspace/tracker-app/js/expenses.js */

// Module for managing expenses logic and DOM rendering

/**
 * Render expense records, calculate totals, and update DOM
 */
function renderExpenses() {
    let expenses = getExpenses();
    const categoryFilter = document.getElementById('expense-category-filter')?.value || 'All';
    if (categoryFilter !== 'All') {
        expenses = expenses.filter(item => item.category === categoryFilter);
    }
    const tbody = document.getElementById('expense-table-body');
    const totalEl = document.getElementById('total-expense');
    const monthlyEl = document.getElementById('monthly-expense');
    const countEl = document.getElementById('expense-count');

    if (!tbody || !totalEl || !monthlyEl || !countEl) return;

    // Local Date Month/Year calculation
    const now = new Date();
    const currentLocalYear = now.getFullYear();
    const currentLocalMonth = now.getMonth() + 1; // 1 - 12

    let totalAmount = 0;
    let monthlyAmount = 0;

    tbody.innerHTML = '';

    if (expenses.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="5" class="p-6 text-center text-slate-500">
                    မှတ်တမ်း မရှိသေးပါ။ အထက်ပါ Form တွင် စတင်ထည့်သွင်းပါ၊
                </td>
            </tr>
        `;
    } else {
        expenses.forEach((item) => {
            const amountNum = Number(item.amount) || 0;
            totalAmount += amountNum;

            // Check if expense is in current local month and year
            if (item.date) {
                const parts = item.date.split('-');
                if (parts.length >= 2) {
                    const expYear = parseInt(parts[0], 10);
                    const expMonth = parseInt(parts[1], 10);
                    if (expYear === currentLocalYear && expMonth === currentLocalMonth) {
                        monthlyAmount += amountNum;
                    }
                }
            }

            const tr = document.createElement('tr');
            tr.className = 'border-b border-slate-700/50 hover:bg-slate-700/30 transition';

            tr.innerHTML = `
                <td class="p-3 font-medium text-slate-200">${escapeHTML(item.title)}</td>
                <td class="p-3 text-emerald-400 font-semibold">${amountNum.toLocaleString()} MMK</td>
                <td class="p-3">
                    <span class="px-2 py-1 rounded text-xs bg-slate-700 text-slate-300">
                        ${escapeHTML(item.category)}
                    </span>
                </td>
                <td class="p-3 text-slate-400">${escapeHTML(item.date)}</td>
                <td class="p-3 text-right space-x-2">
                    <button class="text-blue-400 hover:text-blue-300 px-2 py-1 transition edit-exp-btn" data-id="${escapeHTML(item.id)}">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button class="text-rose-400 hover:text-rose-300 px-2 py-1 transition delete-exp-btn" data-id="${escapeHTML(item.id)}">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(tr);
        });
    }

    // Update Statistics
    totalEl.textContent = `${totalAmount.toLocaleString()} MMK`;
    monthlyEl.textContent = `${monthlyAmount.toLocaleString()} MMK`;
    countEl.textContent = `${expenses.length} ခု`;

    // Attach event listeners for edit and delete buttons dynamically
    tbody.querySelectorAll('.edit-exp-btn').forEach(btn => {
        btn.addEventListener('click', () => editExpense(btn.dataset.id));
    });
    tbody.querySelectorAll('.delete-exp-btn').forEach(btn => {
        btn.addEventListener('click', () => deleteExpense(btn.dataset.id));
    });
}

/**
 * Populate form for editing an expense item
 * @param {string} id 
 */
function editExpense(id) {
    const expenses = getExpenses();
    const item = expenses.find(e => String(e.id) === String(id));
    if (!item) return;

    document.getElementById('exp-id').value = item.id;
    document.getElementById('exp-title').value = item.title;
    document.getElementById('exp-amount').value = item.amount;
    document.getElementById('exp-category').value = item.category;
    document.getElementById('exp-date').value = item.date;

    const submitBtn = document.getElementById('exp-submit-btn');
    const cancelBtn = document.getElementById('exp-cancel-btn');

    if (submitBtn) submitBtn.textContent = 'ပြင်ဆင်ချက် သိမ်းမည်';
    if (cancelBtn) cancelBtn.classList.remove('hidden');

    // Scroll form into view if needed
    document.getElementById('expense-form')?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Delete an expense item by ID
 * @param {string} id 
 */
function deleteExpense(id) {
    if (!confirm('ဤအသုံးစရိတ် စာရင်းကို ဖျက်ရန် သေချာပါသလား။')) return;
    let expenses = getExpenses();
    expenses = expenses.filter(e => String(e.id) !== String(id));
    saveExpenses(expenses);

    // If deleting currently edited item, reset form
    const currentEditId = document.getElementById('exp-id')?.value;
    if (currentEditId === String(id)) {
        resetExpenseForm();
    }

    renderExpenses();
}

/**
 * Reset Expense form state
 */
function resetExpenseForm() {
    const form = document.getElementById('expense-form');
    if (form) form.reset();

    const idInput = document.getElementById('exp-id');
    if (idInput) idInput.value = '';

    // Reset date to today local date
    const dateInput = document.getElementById('exp-date');
    if (dateInput) {
        const today = new Date();
        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');
        dateInput.value = `${yyyy}-${mm}-${dd}`;
    }

    const submitBtn = document.getElementById('exp-submit-btn');
    const cancelBtn = document.getElementById('exp-cancel-btn');

    if (submitBtn) submitBtn.textContent = 'ထည့်သွင်းမည်';
    if (cancelBtn) cancelBtn.classList.add('hidden');
}

/**
 * Handle expense form submission (Create or Update)
 * @param {Event} event 
 */
function handleExpenseSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('exp-id').value;
    const title = document.getElementById('exp-title').value.trim();
    const amount = parseFloat(document.getElementById('exp-amount').value) || 0;
    const category = document.getElementById('exp-category').value;
    const date = document.getElementById('exp-date').value;

    if (!title || !date) return;

    let expenses = getExpenses();

    if (id) {
        // Edit existing
        const index = expenses.findIndex(e => String(e.id) === String(id));
        if (index !== -1) {
            expenses[index] = { ...expenses[index], title, amount, category, date };
        }
    } else {
        // Add new
        const newExpense = {
            id: Date.now().toString(),
            title,
            amount,
            category,
            date
        };
        expenses.unshift(newExpense);
    }

    saveExpenses(expenses);
    resetExpenseForm();
    renderExpenses();
}

/**
 * Setup event listeners for expense module
 */
function setupExpenseListeners() {
    const form = document.getElementById('expense-form');
    if (form) {
        form.addEventListener('submit', handleExpenseSubmit);
    }

    const cancelBtn = document.getElementById('exp-cancel-btn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', resetExpenseForm);
    }

    const filterSelect = document.getElementById('expense-category-filter');
    if (filterSelect) {
        filterSelect.addEventListener('change', renderExpenses);
    }
}
