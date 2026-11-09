/* =========================================================
   나의 첫 금융투자 - 개념 데이터 (concepts.js)
   ---------------------------------------------------------
   ※ 링크는 아래 OFFICIAL_LINKS 에 모아 두었습니다.
   ※ 유튜브 2개는 자리표시자(YOUTUBE_BOK / YOUTUBE_FSS)입니다.
     공식 채널·영상 주소(https://로 시작)로 바꾸면 버튼이 나타나고,
     자리표시자 그대로면 화면에서 자동으로 숨겨집니다.
   ========================================================= */

const OFFICIAL_LINKS = {
  BOK_EDU: {
    org: "한국은행",
    title: "한국은행 경제교육",
    url: "https://www.bok.or.kr/portal/submain/submain/ecEdu.do?menuNo=201254"
  },
  BOK_HOME: {
    org: "한국은행",
    title: "한국은행 홈페이지",
    url: "https://www.bok.or.kr/portal/main/main.do"
  },
  FINE: {
    org: "금융감독원",
    title: "금융소비자 정보포털 파인",
    url: "https://fine.fss.or.kr"
  },
  KCIE: {
    org: "투자자교육협의회",
    title: "투자자 교육 자료",
    url: "https://www.kcie.or.kr"
  },
  YOUTUBE_BOK: {
    org: "한국은행",
    title: "한국은행 공식 유튜브",
    url: "YOUTUBE_BOK" // ← 여기를 공식 유튜브 주소로 바꾸세요
  },
  YOUTUBE_FSS: {
    org: "금융감독원",
    title: "금융감독원 공식 유튜브",
    url: "YOUTUBE_FSS" // ← 여기를 공식 유튜브 주소로 바꾸세요
  }
};

/* 분류 */
const CONCEPT_CATEGORIES = [
  { id: "rate", name: "금리·예금", icon: "🏦" },
  { id: "stock", name: "주식", icon: "📈" },
  { id: "option", name: "옵션·위험", icon: "🎲" },
  { id: "common", name: "공통", icon: "🧭" }
];

/* 분류별 기본 링크 묶음 */
const L_RATE = [OFFICIAL_LINKS.BOK_EDU, OFFICIAL_LINKS.YOUTUBE_BOK];
const L_INVEST = [OFFICIAL_LINKS.KCIE, OFFICIAL_LINKS.FINE, OFFICIAL_LINKS.YOUTUBE_FSS];

/* 개념 목록
   id, name(이름), category(분류), desc(쉬운 설명), example(게임 속 예시), links */
