// タブ切り替え
function showPage(pageId) {
  document.querySelectorAll("section").forEach(sec => sec.classList.remove("active"));
  document.getElementById(pageId).classList.add("active");

  document.querySelectorAll(".pc-nav .tab-button, .mobile-nav .tab-button")
          .forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(`.pc-nav .tab-button[onclick="showPage('${pageId}')"],
                             .mobile-nav .tab-button[onclick="showPage('${pageId}')"]`)
          .forEach(btn => btn.classList.add("active"));
}

// LocalStorage連携
let records = JSON.parse(localStorage.getItem("records")) || [];

function saveRecord() {
  const date = document.querySelector("#input input[type='date']").value;
  const amount = Number(document.querySelector("#input input[type='number']").value);
  const type = document.querySelector("#input input[name='type']:checked")?.value;
  const category = document.querySelector("#input select").value;
  const memo = document.querySelector("#input input[type='text']").value;

  if (!date || !amount || !type) { alert("日付・金額・区分は必須です"); return; }

  const record = { id: Date.now(), date, amount, type, category, memo };
  records.push(record);
  localStorage.setItem("records", JSON.stringify(records));

  alert("保存しました！");
  showRecords();
  clearForm();
  drawCategoryChart(document.getElementById('monthSelect').value);
  drawMonthlyChart();
}

function clearForm() { document.querySelector("#input form").reset(); }

function showRecords() {
  const table = document.querySelector("#list table");
  table.innerHTML = `<tr><th>日付</th><th>区分</th><th>カテゴリ</th><th>金額</th><th>メモ</th></tr>`;
  records.forEach(r => {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.date}</td><td>${r.type}</td><td>${r.category}</td><td>${r.amount}</td><td>${r.memo}</td>`;
    table.appendChild(tr);
  });
}

document.querySelector("#input button").addEventListener("click", saveRecord);
showRecords();

// レポートグラフ
function drawCategoryChart(month) {
  const ctx = document.getElementById('categoryChart').getContext('2d');
  const filtered = records.filter(r => r.type === "支出" && r.date.startsWith(month));
  const categoryMap = {};
  filtered.forEach(r => { categoryMap[r.category] = (categoryMap[r.category] || 0) + r.amount; });
  const labels = Object.keys(categoryMap);
  const data = Object.values(categoryMap);

  if (window.categoryChart) window.categoryChart.destroy();
  window.categoryChart = new Chart(ctx, { type: 'pie', data: { labels, datasets: [{ data, backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0'] }]}, options: { responsive:true }});
}

function drawMonthlyChart() {
  const ctx = document.getElementById('monthlyChart').getContext('2d');
  const monthMap = {};
  records.forEach(r => {
    const m = r.date.slice(0,7);
    if (!monthMap[m]) monthMap[m] = {収入:0, 支出:0};
    monthMap[m][r.type] += r.amount;
  });

  const labels = Object.keys(monthMap).sort();
  const incomeData = labels.map(l => monthMap[l].収入);
  const expenseData = labels.map(l => monthMap[l].支出);

  if (window.monthlyChart) window.monthlyChart.destroy();
  window.monthlyChart = new Chart(ctx, { type: 'bar', data: { labels, datasets: [{label:'収入',data:incomeData,backgroundColor:'#36A2EB'}, {label:'支出',data:expenseData,backgroundColor:'#FF6384'}]}, options:{ responsive:true, scales:{y:{beginAtZero:true}}}});
}

document.getElementById('monthSelect').addEventListener('change', e => drawCategoryChart(e.target.value));

// 初期表示
drawMonthlyChart();
drawCategoryChart(document.getElementById('monthSelect').value);
