/* =========================================================
   나의 첫 금융투자 - 게임 로직 (script.js)
   - 순수 JavaScript, 외부 라이브러리 없음
   - 금액은 모두 '원' 단위 정수로 계산합니다.
   - 금리는 소수 오차를 피하려고 ×10 한 정수로 다룹니다. (3.5% → 35)
   ========================================================= */
"use strict";

/* ---------------- 1. 시나리오 데이터 (그대로 사용) ---------------- */
const SCENARIO = {
  baseRates: [3.0, 3.5, 4.0, 3.5, 2.5, 2.0, 2.5, 3.0, 3.5, 3.0],
  rateReasons: [
    "현재 기준금리는 3.0%입니다.",
    "물가가 올라 한국은행이 금리를 인상했습니다.",
    "물가 상승이 계속되어 금리를 추가 인상했습니다.",
    "물가가 안정되어 금리를 인하했습니다.",
    "경기침체 우려로 금리를 크게 인하했습니다.",
    "경기 부양을 위해 금리를 추가 인하했습니다.",
    "경기가 회복되며 금리를 인상했습니다.",
    "물가가 다시 올라 금리를 인상했습니다.",
    "경기 과열을 막기 위해 금리를 인상했습니다.",
    "경기 둔화 조짐에 금리를 인하했습니다."
  ],
  prices: [10000, 12000, 9500, 11500, 8500, 10500, 12500, 11000, 13500, 12000],
  finalPrice: 15000,
  news: [
    "미래전자 신규 상장! 성장 기대감",
    "주가 급등! 개미들 몰린다",
    "실적 쇼크, 주가 급락",
    "반등 성공, 신고가 기대",
    "경기침체 공포, 투매 행렬",
    "금리인하 수혜주로 부각",
    "목표주가 상향 러시",
    "경쟁사 등장, 위기론 확산",
    "역대 최고 실적 달성",
    "고점 논란, 차익실현 매물"
  ],
  // 연말 추천 개념(턴 순서): 주식, 군중심리·추격매수, 매매수수료, 기준금리, 장기투자, 복리, 수익률, 원금손실, 콜옵션, 시장가 청산
  yearConcepts: ["stock", "herd", "fee", "base-rate", "long-term", "compound", "return", "loss", "call-option", "liquidation"]
};

/* ---------------- 2. 게임 규칙 상수 ---------------- */
const INITIAL_CASH = 1000000;
const TURNS = 10;
const DEPOSIT_SPREAD_X10 = 5;       // 예금금리 = 기준금리 + 0.5%p
const FEE_PER_MILLE = 5;            // 수수료 0.5% = 1000분의 5
const OPTION_PREMIUM = 10000;       // 콜옵션 1계약 가격
const OPTION_MULTIPLIER = 10;       // 수익 배수
const STRIKE_RATIO_X10 = 13;        // 행사가 = 현재가 × 1.3

/* ---------------- 3. 순수 계산 함수 ---------------- */
const rateX10 = (pct) => Math.round(pct * 10);                    // 3.5 → 35
const baseRateX10 = (i) => rateX10(SCENARIO.baseRates[i]);
const depositRateX10 = (i) => baseRateX10(i) + DEPOSIT_SPREAD_X10;
const fmtRate = (x10) => (x10 / 10).toFixed(1) + "%";

/** 이자: 잔액 × 금리, 원 단위 버림 */
function calcInterest(balance, rX10) {
  return Math.floor((balance * rX10) / 1000);
}
/** 수수료: 매매 금액의 0.5%, 원 단위 올림 */
function calcFee(amount) {
  return Math.ceil((amount * FEE_PER_MILLE) / 1000);
}
/** i년차(0부터) 시작 주가. i === 10 이면 최종 청산가 */
function priceAt(i) {
  return i < TURNS ? SCENARIO.prices[i] : SCENARIO.finalPrice;
}
/** 행사가 = 현재 주가 × 1.3 */
function strikeOf(price) {
  return Math.round((price * STRIKE_RATIO_X10) / 10);
}
/** 콜옵션 정산: 다음 주가 ≥ 행사가 → (다음주가-행사가)/현재가 × 10배 수익, 미만 → 0 (소멸) */
function optionPayout(contracts, curPrice, nextPrice) {
  const strike = strikeOf(curPrice);
  if (nextPrice < strike) return 0;
  return Math.floor((contracts * OPTION_PREMIUM * (nextPrice - strike) * OPTION_MULTIPLIER) / curPrice);
}
/** 현금으로 살 수 있는 최대 주식 수 (수수료 포함) */
function maxAffordableShares(cash, price) {
  let q = Math.floor(cash / price);
  while (q > 0 && q * price + calcFee(q * price) > cash) q--;
  return q;
}

/** 기준 전략 ①: 1년차에 전액 예금, 10년 유지 */
function simulateDepositOnly() {
  let dep = INITIAL_CASH;
  const series = [dep];
  for (let i = 0; i < TURNS; i++) {
    dep += calcInterest(dep, depositRateX10(i));
    series.push(dep);
  }
  return { final: dep, series };
}
/** 기준 전략 ②: 1년차에 살 수 있는 만큼(99주) 주식을 사서 끝까지 보유 후 청산 */
function simulateStockHold() {
  const p0 = priceAt(0);
  const qty = maxAffordableShares(INITIAL_CASH, p0);
  const cost = qty * p0;
  const cash = INITIAL_CASH - cost - calcFee(cost);
  const series = [INITIAL_CASH];
  for (let k = 1; k < TURNS; k++) series.push(cash + qty * priceAt(k));
  const proceeds = qty * SCENARIO.finalPrice;
  const final = cash + proceeds - calcFee(proceeds);
  series.push(final);
  return { final, series, qty };
}

