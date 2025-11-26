// 통화코드 → 단위 기호 매핑 객체
const currencySymbolMap = {
  KRW: '₩',
  USD: '$',
  JPY: '¥',
  EUR: '€',
  CNY: '¥',
  TWD: 'NT$',
  CAD: 'C$',
  GBP: '£',
};

export default currencySymbolMap;

// 드롭다운 옵션 배열: { value, label }
const currencyNameMap = {
  KRW: '원화',
  USD: '달러',
  JPY: '엔화',
  EUR: '유로',
  CNY: '위안',
  TWD: '대만달러',
  CAD: '캐나다달러',
  GBP: '파운드',
};

export const currencyDropdownOptions = Object.entries(currencySymbolMap).map(([code, symbol]) => ({
  value: code,
  label: `${currencyNameMap[code]} (${symbol})`
}));