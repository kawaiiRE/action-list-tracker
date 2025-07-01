const DELETE_PASSWORD = 'aazad123';
const DEPARTMENTS = ['Projects Dep','Business Development Dep','Finance Dep','Leasing Dep','COO Office','FM Dep','Accounting Dep','IT Department','Property and Asset Mgt. Dep','HR Dep','Accounts Dep','Procurement Dep','Contracts Dep','Marketing Dep','Strategic Dep','Legal Dep'];
const STATUSES = ['On-Going','On-Hold','Closed'];
const db = firebase.firestore();
const actionsCol = db.collection('actions');
let actions = [];
const actionForm = document.getElementById('action-form');
const addActionBtn = document.getElementById('add-action-btn');
const creatorSelect = document.getElementById('creator');
const titleInput = document.getElementById('title');
const detailsInput = document.getElementById('details');
const statusSelect = document.getElementById('status');
const departmentSelect = document.getElementById('department');
const filterStatusSelect = document.getElementById('filterStatus');
const filterDeptSelect = document.getElementById('filterDept');
const actionList = document.getElementById('actionList');
const exportBtn = document.getElementById('export-btn');

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function populateSelect(id, opts, empty = false, emptyText = '') {
  const sel = document.getElementById(id);
  sel.innerHTML = empty ? `<option value="">${emptyText}</option>` : '';
  opts.forEach(v => {
    const o = document.createElement('option');
    o.value = v;
    o.textContent = v;
    sel.appendChild(o);
  });
}

function updateFilterDept() {
  const used = [...new Set(actions.map(a => a.department))].sort();
  filterDeptSelect.innerHTML = '<option value="">All Departments</option>';
  used.forEach(d => {
    const o = document.createElement('option');
    o.value = d;
    o.textContent = d;
    filterDeptSelect.appendChild(o);
  });
}

function addAction() {
  const t = titleInput.value.trim();
  const d = detailsInput.value.trim();
  const s = statusSelect.value;
  const dp = departmentSelect.value;
  const c = creatorSelect.value;
  if (!t || !dp || !c) return alert('All fields are required.');
  actionsCol.add({
    title: t,
    details: d,
    status: s,
    department: dp,
    creator: c,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    comments: []
  });
  actionForm.reset();
}

function updateStatus(id, ns) {
  actionsCol.doc(id).update({ status: ns });
}

function deleteAction(id) {
  const pwd = prompt('Enter password to delete this action:');
  if (pwd === DELETE_PASSWORD) {
    actionsCol.doc(id).delete();
  } else {
    alert('Incorrect password.');
  }
}

function addComment(id) {
  const nameF = document.getElementById(`name-${id}`);
  const commentF = document.getElementById(`comment-${id}`);
  const n = nameF.value.trim();
  const c = commentF.value.trim();
  if (!n || !c) return alert('Please enter your name and comment.');
  actionsCol.doc(id).update({
    comments: firebase.firestore.FieldValue.arrayUnion({
      name: n,
      comment: c,
      timestamp: new Date().toLocaleString()
    })
  });
  nameF.value = '';
  commentF.value = '';
}

function renderActions() {
  const fs = filterStatusSelect.value;
  const fd = filterDeptSelect.value;
  actionList.innerHTML = '';
  const list = actions.filter(a => (!fs || a.status === fs) && (!fd || a.department === fd));
  if (!list.length) {
    actionList.innerHTML = '<p>No actions found.</p>';
    return;
  }
  list.forEach((a, i) => {
    const ts = a.createdAt && a.createdAt.toDate
      ? a.createdAt.toDate().toLocaleString()
      : a.createdAt || '';
    const coms = (a.comments || []).map(c =>
      `<div class="comment"><strong>${escapeHtml(c.name)}</strong> (${c.timestamp})<br/>${escapeHtml(c.comment)}</div>`
    ).join('');
    const seq = i + 1;
    actionList.insertAdjacentHTML('beforeend', `
      <div class="action-item">
        <h3>#${seq}. ${escapeHtml(a.title)}</h3>
        <div class="meta">By <strong>${escapeHtml(a.creator)}</strong> on ${ts}</div>
        <p><em>${escapeHtml(a.details)}</em></p>
        <div class="form-group">
          <label>Status:</label>
          <select onchange="updateStatus('${a.id}',this.value)">
            ${STATUSES.map(s => `<option value="${s}"${s === a.status ? ' selected' : ''}>${s}</option>`).join('')}
          </select>
        </div>
        <p><strong>Dept:</strong> ${escapeHtml(a.department)}</p>
        <h4>Comments</h4>
        ${coms}
        <div class="form-group">
          <select id="name-${a.id}">
            <option value="">Select Dept/Name</option>
            ${DEPARTMENTS.map(d => `<option>${d}</option>`).join('')}
          </select>
        </div>
        <textarea id="comment-${a.id}" placeholder="Add a comment..."></textarea>
        <button onclick="addComment('${a.id}')">Add Comment</button>
        <button onclick="deleteAction('${a.id}')" class="delete-btn">Delete</button>
      </div>
    `);
  });
}

function exportToCSV() {
  if (!actions.length) return alert('No data to export.');
  const header = ['ID','Title','Details','Status','Dept','Creator','Created At'];
  const rows = actions.map(a => [
    a.id,
    `"${a.title.replace(/"/g,'""')}"`,
    `"${a.details.replace(/"/g,'""')}"`,
    a.status,
    a.department,
    a.creator,
    a.createdAt && a.createdAt.toDate
      ? a.createdAt.toDate().toLocaleString()
      : a.createdAt || ''
  ]);
  const csv = [header.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'actions.csv';
  link.click();
  URL.revokeObjectURL(url);
}

function init() {
  populateSelect('creator', DEPARTMENTS, true, 'Select Creator Department');
  populateSelect('department', DEPARTMENTS, true, 'Select Responsible Department');
  populateSelect('status', STATUSES);
  populateSelect('filterStatus', STATUSES, true, 'All Status');
  actionsCol.orderBy('createdAt', 'asc').onSnapshot(snap => {
    actions = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    updateFilterDept();
    renderActions();
  });
  addActionBtn.addEventListener('click', addAction);
  filterStatusSelect.addEventListener('change', renderActions);
  filterDeptSelect.addEventListener('change', renderActions);
  exportBtn.addEventListener('click', exportToCSV);
}

window.addEventListener('DOMContentLoaded', init);