/* ---------------- 4. 표시 도우미 ---------------- */
function won(n) {
  const v = Math.round(n);
  return (v < 0 ? "-" : "") + Math.abs(v).toLocaleString("ko-KR") + "원";
}
function signedWon(n) {
  return (n > 0 ? "+" : "") + won(n);
}
function pct(n, digits = 1) {
  return (n > 0 ? "+" : "") + n.toFixed(digits) + "%";
}
function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}
function clsSign(n) {
  return n > 0 ? "pos" : n < 0 ? "neg" : "";
}
const $ = (id) => document.getElementById(id);

/* 링크가 실제 주소(https://)일 때만 사용 — 유튜브 자리표시자는 숨김 */
function isUsableLink(link) {
  return !!link && typeof link.url === "string" && /^https?:\/\//i.test(link.url);
}
function linkButtonsHTML(links) {
  return (links || [])
    .filter(isUsableLink)
    .map(
      (l) =>
        `<a class="link-btn" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">` +
        `🔗 ${esc(l.title)} <span class="org">· ${esc(l.org)}</span></a>`
    )
    .join("");
}

const conceptById = (id) => CONCEPTS.find((c) => c.id === id);
const categoryById = (id) => CONCEPT_CATEGORIES.find((c) => c.id === id);

/* ---------------- 5. 게임 상태 ---------------- */
const viewedConcepts = new Set(); // 열어본 개념 (다시 하기 해도 유지)
let state = null;

function newState() {
  return {
    turn: 0,            // 0~9 : 현재 연차 인덱스, 10 : 종료
    cash: INITIAL_CASH,
    deposit: 0,
    shares: 0,
    avgPrice: 0,
    options: 0,         // 이번 해 보유 콜옵션 계약 수
    history: [INITIAL_CASH],
    stats: {
      buyCount: 0, sellCount: 0, sharesBought: 0,
      tradeFees: 0, liquidationFee: 0, liquidationShares: 0,
      interestTotal: 0,
      optionContracts: 0, optionSpent: 0, optionLoss: 0, optionPayout: 0, optionYears: 0,
      yearsHeld: 0, hypeBuy: false, panicSell: false,
      usedDeposit: false, usedStock: false, usedOption: false,
      buyYears: new Set(), sellYears: new Set()
    },
    finished: false
  };
}

function totalAssets(s = state) {
  const price = priceAt(Math.min(s.turn, TURNS - 1));
  return s.cash + s.deposit + s.shares * price + s.options * OPTION_PREMIUM;
}

/* ---------------- 6. 거래 ---------------- */
function readInt(inputId) {
  const raw = $(inputId).value.trim();
  if (raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n <= 0) return NaN;
  return n;
}
function requirePositive(n, unit) {
  if (n === null) { toast(`${unit}을(를) 입력해 주세요.`, "warn"); return false; }
  if (Number.isNaN(n)) { toast(`1 이상의 정수로 입력해 주세요.`, "warn"); return false; }
  return true;
}

function depositIn() {
  const amt = readInt("in-dep");
  if (!requirePositive(amt, "금액")) return;
  if (amt > state.cash) return toast(`⚠️ 현금이 부족해요! 보유 현금은 ${won(state.cash)}이에요.`, "warn");
  state.cash -= amt;
  state.deposit += amt;
  state.stats.usedDeposit = true;
  $("in-dep").value = "";
  toast(`🏦 ${won(amt)}을 예금했어요.`, "ok");
  render();
}
function depositOut() {
  const amt = readInt("in-dep");
  if (!requirePositive(amt, "금액")) return;
  if (amt > state.deposit) return toast(`⚠️ 예금 잔액이 부족해요! 예금 잔액은 ${won(state.deposit)}이에요.`, "warn");
  state.deposit -= amt;
  state.cash += amt;
  $("in-dep").value = "";
  toast(`💵 ${won(amt)}을 출금했어요.`, "ok");
  render();
}
function buyStock() {
  const q = readInt("in-stock");
  if (!requirePositive(q, "수량")) return;
  const price = priceAt(state.turn);
  const cost = q * price;
  const fee = calcFee(cost);
  if (cost + fee > state.cash) {
    const max = maxAffordableShares(state.cash, price);
    return toast(`⚠️ 현금이 부족해요! 필요 금액 ${won(cost + fee)} (수수료 포함) · 최대 ${max}주까지 살 수 있어요.`, "warn");
  }
  state.avgPrice = Math.round((state.avgPrice * state.shares + cost) / (state.shares + q));
  state.shares += q;
  state.cash -= cost + fee;
  const st = state.stats;
  st.buyCount++; st.sharesBought += q; st.tradeFees += fee; st.usedStock = true;
  st.buyYears.add(state.turn);
  if (state.turn === 1) st.hypeBuy = true; // '주가 급등! 개미들 몰린다' 해에 매수
  $("in-stock").value = "";
  toast(`📈 ${q}주 매수 완료! (수수료 ${won(fee)})`, "ok");
  render();
}
function sellStock() {
  const q = readInt("in-stock");
  if (!requirePositive(q, "수량")) return;
  if (q > state.shares) return toast(`⚠️ 보유 수량보다 많이 팔 수 없어요! 보유: ${state.shares}주`, "warn");
  const price = priceAt(state.turn);
  const amount = q * price;
  const fee = calcFee(amount);
  state.shares -= q;
  state.cash += amount - fee;
  if (state.shares === 0) state.avgPrice = 0;
  const st = state.stats;
  st.sellCount++; st.tradeFees += fee;
  st.sellYears.add(state.turn);
  if (state.turn === 4) st.panicSell = true; // '경기침체 공포, 투매 행렬' 해에 매도
  $("in-stock").value = "";
  toast(`📉 ${q}주 매도 완료! (수수료 ${won(fee)})`, "ok");
  render();
}
function buyOption() {
  const n = readInt("in-option");
  if (!requirePositive(n, "계약 수")) return;
  const cost = n * OPTION_PREMIUM;
  if (cost > state.cash) {
    return toast(`⚠️ 현금이 부족해요! 필요 금액 ${won(cost)} · 최대 ${Math.floor(state.cash / OPTION_PREMIUM)}계약까지 살 수 있어요.`, "warn");
  }
  if (state.options === 0) state.stats.optionYears++;
  state.cash -= cost;
  state.options += n;
  const st = state.stats;
  st.optionContracts += n; st.optionSpent += cost; st.usedOption = true;
  $("in-option").value = "";
  toast(`🎲 콜옵션 ${n}계약 매수! (행사가 ${won(strikeOf(priceAt(state.turn)))})`, "ok");
  render();
}