const CONCEPTS = [
  /* ---------------- 금리·예금 ---------------- */
  {
    id: "base-rate",
    name: "기준금리",
    category: "rate",
    desc: "한국은행이 정하는, 우리나라 금리의 '기준'이 되는 금리예요. 한국은행 금융통화위원회가 1년에 여러 번 회의를 열어 올릴지, 내릴지, 그대로 둘지 결정해요. 기준금리가 바뀌면 은행의 예금·대출 금리도 대체로 따라 움직여요.",
    example: "게임 2년차에 물가가 오르자 기준금리가 3.0%에서 3.5%로 올랐어요.",
    links: [OFFICIAL_LINKS.BOK_EDU, OFFICIAL_LINKS.BOK_HOME, OFFICIAL_LINKS.YOUTUBE_BOK]
  },
  {
    id: "deposit-rate",
    name: "예금금리",
    category: "rate",
    desc: "은행에 돈을 맡길 때 받는 이자의 비율이에요. 보통 '연 3%'처럼 1년 기준으로 표시하고, 은행과 상품마다 조금씩 달라요. 기준금리가 오르면 예금금리도 오르는 경향이 있어요.",
    example: "이 게임에서는 단순하게 '예금금리 = 기준금리 + 0.5%p'로 정했어요. 실제 은행은 각자 금리를 정해요.",
    links: L_RATE
  },
  {
    id: "interest",
    name: "이자",
    category: "rate",
    desc: "돈을 맡기거나 빌려준 대가로 받는 돈이에요. 은행 예금은 내가 은행에 돈을 빌려주는 것과 비슷해서 이자를 받고, 반대로 대출을 받으면 이자를 내야 해요. 실제 예금 이자에는 세금이 붙지만, 이 게임에서는 생략했어요.",
    example: "예금 100만원에 예금금리 3.5%면 1년 뒤 이자 35,000원을 받아요. 현금으로 들고만 있으면 이자는 0원이에요.",
    links: L_RATE
  },
  {
    id: "compound",
    name: "단리와 복리",
    category: "rate",
    desc: "단리는 처음 맡긴 원금에만 이자가 붙고, 복리는 이자에도 다시 이자가 붙어요. 예를 들어 100만원을 연 4%로 10년 맡기면 단리는 140만원, 복리는 약 148만원이 돼요. 기간이 길수록 복리의 차이가 커져요.",
    example: "이 게임의 예금은 복리예요. 해마다 받은 이자가 예금에 더해져서 다음 해엔 더 큰 금액에 이자가 붙어요.",
    links: L_RATE
  },
  {
    id: "inflation-rate",
    name: "물가와 금리의 관계",
    category: "rate",
    desc: "물가가 너무 빠르게 오르면 한국은행은 금리를 올려요. 그러면 돈을 빌리기 부담스러워져 소비가 줄고 물가 상승이 누그러지는 효과를 기대해요. 반대로 경기가 나빠지면 금리를 내려 돈을 쓰고 투자하기 쉽게 만들어요. 실제로는 여러 상황을 함께 고려해 결정해요.",
    example: "게임 2~3년차엔 물가 상승으로 금리가 올랐고, 5~6년차엔 경기침체 우려로 금리가 내려갔어요.",
    links: [OFFICIAL_LINKS.BOK_EDU, OFFICIAL_LINKS.BOK_HOME, OFFICIAL_LINKS.YOUTUBE_BOK]
  },

  /* ---------------- 주식 ---------------- */
  {
    id: "stock",
    name: "주식",
    category: "stock",
    desc: "회사의 주인이 될 수 있는 권리를 잘게 나눈 것이에요. 주식을 사면 그 회사의 아주 작은 일부를 갖게 돼요. 회사가 성장하면 주가가 오르거나 배당을 받을 수 있지만, 반대로 주가가 떨어져 손해를 볼 수도 있어요.",
    example: "게임 1년차에 '미래전자' 주식은 1주에 10,000원이에요.",
    links: L_INVEST
  },
  {
    id: "price-change",
    name: "주가 변동",
    category: "stock",
    desc: "주가는 사려는 사람과 팔려는 사람의 힘겨루기로 계속 바뀌어요. 회사 실적, 금리, 경기, 뉴스, 사람들의 기대 같은 많은 것이 영향을 줘요. 특히 짧은 기간의 주가 움직임은 전문가도 맞히기 매우 어려워요.",
    example: "미래전자 주가는 10년 동안 8,500원~13,500원 사이를 오르내렸어요.",
    links: L_INVEST
  },
  {
    id: "fee",
    name: "매매수수료",
    category: "stock",
    desc: "주식을 사고팔 때 증권회사에 내는 비용이에요. 한 번은 작아 보여도 자주 거래할수록 계속 쌓여 수익을 깎아 먹어요. 실제 수수료는 증권사와 거래 방법마다 다르고, 주식을 팔 때는 세금도 붙어요.",
    example: "이 게임은 거래 금액의 0.5%를 수수료로 받아요(이해를 돕기 위해 실제보다 높게 정했어요). 50만원어치를 사면 2,500원이에요.",
    links: L_INVEST
  },
  {
    id: "long-term",
    name: "장기투자",
    category: "stock",
    desc: "좋은 자산을 오랫동안 꾸준히 보유하는 투자 방법이에요. 짧은 기간의 오르내림에 덜 흔들리고, 거래가 적어 수수료도 아낄 수 있어요. 다만 장기투자도 이익을 보장하지는 않아요. 회사가 어려워지면 오래 들고 있어도 손실이 날 수 있어요.",
    example: "1년차에 미래전자를 사서 10년 동안 그냥 들고만 있었다면 약 148만원이 되었어요.",
    links: L_INVEST
  },
  {
    id: "diversify",
    name: "분산투자",
    category: "stock",
    desc: "'달걀을 한 바구니에 담지 말라'는 말처럼, 돈을 여러 자산에 나누어 투자하는 방법이에요. 한 곳에서 손실이 나도 전체에 미치는 충격을 줄일 수 있어요. 위험을 줄여 줄 뿐, 완전히 없애 주지는 않아요.",
    example: "이 게임에서는 예금·주식·옵션에 돈을 나눠 담을 수 있어요.",
    links: L_INVEST
  },
  {
    id: "herd",
    name: "군중심리·추격매수",
    category: "stock",
    desc: "다른 사람들이 많이 사니까 나도 따라 사는 것을 추격매수라고 해요. 이미 많이 오른 뒤에 사면 비싸게 사서 손해 보기 쉬워요. 반대로 모두가 겁먹고 팔 때 따라 팔면 싸게 팔게 되기 쉬워요.",
    example: "2년차 '주가 급등! 개미들 몰린다' 뉴스에 12,000원에 샀다면, 다음 해 주가는 9,500원이 되었어요.",
    links: L_INVEST
  },

  /* ---------------- 옵션·위험 ---------------- */
  {
    id: "option",
    name: "옵션",
    category: "option",
    desc: "미래에 정해진 가격으로 어떤 자산을 사거나 팔 수 있는 '권리'를 사고파는 상품이에요. 살 수 있는 권리는 콜옵션, 팔 수 있는 권리는 풋옵션이라고 해요. 권리를 산 사람은 불리하면 쓰지 않아도 되지만, 권리를 사느라 낸 돈은 돌려받지 못해요.",
    example: "게임 속 상품3은 미래전자 주식을 살 수 있는 권리(콜옵션)예요.",
    links: L_INVEST
  },
  {
    id: "call-option",
    name: "콜옵션",
    category: "option",
    desc: "정해진 가격(행사가)에 주식을 살 수 있는 권리예요. 주가가 행사가보다 많이 오르면 큰 이익을 볼 수 있지만, 그만큼 오르지 않으면 권리가 쓸모없어져 낸 돈을 전부 잃어요.",
    example: "게임의 콜옵션은 1년 뒤 주가가 지금보다 30% 이상 올라야 이익이 나요.",
    links: L_INVEST
  },
  {
    id: "strike",
    name: "행사가",
    category: "option",
    desc: "옵션에서 미리 정해 둔 '사고팔 가격'이에요. 콜옵션은 만기 때 주가가 행사가보다 높아야 의미가 있어요. 행사가가 현재 주가보다 높을수록 이익을 낼 가능성은 낮아져요.",
    example: "이 게임의 행사가는 '현재 주가 × 1.3'이에요. 주가가 10,000원이면 행사가는 13,000원이에요.",
    links: L_INVEST
  },
  {
    id: "premium",
    name: "프리미엄(옵션 가격)",
    category: "option",
    desc: "옵션이라는 권리를 사기 위해 내는 값이에요. 옵션이 쓸모없이 끝나면 이 프리미엄은 한 푼도 돌려받지 못해요. 그래서 옵션을 산 사람의 최대 손실은 낸 프리미엄 전부예요.",
    example: "이 게임에서는 콜옵션 1계약의 프리미엄이 10,000원이에요.",
    links: L_INVEST
  },
  {
    id: "expiry",
    name: "만기와 소멸",
    category: "option",
    desc: "옵션은 정해진 날(만기)까지만 효력이 있어요. 만기에 이익이 나지 않는 상태라면 권리는 그냥 사라지고(소멸), 옵션의 가치는 0원이 돼요.",
    example: "게임의 콜옵션은 만기가 1년이에요. 연말에 주가가 행사가에 못 미치면 소멸해요.",
    links: L_INVEST
  },
  {
    id: "leverage",
    name: "레버리지",
    category: "option",
    desc: "지렛대처럼 적은 돈으로 큰 금액에 투자한 효과를 내는 것이에요. 잘되면 수익이 몇 배로 커지지만, 잘못되면 손실도 몇 배로 커져요. 빚을 내서 투자하는 것도 레버리지의 한 종류예요.",
    example: "'최대 10배 수익'이라는 말은 거꾸로 보면 원금을 모두 잃을 수도 있다는 뜻이에요.",
    links: L_INVEST
  },
  {
    id: "loss",
    name: "원금손실",
    category: "option",
    desc: "처음 투자한 돈(원금)보다 적게 돌려받는 것이에요. 은행 예금은 예금자보호제도로 일정 한도까지 보호되지만, 주식·옵션 같은 투자상품은 보호되지 않고 원금을 잃을 수 있어요. 옵션처럼 위험이 큰 상품은 원금 전부를 잃을 수도 있어요.",
    example: "게임에서 콜옵션을 산 돈은 옵션이 소멸되면 전부 사라져요.",
    links: L_INVEST
  },

  /* ---------------- 공통 ---------------- */
  {
    id: "return",
    name: "수익률",
    category: "common",
    desc: "투자해서 얼마나 벌었는지(또는 잃었는지)를 비율로 나타낸 것이에요. (나중 금액 − 처음 금액) ÷ 처음 금액 × 100으로 계산해요. 100만원이 110만원이 되면 수익률은 10%예요. 비교할 때는 투자 기간도 함께 봐야 해요.",
    example: "게임이 끝나면 처음 100만원과 비교한 나의 10년 수익률을 보여줘요.",
    links: [OFFICIAL_LINKS.KCIE, OFFICIAL_LINKS.FINE, OFFICIAL_LINKS.BOK_EDU]
  },
  {
    id: "liquidation",
    name: "시장가 청산",
    category: "common",
    desc: "가지고 있는 투자상품을 그 순간의 시장 가격으로 모두 팔아 현금으로 바꾸고 투자를 끝내는 것이에요. 원하는 가격을 고를 수 없고, 그때의 가격을 받아들여야 해요. 팔 때도 수수료가 들어요.",
    example: "10년이 끝나면 가진 주식을 1주 15,000원에 모두 팔고 수수료 0.5%를 내요.",
    links: L_INVEST
  },
  {
    id: "risk-return",
    name: "투자 위험과 기대수익",
    category: "common",
    desc: "보통 더 높은 수익을 기대할 수 있는 상품일수록 가격이 크게 흔들리거나 손실이 날 위험도 커요. '위험 없이 높은 수익'을 약속하는 광고는 일단 의심해야 해요. 투자 전에 '최악의 경우 얼마를 잃을 수 있는지'를 먼저 확인하는 습관이 중요해요.",
    example: "예금은 수익이 작지만 안정적이고, 옵션은 큰 수익을 광고하지만 전액 손실 위험이 있어요.",
    links: [OFFICIAL_LINKS.FINE, OFFICIAL_LINKS.KCIE, OFFICIAL_LINKS.YOUTUBE_FSS]
  }
];
