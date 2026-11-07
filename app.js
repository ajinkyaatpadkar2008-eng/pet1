const STORAGE_KEY = "ledger_transactions_v1";
const $ = (id) => document.getElementById(id);
const today = new Date();
let transactions = loadTransactions();
let activityChart = null;
let categoryChart = null;
let toastTimer;

const categoryColors = {
  Food:"#d58c5b", Travel:"#7195a4", Education:"#8b83b9", Shopping:"#cf8e9b",
  Bills:"#8b9b78", Entertainment:"#d6b45e", Health:"#78a69a", Other:"#9ba49d",
  Allowance:"#5b9270", Salary:"#477d62", Gift:"#c58ca9"
};
const categorySymbols = {Food:"◌",Travel:"↗",Education:"⌑",Shopping:"◇",Bills:"▤",Entertainment:"☆",Health:"✚",Other:"•",Allowance:"＋",Salary:"₹",Gift:"✧"};

function loadTransactions(){
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch { return []; }
}
function saveTransactions(){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}
function money(value){
  return new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2}).format(value || 0);
}
function monthKey(date){ return date.slice(0,7); }
function selectedMonth(){ return $("monthFilter").value || monthKey(today.toISOString().slice(0,10)); }
function monthTransactions(){ return transactions.filter(t => monthKey(t.date) === selectedMonth()); }
function formatDate(date){ return new Date(date+"T00:00:00").toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"}); }
function escapeHTML(value){
  return String(value).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
}
function showToast(message){
  $("toast").textContent = message;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=>$("toast").classList.remove("show"),2300);
}
function render(){
  const list = monthTransactions();
  const income = list.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const expenses = list.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  $("balanceValue").textContent = money(income-expenses);
  $("incomeValue").textContent = money(income);
  $("expenseValue").textContent = money(expenses);
  $("countValue").textContent = list.length;
  renderTable();
  renderCharts(list);
}
function renderTable(){
  const search = $("searchInput").value.trim().toLowerCase();
  const type = $("typeFilter").value;
  const filtered = monthTransactions().filter(t=>{
    const matchesType = type==="all" || t.type===type;
    const matchesSearch = [t.title,t.category,t.note||""].join(" ").toLowerCase().includes(search);
    return matchesType && matchesSearch;
  }).sort((a,b)=>b.date.localeCompare(a.date) || b.createdAt-a.createdAt);
  $("transactionBody").innerHTML = filtered.map(t=>`
    <tr>
      <td><div class="transaction-name"><span class="transaction-symbol">${categorySymbols[t.category]||"•"}</span><span>${escapeHTML(t.title)}</span></div></td>
      <td>${escapeHTML(t.category)}</td><td>${formatDate(t.date)}</td>
      <td><span class="type-tag type-${t.type}">${t.type==="income"?"Income":"Expense"}</span></td>
      <td class="amount-col">${t.type==="income"?"+":"−"}${money(t.amount)}</td>
      <td><div class="row-actions"><button class="icon-button" title="Edit" aria-label="Edit ${escapeHTML(t.title)}" data-edit="${t.id}">✎</button><button class="icon-button" title="Delete" aria-label="Delete ${escapeHTML(t.title)}" data-delete="${t.id}">×</button></div></td>
    </tr>`).join("");
  $("emptyState").style.display = filtered.length ? "none" : "block";
}
function renderCharts(list){
  const ctx = $("activityChart").getContext("2d");
  const labels = ["Income","Expenses"];
  const values = [
    list.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0),
    list.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0)
  ];
  if(activityChart) activityChart.destroy();
  activityChart = new Chart(ctx,{
    type:"bar",
    data:{labels,datasets:[{data:values,backgroundColor:["#82a88c","#d9a17c"],borderRadius:7,maxBarThickness:45}]},
    options:{responsive:true,maintainAspectRatio:false,plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>money(c.raw)}}},
      scales:{x:{grid:{display:false},ticks:{color:"#89948d",font:{family:"DM Sans",size:10}}},y:{beginAtZero:true,grid:{color:"#f0f2ed"},ticks:{color:"#a0aaa3",font:{size:9},callback:v=>v>=1000?(v/1000)+"k":v}}}}
  });
  const expenses = list.filter(t=>t.type==="expense");
  const totals = {};
  expenses.forEach(t=>totals[t.category]=(totals[t.category]||0)+t.amount);
  const entries = Object.entries(totals).sort((a,b)=>b[1]-a[1]);
  const catCtx = $("categoryChart").getContext("2d");
  if(categoryChart) categoryChart.destroy();
  categoryChart = new Chart(catCtx,{
    type:"doughnut",
    data:{labels:entries.map(e=>e[0]),datasets:[{data:entries.map(e=>e[1]),backgroundColor:entries.map(e=>categoryColors[e[0]]||"#9ba49d"),borderWidth:0,hoverOffset:4}]},
    options:{responsive:true,maintainAspectRatio:false,cutout:"72%",plugins:{legend:{display:false},tooltip:{callbacks:{label:c=>`${c.label}: ${money(c.raw)}`}}}}
  });
  $("categoryLegend").innerHTML = entries.length ? entries.slice(0,6).map(([name,value])=>`<div class="legend-item"><span class="legend-dot" style="background:${categoryColors[name]||"#9ba49d"}"></span><span>${escapeHTML(name)} · ${money(value)}</span></div>`).join("") : '<div class="legend-item">No expenses for this month yet.</div>';
}
function openDialog(transaction=null){
  $("transactionForm").reset();
  $("transactionId").value = transaction?.id || "";
  $("dialogTitle").textContent = transaction ? "Edit transaction" : "Add transaction";
  $("titleInput").value = transaction?.title || "";
  $("amountInput").value = transaction?.amount ?? "";
  $("dateInput").value = transaction?.date || today.toISOString().slice(0,10);
  $("categoryInput").value = transaction?.category || "Food";
  $("noteInput").value = transaction?.note || "";
  document.querySelector(`input[name="transactionType"][value="${transaction?.type||"expense"}"]`).checked = true;
  $("transactionDialog").showModal();
  $("titleInput").focus();
}
function closeDialog(){ $("transactionDialog").close(); }
$("transactionForm").addEventListener("submit",e=>{
  e.preventDefault();
  const amount = Number($("amountInput").value);
  if(!Number.isFinite(amount)||amount<=0){showToast("Enter an amount greater than zero.");return;}
  const id = $("transactionId").value;
  const existing = transactions.find(t=>t.id===id);
  const item = {
    id:id || (crypto.randomUUID ? crypto.randomUUID() : String(Date.now())),
    title:$("titleInput").value.trim(), amount,
    date:$("dateInput").value,
    category:$("categoryInput").value,
    note:$("noteInput").value.trim(),
    type:document.querySelector('input[name="transactionType"]:checked').value,
    createdAt:existing?.createdAt || Date.now()
  };
  if(!item.title || !item.date){showToast("Please complete the required fields.");return;}
  if(existing) transactions=transactions.map(t=>t.id===id?item:t); else transactions.push(item);
  saveTransactions(); closeDialog(); render(); showToast(existing?"Transaction updated.":"Transaction saved.");
});
$("transactionBody").addEventListener("click",e=>{
  const edit=e.target.closest("[data-edit]");
  const del=e.target.closest("[data-delete]");
  if(edit){const item=transactions.find(t=>t.id===edit.dataset.edit);if(item)openDialog(item);}
  if(del){
    const item=transactions.find(t=>t.id===del.dataset.delete);
    if(item && confirm(`Delete "${item.title}"?`)){
      transactions=transactions.filter(t=>t.id!==item.id);saveTransactions();render();showToast("Transaction deleted.");
    }
  }
});
function addOpen(){openDialog();}
$("openAddBtn").addEventListener("click",addOpen);
$("emptyAddBtn").addEventListener("click",addOpen);
$("closeDialogBtn").addEventListener("click",closeDialog);
$("cancelDialogBtn").addEventListener("click",closeDialog);
$("monthFilter").addEventListener("change",render);
$("searchInput").addEventListener("input",renderTable);
$("typeFilter").addEventListener("change",renderTable);
$("exportBtn").addEventListener("click",()=>{
  const rows=[["Title","Type","Category","Date","Amount (INR)","Note"],...monthTransactions().map(t=>[t.title,t.type,t.category,t.date,t.amount,t.note||""])];
  const csv=rows.map(row=>row.map(v=>`"${String(v).replace(/"/g,'""')}"`).join(",")).join("\r\n");
  const blob=new Blob(["\uFEFF"+csv],{type:"text/csv;charset=utf-8;"});
  const url=URL.createObjectURL(blob);const a=document.createElement("a");
  a.href=url;a.download=`ledger-${selectedMonth()}.csv`;a.click();URL.revokeObjectURL(url);
  showToast("CSV export prepared.");
});
$("todayLabel").textContent=today.toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long"}).toUpperCase();
$("monthFilter").value=monthKey(today.toISOString().slice(0,10));
render();