/* ---------------- 7. 1년 보내기 ---------------- */
function nextYear() {
  const i = state.turn;
  const st = state.stats;
  const before = totalAssets();

  // ① 예금 이자 (복리, 원 단위 버림)
  const rX10 = depositRateX10(i);
  const depBefore = state.deposit;
  const interest = calcInterest(state.deposit, rX10);
  state.deposit += interest;
  st.interestTotal += interest;

  // ② 주가 변동
  const cur = priceAt(i);
  const next = priceAt(i + 1);
  const sharesHeld = state.shares;
  const stockChange = sharesHeld * (next - cur);
  if (sharesHeld > 0) st.yearsHeld++;

  // ③ 옵션 정산
  let opt = null;
  if (state.options > 0) {
    const n = state.options;
    const spent = n * OPTION_PREMIUM;
    const strike = strikeOf(cur);
    const payout = optionPayout(n, cur, next);
    state.cash += payout;
    st.optionPayout += payout;
    if (payout < spent) st.optionLoss += spent - payout;
    opt = { n, spent, strike, payout, expired: payout === 0 };
    state.options = 0;
  }

  state.turn++;

  // ④ 10년차 종료 → 주식 청산
  let liq = null;
  if (state.turn === TURNS) {
    const q = state.shares;
    const proceeds = q * SCENARIO.finalPrice;
    const fee = calcFee(proceeds);
    state.cash += proceeds - fee;
    st.liquidationFee = fee;
    st.liquidationShares = q;
    liq = { q, proceeds, fee };
    state.shares = 0;
    state.avgPrice = 0;
    const final = state.cash + state.deposit;
    state.history.push(final);
    state.finished = true;
  } else {
    state.history.push(totalAssets());
  }

  showYearModal({
    year: i + 1, rX10, depBefore, interest, cur, next, sharesHeld, stockChange, opt, liq,
    before, after: state.history[state.history.length - 1]
  });
}

/* ---------------- 8. 화면 렌더링 ---------------- */
function showScreen(id) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === id));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function render() {
  if (!state || state.finished) return;
  const i = state.turn;
  const price = priceAt(i);
  const total = totalAssets();

  $("year-num").textContent = i + 1;
  $("progress-bar").style.width = ((i + 1) / TURNS) * 100 + "%";
  $("total-assets-top").textContent = won(total);

  $("news-headline").textContent = "“" + SCENARIO.news[i] + "”";
  $("rate-reason").textContent = SCENARIO.rateReasons[i];

  // 금리 + 작년 대비 변화
  const diff = i > 0 ? baseRateX10(i) - baseRateX10(i - 1) : 0;
  const diffHTML = diff === 0 ? "" :
    `<span class="rate-diff ${diff > 0 ? "pos" : "neg"}">${diff > 0 ? "▲" : "▼"}${(Math.abs(diff) / 10).toFixed(1)}%p</span>`;
  $("base-rate").innerHTML = fmtRate(baseRateX10(i)) + diffHTML;
  $("deposit-rate").textContent = fmtRate(depositRateX10(i));
  $("t-dep-rate").textContent = fmtRate(depositRateX10(i));

  // 보유 현황
  $("h-cash").textContent = won(state.cash);
  $("h-deposit").textContent = won(state.deposit);
  $("h-deposit-sub").textContent = `연 ${fmtRate(depositRateX10(i))} · 1년 뒤 이자 약 ${won(calcInterest(state.deposit, depositRateX10(i)))}`;

  const value = state.shares * price;
  $("h-stock").textContent = won(value);
  if (state.shares > 0) {
    const pl = (price - state.avgPrice) * state.shares;
    $("h-stock-sub").innerHTML =
      `${state.shares.toLocaleString("ko-KR")}주 · 평균매입가 ${won(state.avgPrice)}<br>` +
      `평가손익 <span class="${clsSign(pl)}">${signedWon(pl)}</span>`;
  } else {
    $("h-stock-sub").textContent = "보유 주식 없음";
  }

  $("h-option").textContent = state.options.toLocaleString("ko-KR") + "계약";
  $("h-option-sub").textContent = state.options > 0
    ? `투자금 ${won(state.options * OPTION_PREMIUM)} · 행사가 ${won(strikeOf(price))}`
    : "보유 옵션 없음";
  $("h-total").textContent = won(total);

  // 매매 패널
  $("t-price").textContent = won(price);
  $("t-strike").textContent = won(strikeOf(price));
  $("btn-next").textContent = i === TURNS - 1 ? "🏁 10년 마치고 청산하기" : "⏩ 1년 보내기";

  updatePreviews();
  markViewedButtons();
}

