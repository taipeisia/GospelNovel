const CHURCHES = [
  { key: "ephesus",      name: "以弗所",     special: "燈臺" },
  { key: "smyrna",       name: "士每拿",     special: "冠冕" },
  { key: "pergamum",     name: "別迦摩",     special: "白石" },
  { key: "thyatira",     name: "推雅推喇",   special: "晨星" },
  { key: "sardis",       name: "撒狄",       special: "白衣" },
  { key: "philadelphia", name: "非拉鐵非",   special: "柱子" },
  { key: "laodicea",     name: "老底嘉",     special: "眼藥" },
];

const STORAGE_KEY = "overcomers_score";

function toNonNegInt(v){
  const n = Math.floor(Number(v));
  if (!Number.isFinite(n) || n < 0) return 0;
  return n;
}

function calcOutcome({hasSpecial, gospel, chase, trial, exile}){
  let base;
  let resultLabel;

  if (hasSpecial){
    resultLabel = "寄送成功";
    base = 20 + 10 * chase + 10 * gospel;
  } else {
    if (gospel >= chase){
      resultLabel = "寄送成功";
      base = 20 + 5 * chase + 5 * gospel;
    } else {
      resultLabel = "寄送失敗";
      base = -40 + 5 * gospel;
    }
  }

  const mult = Math.pow(1.2, trial) * Math.pow(1.5, exile);
  const score = Math.round(base * mult);
  return { resultLabel, base, score };
}

function loadState(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return (obj && typeof obj === "object") ? obj : {};
  }catch(e){
    return {};
  }
}

function saveState(state){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  setTimeout(900);
}

function defaultRowState(){
  return { hasSpecial:false, gospel:0, chase:0, trial:0, exile:0, resultLabel:"—", score:0 };
}

const tbody = document.getElementById("rows");
let state = loadState();

function ensureStateKeys(){
  for (const c of CHURCHES){
    if (!state[c.key]) state[c.key] = defaultRowState();
    if (typeof state[c.key].resultLabel !== "string") state[c.key].resultLabel = "—";
  }
}
ensureStateKeys();

function rowHTML(c){
  const s = state[c.key] || defaultRowState();
  return `
    <tr data-key="${c.key}">
      <td class="no-label" data-label="">
        <div class="church">${c.name}</div>
        <div class="sub">${c.special}</div>
      </td>

      <td class="no-label" data-label="">
        <label class="chk">
          <input type="checkbox" class="inp-special" ${s.hasSpecial ? "checked" : ""}>
          有翻到「${c.special}」
        </label>
      </td>

      <td data-label="福音">
        <input class="num inp-gospel" type="number" min="0" step="1" value="${s.gospel ?? 0}">
      </td>

      <td data-label="追殺">
        <input class="num inp-chase" type="number" min="0" step="1" value="${s.chase ?? 0}">
      </td>

      <td data-label="試煉">
        <input class="num inp-trial" type="number" min="0" step="1" value="${s.trial ?? 0}">
      </td>

      <td data-label="放逐">
        <input class="num inp-exile" type="number" min="0" step="1" value="${s.exile ?? 0}">
      </td>

      <td class="rowbtn" data-label="" class="rowbtn">
        <button type="button" class="btn-calc">結算</button>
      </td>

      <td class="result" data-label="" class="result">
        <span class="out-result">${s.resultLabel ?? "—"}</span>
      </td>

      <td data-label="分數" class="score">
        <span class="out-score">${s.score ?? 0}</span>
      </td>
    </tr>
  `;
}


function render(){
  tbody.innerHTML = CHURCHES.map(rowHTML).join("");
  bindRowEvents();
  updateTotal();
}

function readRow(tr){
  const key = tr.dataset.key;
  const hasSpecial = tr.querySelector(".inp-special").checked;
  const gospel = toNonNegInt(tr.querySelector(".inp-gospel").value);
  const chase  = toNonNegInt(tr.querySelector(".inp-chase").value);
  const trial  = toNonNegInt(tr.querySelector(".inp-trial").value);
  const exile  = toNonNegInt(tr.querySelector(".inp-exile").value);
  return { key, hasSpecial, gospel, chase, trial, exile };
}

function writeRowOutputs(tr, resultLabel, score){
  tr.querySelector(".out-result").textContent = resultLabel;
  tr.querySelector(".out-score").textContent = String(score);
}

function updateTotal(){
  console.log("146");
  let total = 0;
  for (const c of CHURCHES){
    total += Number(state[c.key]?.score ?? 0);
  }
  document.getElementById("totalScore").textContent = String(total);
}

function bindRowEvents(){
  const trs = tbody.querySelectorAll("tr");
  trs.forEach(tr => {
    const key = tr.dataset.key;

    const inputs = tr.querySelectorAll("input");
    inputs.forEach(inp => {
      const handler = () => {
        const r = readRow(tr);
        state[key] = { ...state[key], ...r };
        saveState(state);
      };
      inp.addEventListener("input", handler);
      inp.addEventListener("change", handler);
    });

    tr.querySelector(".btn-calc").addEventListener("click", () => {
      const r = readRow(tr);
      const out = calcOutcome(r);
      state[key] = { ...state[key], ...r, resultLabel: out.resultLabel, score: out.score };
      writeRowOutputs(tr, out.resultLabel, out.score);
      saveState(state);
      updateTotal();
    });
  });
}

document.getElementById("btnCalcAll").addEventListener("click", () => {
  const trs = tbody.querySelectorAll("tr");
  trs.forEach(tr => {
    const r = readRow(tr);
    const out = calcOutcome(r);
    state[r.key] = { ...state[r.key], ...r, resultLabel: out.resultLabel, score: out.score };
    writeRowOutputs(tr, out.resultLabel, out.score);
  });
  saveState(state);
  updateTotal();
});

document.getElementById("btnClear").addEventListener("click", () => {
  state = {};
  for (const c of CHURCHES) state[c.key] = defaultRowState();
  localStorage.removeItem(STORAGE_KEY);
  render();
  updateTotal();
});

render();