function updatePreviews() {
  if (!state || state.finished) return;
  const i = state.turn;
  const price = priceAt(i);

  const dep = readInt("in-dep");
  $("dep-preview").textContent = dep && !Number.isNaN(dep)
    ? `이 금액을 1년 예금하면 이자 약 ${won(calcInterest(dep, depositRateX10(i)))}`
    : `현금 ${won(state.cash)} · 예금 ${won(state.deposit)}`;

  const q = readInt("in-stock");
  if (q && !Number.isNaN(q)) {
    const amt = q * price;
    const fee = calcFee(amt);
    $("stock-preview").textContent = `매수 시 ${won(amt)} + 수수료 ${won(fee)} = ${won(amt + fee)}` +
      (q <= state.shares ? ` / 매도 시 ${won(amt - fee)} 받음` : "");
  } else {
    $("stock-preview").textContent = `최대 ${maxAffordableShares(state.cash, price)}주 매수 가능 · 보유 ${state.shares}주`;
  }
}

/* ---------------- 9. 연말 결과 팝업 ---------------- */
function showYearModal(r) {
  const rows = [];

  rows.push(
    `<div class="result-row ${r.interest > 0 ? "good" : ""}">
      <span class="rl">🏦 예금 이자</span>
      <span class="rv">${r.depBefore > 0
        ? `${won(r.depBefore)} × ${fmtRate(r.rX10)} = <strong class="pos">+${won(r.interest)}</strong>`
        : `예금이 없어 이자 0원<br><span class="small muted">(현금에는 이자가 붙지 않아요)</span>`}</span>
    </div>`
  );

  const priceDiff = r.next - r.cur;
  const priceLabel = r.liq ? "최종 청산가" : "내년 주가";
  rows.push(
    `<div class="result-row">
      <span class="rl">📈 주가 변동</span>
      <span class="rv">${won(r.cur)} → ${priceLabel} <strong>${won(r.next)}</strong>
        <span class="${clsSign(priceDiff)}">(${pct((priceDiff / r.cur) * 100)})</span>
        ${r.sharesHeld > 0
          ? `<br>내 주식 ${r.sharesHeld}주 평가액 <strong class="${clsSign(r.stockChange)}">${signedWon(r.stockChange)}</strong>`
          : `<br><span class="small muted">보유한 주식이 없어요</span>`}</span>
    </div>`
  );

  if (r.opt) {
    rows.push(
      r.opt.expired
        ? `<div class="result-row bad">
            <span class="rl">🎲 콜옵션</span>
            <span class="rv">주가가 행사가(${won(r.opt.strike)})에 도달하지 못해 옵션이 소멸되었습니다.
            <strong class="pos">-${won(r.opt.spent)}</strong></span>
          </div>`
        : `<div class="result-row good">
            <span class="rl">🎲 콜옵션</span>
            <span class="rv">주가가 행사가(${won(r.opt.strike)}) 이상! ${won(r.opt.payout)}을 받았어요.
            (투자금 ${won(r.opt.spent)})</span>
          </div>`
    );
  } else {
    rows.push(`<div class="result-row"><span class="rl">🎲 콜옵션</span><span class="rv muted">올해는 옵션을 사지 않았어요.</span></div>`);
  }

  if (r.liq) {
    rows.push(
      `<div class="result-row">
        <span class="rl">🏁 주식 청산</span>
        <span class="rv">${r.liq.q > 0
          ? `${r.liq.q}주 × ${won(SCENARIO.finalPrice)} = ${won(r.liq.proceeds)}<br>수수료 -${won(r.liq.fee)}`
          : "청산할 주식이 없어요."}</span>
      </div>`
    );
  }

  const change = r.after - r.before;
  rows.push(
    `<div class="result-row" style="background:#eef1ff">
      <span class="rl">💰 총자산</span>
      <span class="rv"><strong>${won(r.after)}</strong> <span class="${clsSign(change)}">(${signedWon(change)})</span></span>
    </div>`
  );

  const cid = SCENARIO.yearConcepts[r.year - 1];
  const c = conceptById(cid);
  const conceptBox = c
    ? `<div class="year-concept">
        <span>이번 해의 개념: <strong>${esc(c.name)}</strong> 📘</span>
        <button type="button" class="btn btn-ghost" data-concept="${esc(c.id)}">설명 보기</button>
      </div>`
    : "";

  $("year-modal-title").textContent = `${r.year}년차 결산${r.liq ? " · 10년 완료!" : ""}`;
  $("year-modal-body").innerHTML = rows.join("") + conceptBox;
  $("btn-year-ok").textContent = state.finished ? "🏁 최종 결과 보기" : `${r.year + 1}년차로 ▶`;
  clearTimeout(toastTimer);
  $("toast").className = "toast";
  $("modal-year").hidden = false;
  $("btn-year-ok").focus();
}

function closeYearModal() {
  $("modal-year").hidden = true;
  if (state.finished) {
    renderFinal();
    showScreen("screen-final");
  } else {
    render();
  }
}

/* ---------------- 10. 개념 모달 / 개념 노트 ---------------- */
let lastFocus = null;

function openConcept(id) {
  const c = conceptById(id);
  if (!c) return;
  lastFocus = document.activeElement;
  viewedConcepts.add(id);
  const cat = categoryById(c.category);
  $("concept-cat").textContent = cat ? `${cat.icon} ${cat.name}` : "";
  $("concept-title").textContent = "📘 " + c.name;
  $("concept-desc").textContent = c.desc;
  $("concept-example").textContent = c.example;
  const links = linkButtonsHTML(c.links);
  $("concept-links").innerHTML = links || `<span class="small muted">등록된 링크가 없어요.</span>`;
  $("modal-concept").hidden = false;
  $("modal-concept").querySelector(".modal-x").focus();
  markViewedButtons();
  if (!$("modal-notebook").hidden) renderNotebook();
}
function closeConcept() {
  $("modal-concept").hidden = true;
  if (lastFocus && document.body.contains(lastFocus)) lastFocus.focus();
}

let nbTab = "all";
function openNotebook() {
  $("nb-search").value = "";
  renderNotebook();
  $("modal-notebook").hidden = false;
  $("nb-search").focus();
}
function closeNotebook() {
  $("modal-notebook").hidden = true;
}
function renderNotebook() {
  const tabs = [{ id: "all", name: "전체", icon: "📚" }].concat(CONCEPT_CATEGORIES);
  $("nb-tabs").innerHTML = tabs
    .map((t) => `<button type="button" class="tab ${t.id === nbTab ? "active" : ""}" role="tab" aria-selected="${t.id === nbTab}" data-tab="${t.id}">${t.icon} ${esc(t.name)}</button>`)
    .join("");

  const q = $("nb-search").value.trim().toLowerCase();
  const list = CONCEPTS.filter((c) => (nbTab === "all" || c.category === nbTab) &&
    (!q || (c.name + " " + c.desc + " " + c.example).toLowerCase().includes(q)));

  $("nb-list").innerHTML = list.length
    ? list.map((c) => {
        const cat = categoryById(c.category);
        const firstSentence = c.desc.split(/\.\s/)[0].replace(/\.?$/, ".");
        return `<button type="button" class="nb-item" data-concept="${esc(c.id)}">
          <span><span class="nb-name">${esc(c.name)}</span>
          <span class="nb-desc">${cat ? cat.icon + " " + esc(cat.name) + " · " : ""}${esc(firstSentence)}</span></span>
          <span class="nb-check" aria-label="${viewedConcepts.has(c.id) ? "읽음" : "안 읽음"}">${viewedConcepts.has(c.id) ? "✅" : "⬜"}</span>
        </button>`;
      }).join("")
    : `<div class="nb-empty">검색 결과가 없어요. 다른 단어로 찾아보세요 🔍</div>`;

  $("viewed-count").textContent = `(${viewedConcepts.size} / ${CONCEPTS.length}개 읽음)`;
}
function markViewedButtons() {
  document.querySelectorAll(".cbtn[data-concept]").forEach((b) => {
    b.classList.toggle("viewed", viewedConcepts.has(b.dataset.concept));
  });
}

/* ---------------- 11. 최종 결과 ---------------- */
function renderFinal() {
  const st = state.stats;
  const final = state.history[TURNS];
  const profit = final - INITIAL_CASH;
  const ret = (profit / INITIAL_CASH) * 100;
  const depOnly = simulateDepositOnly();
  const stockOnly = simulateStockHold();
  const retOf = (v) => ((v - INITIAL_CASH) / INITIAL_CASH) * 100;

  $("f-final").textContent = won(final);
  $("f-return").textContent = pct(ret, 2);
  $("f-profit").textContent = signedWon(profit);

  // 비교표 (기준값은 같은 규칙으로 직접 계산)
  const rows = [
    { name: "🏦 예금만 했다면", v: depOnly.final, me: false },
    { name: `📈 주식만 장기보유했다면 (${stockOnly.qty}주)`, v: stockOnly.final, me: false },
    { name: "⭐ 나의 결과", v: final, me: true }
  ];
  $("cmp-body").innerHTML = rows
    .map((r) => `<tr class="${r.me ? "me" : ""}"><td>${r.name}</td><td>${r.me ? "" : "약 "}${won(r.me ? r.v : Math.round(r.v / 1000) * 1000)}</td><td class="${clsSign(retOf(r.v))}">${pct(retOf(r.v))}</td></tr>`)
    .join("");

  // 투자 기록
  const trades = st.buyCount + st.sellCount;
  const feesTotal = st.tradeFees + st.liquidationFee;
  $("record-list").innerHTML = [
    ["📈 주식 거래 횟수", `${trades}번 (매수 ${st.buyCount} · 매도 ${st.sellCount})`],
    ["🧾 낸 수수료 합계", `${won(feesTotal)}` + (st.liquidationFee ? ` <span class="small muted">(청산 ${won(st.liquidationFee)} 포함)</span>` : "")],
    ["🎲 옵션 총 손실액", `<span class="${st.optionLoss ? "pos" : ""}">${st.optionLoss ? "-" : ""}${won(st.optionLoss)}</span>`],
    ["🏦 받은 예금 이자 합계", won(st.interestTotal)]
  ].map(([k, v]) => `<li><span>${k}</span><strong>${v}</strong></li>`).join("");

  // 그래프
  chartData = [
    { label: "예금만", data: depOnly.series, color: "#1fa971", width: 2, dash: [6, 5] },
    { label: "주식만", data: stockOnly.series, color: "#ff7a45", width: 2, dash: [6, 5] },
    { label: "나", data: state.history, color: "#4f6cff", width: 4, dash: [] }
  ];
  requestAnimationFrame(drawChart);

  renderFinalNotes({ final, ret, depOnly, stockOnly, trades, feesTotal });
}

/* ----- 꺾은선 그래프 (canvas) ----- */
let chartData = null;
function drawChart() {
  const canvas = $("chart");
  if (!canvas || !chartData || !$("screen-final").classList.contains("active")) return;
  const rect = canvas.getBoundingClientRect();
  if (rect.width === 0) return;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const W = rect.width, H = rect.height;
  ctx.clearRect(0, 0, W, H);

  const pad = { l: 54, r: 14, t: 14, b: 30 };
  const all = chartData.flatMap((s) => s.data);
  let min = Math.min(...all), max = Math.max(...all);
  const step = 100000;
  min = Math.floor(min / step) * step;
  max = Math.ceil(max / step) * step;
  if (max === min) max = min + step;
  const x = (k) => pad.l + ((W - pad.l - pad.r) * k) / TURNS;
  const y = (v) => pad.t + (H - pad.t - pad.b) * (1 - (v - min) / (max - min));

  // 격자 + y축 (만원)
  ctx.font = "11px sans-serif";
  ctx.fillStyle = "#6b7591";
  ctx.strokeStyle = "#e3e8f5";
  ctx.lineWidth = 1;
  const ticks = Math.min(6, (max - min) / step);
  for (let t = 0; t <= ticks; t++) {
    const v = min + ((max - min) * t) / ticks;
    const yy = y(v);
    ctx.beginPath(); ctx.moveTo(pad.l, yy); ctx.lineTo(W - pad.r, yy); ctx.stroke();
    ctx.textAlign = "right"; ctx.textBaseline = "middle";
    ctx.fillText(Math.round(v / 10000).toLocaleString("ko-KR") + "만", pad.l - 6, yy);
  }
  // 원금선
  if (INITIAL_CASH >= min && INITIAL_CASH <= max) {
    ctx.save();
    ctx.strokeStyle = "#b0b7cc"; ctx.setLineDash([2, 3]);
    ctx.beginPath(); ctx.moveTo(pad.l, y(INITIAL_CASH)); ctx.lineTo(W - pad.r, y(INITIAL_CASH)); ctx.stroke();
    ctx.restore();
  }
  // x축
  ctx.textAlign = "center"; ctx.textBaseline = "top";
  for (let k = 0; k <= TURNS; k++) {
    if (W < 420 && k % 2 === 1) continue;
    ctx.fillText(k + "년", x(k), H - pad.b + 8);
  }
  // 선
  chartData.forEach((s) => {
    ctx.save();
    ctx.strokeStyle = s.color; ctx.lineWidth = s.width; ctx.setLineDash(s.dash);
    ctx.lineJoin = "round";
    ctx.beginPath();
    s.data.forEach((v, k) => (k ? ctx.lineTo(x(k), y(v)) : ctx.moveTo(x(k), y(v))));
    ctx.stroke();
    ctx.restore();
  });
  // 나의 점
  const me = chartData[chartData.length - 1];
  me.data.forEach((v, k) => {
    ctx.beginPath(); ctx.fillStyle = "#fff"; ctx.strokeStyle = me.color; ctx.lineWidth = 2.5;
    ctx.arc(x(k), y(v), 4, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
  });
  // 최종값 라벨
  const last = me.data[TURNS];
  ctx.fillStyle = me.color; ctx.font = "bold 12px sans-serif";
  ctx.textAlign = "right"; ctx.textBaseline = "bottom";
  ctx.fillText(Math.round(last / 10000).toLocaleString("ko-KR") + "만원", x(TURNS) - 2, y(last) - 8);
}

/* ----- 개념 정리 노트: 내가 겪은 상황과 연결한 한 줄 코멘트 ----- */
function conceptComment(id, d) {
  const st = state.stats;
  const minRate = Math.min(...SCENARIO.baseRates), maxRate = Math.max(...SCENARIO.baseRates);
  const rateChanges = SCENARIO.baseRates.filter((r, k) => k > 0 && r !== SCENARIO.baseRates[k - 1]).length;
  const minP = Math.min(...SCENARIO.prices), maxP = Math.max(...SCENARIO.prices);
  const usedCount = [st.usedDeposit, st.usedStock, st.usedOption].filter(Boolean).length;

  switch (id) {
    case "base-rate":
      return `10년 동안 기준금리는 ${minRate.toFixed(1)}%~${maxRate.toFixed(1)}% 사이에서 ${rateChanges}번 바뀌었습니다`;
    case "deposit-rate":
    {
      const range = `연 ${fmtRate(rateX10(minRate) + DEPOSIT_SPREAD_X10)}~${fmtRate(rateX10(maxRate) + DEPOSIT_SPREAD_X10)}`;
      return st.usedDeposit
        ? `예금금리가 ${range} 사이에서 바뀌며 해마다 받는 이자가 달라졌습니다`
        : `당신은 예금을 이용하지 않았습니다. 예금금리는 ${range} 사이에서 바뀌었어요`;
    }
    case "interest":
      return st.interestTotal > 0
        ? `당신은 10년 동안 예금 이자로 총 ${won(st.interestTotal)}을 받았습니다`
        : `예금 이자 0원 — 현금으로만 들고 있으면 이자가 붙지 않아요`;
    case "compound":
      return `예금만 했다면 이자에 이자가 붙어 100만원이 약 ${won(Math.round(d.depOnly.final / 1000) * 1000)}이 되었습니다`;
    case "inflation-rate":
      return `물가가 오른 2~3년차엔 금리가 올랐고, 경기침체 우려가 있던 5~6년차엔 금리가 내려갔습니다`;
    case "stock":
      return st.sharesBought > 0
        ? `당신은 미래전자 주식을 총 ${st.sharesBought.toLocaleString("ko-KR")}주 매수했습니다`
        : `당신은 주식을 사지 않았습니다. 주식만 장기보유했다면 약 ${won(Math.round(d.stockOnly.final / 1000) * 1000)}이 되었어요`;
    case "price-change":
      return `미래전자 주가는 ${won(minP)}~${won(maxP)} 사이를 오르내리다 ${won(SCENARIO.finalPrice)}으로 끝났습니다`;
    case "fee":
      return d.trades > 0 || st.liquidationFee > 0
        ? `당신은 주식을 ${d.trades}번 거래해 수수료 ${won(d.feesTotal)}을 냈습니다${st.liquidationFee ? " (청산 수수료 포함)" : ""}`
        : `주식 거래가 없어 수수료를 내지 않았습니다`;
    case "long-term":
      return st.sharesBought === 0
        ? `주식을 1년차부터 10년간 보유했다면 ${won(Math.round(d.stockOnly.final / 1000) * 1000)}이 되었습니다`
        : st.yearsHeld >= 9 && st.sellCount === 0
          ? `당신은 주식을 ${st.yearsHeld}년 동안 팔지 않고 보유했습니다 👍`
          : `당신은 주식을 ${st.yearsHeld}년 보유했고, ${st.buyYears.size + st.sellYears.size}번의 해에 매매 결정을 했습니다`;
    case "diversify":
      return `당신은 3가지 상품 중 ${usedCount}가지에 투자했습니다`;
    case "herd":
      if (st.hypeBuy && st.panicSell) return `당신은 '주가 급등' 뉴스 때 사고 '투매 행렬' 뉴스 때 팔았습니다 — 전형적인 추격매수·공포매도예요`;
      if (st.hypeBuy) return `당신은 '주가 급등! 개미들 몰린다' 뉴스가 나온 2년차에 12,000원에 샀습니다 (다음 해 9,500원)`;
      if (st.panicSell) return `당신은 '경기침체 공포, 투매 행렬' 뉴스가 나온 5년차 바닥(8,500원)에서 팔았습니다`;
      return `당신은 급등·급락 뉴스에 따라 사고파는 행동을 피했습니다 👍`;
    case "option":
    case "call-option":
      return st.optionContracts > 0
        ? `당신은 콜옵션 ${st.optionContracts}계약(${won(st.optionSpent)})을 샀고, ${won(st.optionLoss)}을 잃었습니다`
        : `당신은 '최대 10배 수익' 광고에도 콜옵션을 사지 않았습니다 👍`;
    case "strike":
      return `행사가는 매년 주가의 1.3배였지만, 10년 동안 주가가 1년 만에 30% 이상 오른 해는 한 번도 없었습니다`;
    case "premium":
      return st.optionContracts > 0
        ? `당신이 낸 프리미엄 ${won(st.optionSpent)} 중 돌려받은 돈은 ${won(st.optionPayout)}입니다`
        : `1계약 10,000원의 프리미엄은 옵션이 소멸하면 한 푼도 돌려받지 못해요`;
    case "expiry":
      return st.optionContracts > 0
        ? `당신의 콜옵션은 ${st.optionYears}번 만기를 맞았고, 모두 소멸되었습니다`
        : `게임 속 콜옵션은 10년 내내 만기 때마다 소멸했습니다`;
    case "leverage":
      return `"최대 10배 수익"의 반대편에는 "투자금 100% 손실"이 있었습니다`;
    case "loss":
      return st.optionLoss > 0
        ? `당신은 옵션에서 원금 ${won(st.optionLoss)}을 모두 잃었습니다`
        : d.final < INITIAL_CASH
          ? `당신의 최종 자산은 원금 100만원보다 ${won(INITIAL_CASH - d.final)} 적습니다`
          : `당신은 원금을 지켜냈습니다. 하지만 투자상품은 언제든 원금손실이 날 수 있어요`;
    case "return": {
      const r = (v) => pct(((v - INITIAL_CASH) / INITIAL_CASH) * 100);
      return `나의 수익률 ${pct(d.ret)} · 예금만 ${r(d.depOnly.final)} · 주식 장기보유 ${r(d.stockOnly.final)}`;
    }
    case "liquidation":
      return st.liquidationShares > 0
        ? `당신은 10년 후 ${st.liquidationShares}주를 ${won(SCENARIO.finalPrice)}에 청산하며 수수료 ${won(st.liquidationFee)}을 냈습니다`
        : `10년이 끝났을 때 청산할 주식이 없었습니다`;
    case "risk-return":
      return `가장 화려하게 광고한 콜옵션은 손실, 가장 조용한 예금과 오래 보유한 주식은 이익이었습니다`;
    default:
      return "";
  }
}

function renderFinalNotes(d) {
  const html = CONCEPT_CATEGORIES.map((cat) => {
    const cards = CONCEPTS.filter((c) => c.category === cat.id).map((c) => {
      const comment = conceptComment(c.id, d);
      return `<div class="note-card">
        <h4><span>${esc(c.name)}</span>${viewedConcepts.has(c.id) ? '<span title="게임 중 읽은 개념">✅</span>' : ""}</h4>
        ${comment ? `<div class="note-comment">${esc(comment)} → ${esc(c.name)} <button type="button" class="cbtn" data-concept="${esc(c.id)}" aria-label="${esc(c.name)} 설명">📘</button></div>` : ""}
        <p class="note-desc">${esc(c.desc)}</p>
        <div class="link-btns">${linkButtonsHTML(c.links)}</div>
      </div>`;
    }).join("");
    return `<h4 class="notes-cat">${cat.icon} ${esc(cat.name)}</h4><div class="notes-grid">${cards}</div>`;
  }).join("");
  $("final-notes").innerHTML = html;
}

/* ---------------- 12. 토스트 ---------------- */
let toastTimer = null;
function toast(msg, type = "") {
  const t = $("toast");
  t.textContent = msg;
  t.className = "toast show " + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (t.className = "toast " + type), type === "warn" ? 3200 : 1800);
}

/* ---------------- 13. 시작 / 이벤트 연결 ---------------- */
function startGame() {
  state = newState();
  ["in-dep", "in-stock", "in-option"].forEach((id) => ($(id).value = ""));
  showScreen("screen-game");
  render();
}

function init() {
  $("btn-start").addEventListener("click", startGame);
  $("btn-restart").addEventListener("click", () => { chartData = null; startGame(); });
  $("btn-preview-concepts").addEventListener("click", openNotebook);
  $("btn-notebook").addEventListener("click", openNotebook);
  $("btn-dep-in").addEventListener("click", depositIn);
  $("btn-dep-out").addEventListener("click", depositOut);
  $("btn-buy").addEventListener("click", buyStock);
  $("btn-sell").addEventListener("click", sellStock);
  $("btn-option").addEventListener("click", buyOption);
  $("btn-next").addEventListener("click", nextYear);
  $("btn-year-ok").addEventListener("click", closeYearModal);
  $("btn-print").addEventListener("click", () => window.print());
  ["in-dep", "in-stock"].forEach((id) => $(id).addEventListener("input", updatePreviews));

  // 빠른 입력 버튼
  document.querySelectorAll("[data-quick]").forEach((b) =>
    b.addEventListener("click", () => {
      if (!state) return;
      const price = priceAt(state.turn);
      const k = b.dataset.quick;
      if (k === "dep-cash") $("in-dep").value = state.cash || "";
      if (k === "dep-all") $("in-dep").value = state.deposit || "";
      if (k === "stock-max") $("in-stock").value = maxAffordableShares(state.cash, price) || "";
      if (k === "stock-all") $("in-stock").value = state.shares || "";
      updatePreviews();
    })
  );

  // 📘 버튼(동적으로 생긴 것 포함) · 닫기 · 탭
  document.addEventListener("click", (e) => {
    const cb = e.target.closest("[data-concept]");
    if (cb) { openConcept(cb.dataset.concept); return; }
    const close = e.target.closest("[data-close]");
    if (close) { close.dataset.close === "concept" ? closeConcept() : closeNotebook(); return; }
    const tab = e.target.closest("[data-tab]");
    if (tab) { nbTab = tab.dataset.tab; renderNotebook(); }
  });
  $("nb-search").addEventListener("input", renderNotebook);

  // Esc로 닫기 (개념 → 노트 순서). 연말 결과 팝업은 버튼으로만 진행
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    if (!$("modal-concept").hidden) closeConcept();
    else if (!$("modal-notebook").hidden) closeNotebook();
  });

  // Enter로 바로 거래
  $("in-option").addEventListener("keydown", (e) => { if (e.key === "Enter") buyOption(); });

  let resizeTimer = null;
  window.addEventListener("resize", () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(drawChart, 150); });
  window.addEventListener("beforeprint", drawChart);
}

function safeInit() {
  try {
    init();
    window.__GAME_READY__ = true;
  } catch (err) {
    const box = document.getElementById("load-error");
    if (box) {
      box.textContent = "⚠️ 게임을 시작하는 중 오류가 났어요: " + err.message;
      box.hidden = false;
    }
    console.error(err);
  }
}
// 스크립트가 늦게 실행돼도 확실히 연결되도록 처리
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", safeInit);
else safeInit();
