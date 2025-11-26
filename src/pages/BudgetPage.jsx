import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";

import Inputfield from "../components/Inputfield";
import Dropdown from "../components/Dropdown";
import SquareButton from "../components/button/SquareButton";
import Modal from "../components/Modal";
import { BudgetAPI } from "@/apis";
import currencySymbolMap from "@/utils/currencySymbolMap";
import { currencyDropdownOptions } from "@/utils/currencySymbolMap";

const MAX_INT = 2147483647;

const BudgetInputStyle = {
  width: "21.91256rem",
}

const SpendingInputStyle = {
  background: "var(--white)",
}

const LivingInputStyle = {
  paddingRight: "2rem",
}

const spendingItems = [
  {
    id: "FOOD",
    title: "식비"
  },
  {
    id: "HOUSING",
    title: "주거비"
  },
  {
    id: "TRANSPORT",
    title: "교통비"
  },
  {
    id: "SHOPPING",
    title: "쇼핑비"
  },
  {
    id: "TRAVEL",
    title: "여행비"
  },
  {
    id: "STUDY_MATERIALS",
    title: "교재비"
  },
]

const BudgetPage = () => {
  const [budgetValues, setBudgetValues] = useState({});
  const [customSpendingItems, setCustomSpendingItems] = useState([]);
  const [currencyValues, setCurrencyValues] = useState({});
  const [totalBudgetValue, setTotalBudgetValue] = useState({ krw: 0, converted: 0 });
  const [baseAverage, setBaseAverage] = useState({ country: "", flight_avg: 0, insurance_avg: 0, visa_avg: 0 });
  const [livingAverage, setLivingAverage] = useState({ country: "", transit_avg: 0, food_avg: 0});
  const [totalAverage, setTotalAverage] = useState({ country: "", min_krw: 0, max_krw: 0, min_converted: 0, max_converted: 0, currency: "" });

  const [showModal, setShowModal] = useState(false);
  const [modalMissing, setModalMissing] = useState([]);

  useEffect(() => {
    const loadBudget = async () => {
      try {
        const data = await BudgetAPI.getBudget();
        const dataBaseAverage = await BudgetAPI.getBaseAverage();
        const dataLivingAverage = await BudgetAPI.getLivingAverage();
        const dataTotalAverage = await BudgetAPI.getTotalAverage();

        if (!data || !data.base_budget) return;

        if (data.total_budget_value) {
          setTotalBudgetValue({
            krw: data.total_budget_value.krw,
            converted: data.total_budget_value.converted
          });
        }

        // 기본 비용 평균값 저장
        if (dataBaseAverage) {
          setBaseAverage({
            country: dataBaseAverage.country,
            flight_avg: dataBaseAverage.flight_avg,
            insurance_avg: dataBaseAverage.insurance_avg,
            visa_avg: dataBaseAverage.visa_avg,
          });
        }

        // 생활비 평균값 저장
        if (dataLivingAverage) {
          setLivingAverage({
            country: dataLivingAverage.country,
            food_avg: dataLivingAverage.food_avg,
            transit_avg: dataLivingAverage.transit_avg,
          });
        }

        // 총 평균 비용 (min/max) 저장
        if (dataTotalAverage) {
          setTotalAverage({
            country: dataTotalAverage.country,
            min_krw: dataTotalAverage.min_krw,
            max_krw: dataTotalAverage.max_krw,
            min_converted: dataTotalAverage.min_converted,
            max_converted: dataTotalAverage.max_converted,
            currency: dataTotalAverage.currency,
          });
        }

        const baseItems = data.base_budget.items;
        const livingItems = data.living_budget.items;

        // 기본 예산 금액 + 화폐단위 초기화
        const newBudgetValues = {};
        const newCurrencyValues = {};

        baseItems.forEach(item => {
          newBudgetValues[item.type] = Number(item.amount).toLocaleString();
          newCurrencyValues[item.type] = item.currency;
        });

        //생활비 total_amount
        if (!data.living_budget.total_amount) {
          newBudgetValues["monthlyLiving"] = "";
        } else {
          newBudgetValues["monthlyLiving"] =
            Number(data.living_budget.total_amount).toLocaleString();
        }

        //생활비 기본 + 커스텀 금액 초기화
        const newCustom = [];

        livingItems.forEach(item => {
          if (item.type === "ETC") {
            newCustom.push({
              title: item.custom_name,
              isNew: false,
            });
            newBudgetValues[`CUSTOM_${newCustom.length - 1}`] = Number(item.amount).toLocaleString();
          } else {
            newBudgetValues[item.type] = Number(item.amount).toLocaleString();
          }
        });

        setBudgetValues(newBudgetValues);
        setCurrencyValues(newCurrencyValues);
        setCustomSpendingItems(newCustom);

      } catch (error) {
        console.log("예산 조회 실패 (초기 생성 상태일 수 있음)");
      }
    };

    loadBudget();
  }, []);

  const budgetItems = [
    {
      id: "FLIGHT",
      title: "항공권",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="21" viewBox="0 0 18 21" fill="none">
          <path d="M15.5586 0.0670184C16.263 0.208297 16.8137 0.758994 16.955 1.46346C17.0557 1.96823 17.0411 2.4892 16.9125 2.98758C16.7839 3.48595 16.5445 3.94888 16.2121 4.34189L13.5682 7.46731L15.4365 14.3208C15.4923 14.5251 15.493 14.7406 15.4387 14.9453C15.3843 15.15 15.2768 15.3368 15.127 15.4865L13.8757 16.7379C13.7694 16.8441 13.64 16.9242 13.4975 16.9718C13.355 17.0195 13.2034 17.0335 13.0547 17.0126C12.9059 16.9917 12.764 16.9366 12.6401 16.8516C12.5162 16.7666 12.4138 16.6539 12.3409 16.5226L9.46436 11.3453L6.33317 13.5125V14.2689C6.33317 14.587 6.20631 14.8936 5.98142 15.1185L4.36392 16.735C4.24692 16.8521 4.1019 16.9374 3.94265 16.9827C3.7834 17.028 3.61521 17.0318 3.45407 16.9937C3.29294 16.9557 3.14421 16.8771 3.02204 16.7653C2.89986 16.6536 2.80829 16.5125 2.75604 16.3554L2.23322 14.7878L0.665698 14.265C0.508593 14.2128 0.367463 14.1212 0.255728 13.999C0.143992 13.8768 0.0653641 13.7281 0.0273195 13.567C-0.0107251 13.4058 -0.00692178 13.2377 0.0383679 13.0784C0.0836576 12.9192 0.168928 12.7741 0.286073 12.6571L1.90357 11.0396C2.01514 10.9281 2.1476 10.8396 2.29338 10.7793C2.43915 10.7189 2.59538 10.6879 2.75316 10.6879H3.50953L5.67676 7.55669L0.499432 4.68019C0.368085 4.60725 0.255463 4.50482 0.170431 4.38096C0.0853991 4.2571 0.0302788 4.11519 0.00941003 3.9664C-0.0114588 3.81762 0.00249345 3.66602 0.0501683 3.52355C0.0978432 3.38107 0.177939 3.25161 0.28415 3.14535L1.53547 1.89403C1.68526 1.74425 1.87198 1.63673 2.07671 1.58238C2.28145 1.52804 2.49691 1.52879 2.70126 1.58456L9.55374 3.45289L12.6801 0.80897C13.0731 0.476605 13.5361 0.237192 14.0344 0.108563C14.5328 -0.0200656 15.0538 -0.0336339 15.5586 0.0670184Z" fill="#0B3E99"/>
        </svg>
      ),
      message: `* 항공권 평균 ${Math.floor(baseAverage.flight_avg / 10000)}만원`
    },
    {
      id: "INSURANCE",
      title: "보험료",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <g clipPath="url(#clip0_252_1442)">
            <path fillRule="evenodd" clipRule="evenodd" d="M13.7944 0.483929C14.1367 0.43392 14.4823 0.409962 14.8283 0.41226C15.2558 0.41226 15.5977 0.443564 15.8621 0.483929C16.4738 0.578252 16.8169 1.10753 16.8354 1.64134C16.8486 2.01616 16.8634 2.56645 16.8741 3.30908C17.6168 3.31979 18.1666 3.33462 18.5415 3.3478C19.0757 3.36634 19.605 3.70944 19.6989 4.3211C19.7401 4.58553 19.771 4.9274 19.771 5.35494C19.771 5.78249 19.7397 6.12435 19.6993 6.38879C19.605 7.00045 19.0757 7.34355 18.5419 7.36208C18.1671 7.37526 17.6168 7.39009 16.8741 7.4008C16.8668 7.95683 16.8539 8.51278 16.8354 9.06855C16.8169 9.60236 16.4738 10.1316 15.8621 10.226C15.5977 10.2663 15.2558 10.2976 14.8283 10.2976C14.4007 10.2976 14.0589 10.2663 13.7944 10.226C13.1828 10.1316 12.8397 9.60236 12.8211 9.06855C12.8079 8.69373 12.7931 8.14344 12.7824 7.4008C12.2265 7.39349 11.6707 7.38059 11.1151 7.36208C10.5809 7.34355 10.0516 7.00045 9.95767 6.38879C9.90736 6.04651 9.88327 5.70089 9.88559 5.35494C9.88559 4.9274 9.91689 4.58553 9.95726 4.3211C10.0516 3.70944 10.5809 3.36634 11.1147 3.3478C11.4895 3.33462 12.0398 3.31979 12.7824 3.30908C12.7931 2.56645 12.8079 2.01657 12.8211 1.64175C12.8397 1.10753 13.1828 0.57784 13.7944 0.483929ZM1.36069 10.6572C1.1456 10.7243 0.9551 10.8534 0.813035 11.0283C0.67097 11.2032 0.58366 11.4161 0.562037 11.6404C0.494899 12.3175 0.412109 13.367 0.412109 14.4165C0.412109 15.3911 0.483778 16.366 0.547621 17.0423C0.572477 17.3019 0.683199 17.5457 0.862252 17.7352C1.04131 17.9247 1.27846 18.049 1.53616 18.0885C3.27928 18.369 7.2186 18.9473 10.0022 18.9473C12.1094 18.9473 16.3255 17.5288 18.2968 16.8216C18.9389 16.5909 19.411 15.9619 19.2025 15.3128C18.9229 14.4437 18.3293 14.1142 17.9191 13.9894C17.639 13.9041 17.3453 13.9387 17.057 13.9886C15.7081 14.2229 11.5595 14.9199 10.0022 14.9199C9.26775 14.9199 8.26521 14.7856 7.67827 14.6962C7.54309 14.6748 7.42004 14.6058 7.33141 14.5015C7.24278 14.3972 7.19443 14.2646 7.19512 14.1278C7.19512 13.7859 7.48674 13.5174 7.82737 13.545L11.0051 13.8045C11.7247 13.8629 12.3578 13.2867 12.193 12.5836C12.1049 12.2059 11.9871 11.8916 11.8701 11.6404C11.6254 11.1161 11.1151 10.8018 10.5545 10.6576C9.39709 10.3598 7.25031 9.88574 5.32349 9.88574C4.04045 9.88574 2.3171 10.3594 1.36069 10.6572Z" fill="#0B3E99"/>
          </g>
          <defs>
            <clipPath id="clip0_252_1442">
              <rect width="19.7707" height="19.7707" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      ),
      message: `* 보험료 평균 ${Math.floor(baseAverage.insurance_avg / 10000)}만원`
    },
    {
      id: "VISA",
      title: "비자",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 27 27" fill="none">
          <g clipPath="url(#clip0_252_1448)">
            <path d="M10.0084 9.0754L6.55729 17.3088H4.30563L2.60754 10.7372C2.50429 10.333 2.41532 10.1848 2.10119 10.0145C1.58935 9.73663 0.743599 9.47631 0 9.31375L0.0505252 9.0754H3.67516C3.91202 9.07517 4.14117 9.15961 4.32123 9.31349C4.5013 9.46737 4.62042 9.68056 4.65711 9.91456L5.55448 14.6793L7.771 9.0754H10.0084ZM18.8316 14.6211C18.8404 12.4474 15.8265 12.3277 15.8473 11.3567C15.8539 11.0613 16.1351 10.7471 16.7502 10.6669C17.4711 10.5985 18.197 10.726 18.8514 11.036L19.2248 9.28959C18.5878 9.04992 17.913 8.92605 17.2324 8.92383C15.1268 8.92383 13.6451 10.0442 13.6319 11.6467C13.6187 12.8318 14.6897 13.492 15.497 13.8874C16.3273 14.2905 16.6063 14.5497 16.6019 14.91C16.5964 15.4635 15.9407 15.7063 15.3278 15.7162C14.2569 15.7326 13.6363 15.4273 13.1398 15.1966L12.7543 17.0002C13.2519 17.2286 14.1701 17.4285 15.1224 17.4373C17.3598 17.4373 18.8239 16.3324 18.8316 14.6211ZM24.3905 17.3088H26.361L24.642 9.0754H22.8231C22.6287 9.07315 22.4381 9.1296 22.2762 9.23737C22.1144 9.34515 21.9888 9.49924 21.9159 9.67951L18.7207 17.3088H20.957L21.4018 16.0786H24.1346L24.3905 17.3088ZM22.0147 14.3915L23.1351 11.2996L23.7809 14.3915H22.0147ZM13.052 9.0754L11.2913 17.3088H9.16044L10.9233 9.0754H13.052Z" fill="#0B3E99"/>
          </g>
          <defs>
            <clipPath id="clip0_252_1448">
              <rect width="26.361" height="26.361" fill="white"/>
            </clipPath>
          </defs>
        </svg>
      ),
      message: `* 비자 평균 ${Math.floor(baseAverage.visa_avg / 10000)}만원`
    },
    {
      id: "TUITION",
      title: "등록금",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M19.1484 14.3055V9.18965L12.2805 12.9138C12.046 13.049 11.7981 13.1166 11.5367 13.1166C11.2759 13.1166 11.026 13.0487 10.787 12.9129L4.21806 9.3242C4.07902 9.24091 3.97651 9.14224 3.91051 9.02819C3.84452 8.91414 3.81152 8.78792 3.81152 8.64953C3.81152 8.51113 3.84452 8.38491 3.91051 8.27086C3.97651 8.15681 4.07902 8.05814 4.21806 7.97485L10.7861 4.3958C10.9027 4.33044 11.0228 4.28175 11.1465 4.24971C11.2695 4.21768 11.3986 4.20166 11.5338 4.20166C11.669 4.20166 11.7981 4.21832 11.9211 4.25164C12.0441 4.28495 12.1639 4.33589 12.2805 4.40445L19.6972 8.42175C19.8285 8.48839 19.9301 8.58449 20.0018 8.71007C20.0736 8.83565 20.1095 8.97085 20.1095 9.11565V14.3055C20.1095 14.4413 20.0633 14.5553 19.9711 14.6476C19.8788 14.7399 19.7648 14.786 19.6289 14.786C19.4931 14.786 19.3787 14.7399 19.2858 14.6476C19.1929 14.5553 19.1471 14.4413 19.1484 14.3055ZM10.787 17.5529L6.57366 15.2713C6.32698 15.1317 6.13092 14.9388 5.98548 14.6928C5.84004 14.4487 5.76732 14.1844 5.76732 13.8999V10.9129L10.787 13.6356C11.0215 13.7708 11.2695 13.8384 11.5309 13.8384C11.7917 13.8384 12.0415 13.7705 12.2805 13.6346L17.3002 10.9119V13.9018C17.3002 14.1901 17.2275 14.456 17.0821 14.6995C16.9366 14.9417 16.7409 15.1326 16.4949 15.2723L12.2805 17.5529C12.1626 17.6202 12.0415 17.6708 11.9173 17.7048C11.793 17.7388 11.6651 17.7557 11.5338 17.7557C11.4024 17.7557 11.2746 17.7388 11.1503 17.7048C11.026 17.6708 10.9049 17.6202 10.787 17.5529Z" fill="#0B3E99"/>
        </svg>
      ),
      message: ""
    }
  ]

  const inputRefs = useRef([]);

  const createPayload = () => {
    const raw = getRawValues();

    const parseAmount = (val) => {
      if (val === null || val === undefined || val === "") return null;
      // 숫자 변환, 빈 문자열은 null
      const num = Number(val);
      return isNaN(num) ? null : num;
    };

    const baseItems = budgetItems.map(item => ({
      type: item.id,
      amount: parseAmount(raw[item.id]),
      currency: currencyValues[item.id] || "KRW",
    }));

    const spendingDefault = spendingItems.map(item => ({
      type: item.id,
      amount: parseAmount(raw[item.id]),
    }));

    const spendingCustom = customSpendingItems.map((item, index) => ({
      type: "ETC",
      custom_name: item.title,
      amount: parseAmount(raw[`CUSTOM_${index}`]),
    }));

    return {
      base_budget: {
        items: baseItems,
      },
      living_budget: {
        total_amount: parseAmount(raw["monthlyLiving"]),
        items: [...spendingDefault, ...spendingCustom],
      },
    };
  };

  const onClick = async () => {
    const payload = createPayload();

    // 필수 입력값 체크
    const requiredFields = [
      payload.base_budget.items.find(i => i.type === "FLIGHT")?.amount,
      payload.base_budget.items.find(i => i.type === "INSURANCE")?.amount,
      payload.base_budget.items.find(i => i.type === "VISA")?.amount,
      payload.base_budget.items.find(i => i.type === "TUITION")?.amount,
      payload.living_budget.total_amount
    ];
    const requiredNames = ["항공권", "보험료", "비자", "등록금", "한달 생활비"];
    const missing = requiredFields.map((v, idx) => v === null ? requiredNames[idx] : null).filter(Boolean);
    if (missing.length > 0) {
      setShowModal(true);
      setModalMissing(missing);
      return;
    }

    try {
      // 1) GET이 성공하면 예산이 존재하므로 → PUT 업데이트
      await BudgetAPI.getBudget();
      const res = await BudgetAPI.updateBudget(payload);
      //console.log("put:", res);
      // 수정 후 total_budget_value만 다시 fetch
      const latest = await BudgetAPI.getBudget();
      if (latest.total_budget_value) {
        setTotalBudgetValue({
          krw: latest.total_budget_value.krw,
          converted: latest.total_budget_value.converted
        });
      }
    } catch (e) {
      // 2) GET 실패 → 예산 없음 → POST 생성
      try {
        const res = await BudgetAPI.createBudget(payload);
        //console.log("post:", res);
        // 생성 후 total_budget_value만 다시 fetch
        const latest = await BudgetAPI.getBudget();
        if (latest.total_budget_value) {
          setTotalBudgetValue({
            krw: latest.total_budget_value.krw,
            converted: latest.total_budget_value.converted
          });
        }
      } catch (e2) {
        console.error("예산 생성 실패:", e2);
        alert("예산 저장 중 오류가 발생했습니다.");
      }
    }
  };

  const handleBudgetChange = (itemId) => (e) => {
    const value = e.target.value;
    // 숫자, 콤마, 소수점만 허용
    if (/^[\d,\.]*$/.test(value)) {
      // 콤마 제거 후 숫자만 추출
      const numericValue = value.replace(/,/g, '');
      // 숫자로 변환
      const numberVal = Number(numericValue);
      // 값이 너무 크면 업데이트 막기
      if (numberVal > MAX_INT) {
        alert("최대 입력 가능 금액은 2,147,483,647원입니다.");
        return;
      }
      // 소수점 처리: 소수점이 있으면 정수부와 소수부 분리
      const parts = numericValue.split('.');
      // 정수부에 천 단위 콤마 추가
      if (parts[0]) {
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      // 소수점이 있으면 다시 결합
      const formattedValue = parts.join('.');
      setBudgetValues(prev => ({
        ...prev,
        [itemId]: formattedValue
      }));
    }
  };

  const handleCustomNameChange = (index) => (e) => {
    const value = e.target.value.trim();
    // 현재 입력 중인 index를 제외한 기존 커스텀 네임 목록
    const existingNames = customSpendingItems.map((item, i) => i !== index && item.title.trim()).filter(Boolean);
    if (existingNames.includes(value)) {
      alert("이미 존재하는 항목 이름입니다.");
      return;
    }
    setCustomSpendingItems(prev => {
      const copy = [...prev];
      copy[index].title = value;
      return copy;
    });
  };

  const addCustomSpendingItem = () => {
    const newItem = {
      title: "",
      isNew: true,
    };
    setCustomSpendingItems(prev => [...prev, newItem]);
  };

  const handleKeyDown = (currentIndex) => (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextIndex = currentIndex + 1;
      if (inputRefs.current[nextIndex]) {
        inputRefs.current[nextIndex].focus();
      }
    }
  };

  const removeCustomItem = (index) => {
    setCustomSpendingItems(prev => prev.filter((_, i) => i !== index));

    setBudgetValues(prev => {
      const updated = {...prev};
      delete updated[`CUSTOM_${index}`];

      // CUSTOM index 재정렬
      const newCustomKeys = {};
      customSpendingItems.forEach((_, i) => {
        if (i < index) {
          newCustomKeys[`CUSTOM_${i}`] = prev[`CUSTOM_${i}`];
        } else if (i > index) {
          newCustomKeys[`CUSTOM_${i-1}`] = prev[`CUSTOM_${i}`];
        }
      });

      return { 
        ...updated,
        ...newCustomKeys 
      };
    });
  };

  // 백엔드 전송용: 콤마 제거한 순수 숫자값, 빈값은 null로 변환
  const getRawValues = () => {
    const rawValues = {};
    Object.keys(budgetValues).forEach(key => {
      const val = budgetValues[key];
      if (val === "") {
        rawValues[key] = null;
      } else {
        rawValues[key] = val.replace(/,/g, '');
      }
    });
    return rawValues;
  };

  const monthlyStart = budgetItems.length; // 4
  const livingStart = monthlyStart + 1; // 5
  const spendingStart = livingStart + spendingItems.length; // 5 + 6 = 11

  return (
    <Wrapper>
      {showModal && (
        <Modal
          isOpen={showModal}
          content="필수항목을 입력해 주세요."
          subtext={modalMissing.join(", ")}
          actionText="닫기"
          showCancelButton={false}
          onClose={() => setShowModal(false)}
        />
      )}
      <p className="page">예산안</p>
      <Container>
        <Title>
          <h2>기본 파견비 입력</h2>
          <span className="body1 red" >*</span>
        </Title>
        <Container1>
          {budgetItems.map((item, index) => (
            <Box1 key={item.id}>
              <Tag>
                {item.icon}
                <h3>{item.title}</h3>
              </Tag>
              <Inputfield 
                ref={(el) => (inputRefs.current[index] = el)}
                customStyle={BudgetInputStyle}
                value={budgetValues[item.id] || ""}
                onChange={handleBudgetChange(item.id)}
                onKeyDown={handleKeyDown(index)}
                placeholder="금액 입력"
              />
              <Dropdown 
                placeholder="화폐" 
                options={currencyDropdownOptions}
                defaultValue="KRW"
                value={currencyValues[item.id]}   // GET 이후 값 반영!
                onSelect={(option) =>
                  setCurrencyValues((prev) => ({
                    ...prev,
                    [item.id]: option.value,
                  }))
                }
              />
              <p className="body1">{item.message}</p>
            </Box1>
          ))}
        </Container1>
        <h2 className="title">생활비 입력</h2>
        <Container2>
          <TitleBox>
            <div>
              <span className="body1">한달 생활비 </span> 
              <span className="body1 red" >*</span>
            </div>
            <span className="body1 red" >* {livingAverage.country}의 평균 교통비는 {Math.floor(livingAverage.transit_avg / 10000)}만원, 식비는 {Math.floor(livingAverage.food_avg / 10000)}만원 입니다. (1달 기준)</span>
          </TitleBox>
          <CostInput>
            <Inputfield 
              ref={(el) => (inputRefs.current[budgetItems.length] = el)}
              value={budgetValues["monthlyLiving"] === null || budgetValues["monthlyLiving"] === undefined ? "" : budgetValues["monthlyLiving"]}
              onChange={handleBudgetChange("monthlyLiving")}
              onKeyDown={handleKeyDown(budgetItems.length)}
              placeholder="금액 입력"
              customStyle={LivingInputStyle}
            />
            <span className="body1">원</span>
          </CostInput>
          <span className="body1 title2">세부 지출 계획 항목</span> 
          <Flex>
            {spendingItems.map((item, index) => {
              const baseIndex = budgetItems.length + 1;
              const amountIndex = baseIndex + index;
              return (
                <Box2 key={item.id}>
                  <Inputfield 
                    customStyle={SpendingInputStyle} 
                    defaultValue={item.title} 
                    readOnly
                  />
                  <CostInput>
                    <Inputfield 
                      ref={(el) => (inputRefs.current[amountIndex] = el)}
                      value={budgetValues[item.id] || ""}
                      onChange={handleBudgetChange(item.id)}
                      onKeyDown={handleKeyDown(amountIndex)}
                      placeholder="금액 입력"
                      customStyle={LivingInputStyle}
                    />
                    <span className="body1">원</span>
                  </CostInput>
                </Box2>
              );
            })}
            {customSpendingItems.map((item, index) => {
              const keyName = `CUSTOM_${index}`;
              const nameIndex = spendingStart + (index * 2);
              const amountIndex = nameIndex + 1;

              return (
                <Box2 key={index}>
                  <Inputfield
                    customStyle={SpendingInputStyle}
                    value={item.title}
                    onChange={item.isNew ? handleCustomNameChange(index) : undefined}  // 수정 제어
                    readOnly={!item.isNew}                                             // 기존 커스텀 readOnly
                    ref={(el) => (inputRefs.current[nameIndex] = el)}
                    onKeyDown={handleKeyDown(nameIndex)}
                    placeholder="항목 입력"
                  />
                  <CostInput>
                    <Inputfield
                      ref={(el) => (inputRefs.current[amountIndex] = el)}
                      value={budgetValues[keyName] || ""}
                      onChange={handleBudgetChange(keyName)}
                      onKeyDown={handleKeyDown(amountIndex)}
                      placeholder="금액 입력"
                      customStyle={LivingInputStyle}
                    />
                    <span className="body1">원</span>
                  </CostInput>
                  <DeleteButton onClick={() => removeCustomItem(index)}>
                    ✕
                  </DeleteButton>
                </Box2>
              );
            })}
          </Flex>
        </Container2>
      </Container>
      <svg className="plus" onClick={addCustomSpendingItem} xmlns="http://www.w3.org/2000/svg" width="29" height="29" viewBox="0 0 29 29" fill="none">
        <g clipPath="url(#clip0_254_5589)">
          <path d="M14.0592 0C6.29456 0 0 6.29456 0 14.0592C0 21.8243 6.29456 28.1184 14.0592 28.1184C21.8243 28.1184 28.1184 21.8243 28.1184 14.0592C28.1184 6.29456 21.8243 0 14.0592 0ZM14.0592 26.3887C7.27607 26.3887 1.7574 20.8423 1.7574 14.0591C1.7574 7.27601 7.27607 1.75734 14.0592 1.75734C20.8423 1.75734 26.361 7.27604 26.361 14.0591C26.361 20.8422 20.8423 26.3887 14.0592 26.3887ZM20.2101 13.1805H14.9379V7.90829C14.9379 7.42325 14.5442 7.02959 14.0592 7.02959C13.5741 7.02959 13.1805 7.42325 13.1805 7.90829V13.1805H7.90829C7.42325 13.1805 7.02959 13.5741 7.02959 14.0592C7.02959 14.5442 7.42325 14.9379 7.90829 14.9379H13.1805V20.2101C13.1805 20.6951 13.5741 21.0888 14.0592 21.0888C14.5442 21.0888 14.9379 20.6951 14.9379 20.2101V14.9379H20.2101C20.6951 14.9379 21.0888 14.5442 21.0888 14.0592C21.0888 13.5741 20.6951 13.1805 20.2101 13.1805Z" fill="#115BCA"/>
        </g>
        <defs>
          <clipPath id="clip0_254_5589">
            <rect width="28.1184" height="28.1184" fill="white"/>
          </clipPath>
        </defs>
      </svg>
      <SquareButton onClick={onClick}>
        <span className="h2">저장하기</span>
      </SquareButton>
      <Bottom>
        <Center>
          <h3 className="dblue title">총 예상 비용</h3>
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 24 18" fill="none">
              <path d="M7.28481 14.3132L2.3973 9.42573C2.13394 9.16237 1.77675 9.01442 1.40431 9.01442C1.03186 9.01442 0.674671 9.16237 0.411312 9.42573C0.147953 9.68909 0 10.0463 0 10.4187C0 10.6031 0.0363238 10.7858 0.106897 10.9561C0.17747 11.1265 0.28091 11.2813 0.411312 11.4117L6.29886 17.2993C6.84817 17.8486 7.73553 17.8486 8.28485 17.2993L23.1868 2.3973C23.4502 2.13394 23.5981 1.77675 23.5981 1.40431C23.5981 1.03186 23.4502 0.674671 23.1868 0.411312C22.9235 0.147954 22.5663 0 22.1938 0C21.8214 0 21.4642 0.147954 21.2008 0.411312L7.28481 14.3132Z" fill="#115BCA"/>
            </svg>
            <h3>
              <span className="dblue">{totalAverage.country} 교환학생 </span>
              <span>기준, 1학기 총 지출 비용은 </span>
              <span className="dblue">최저 약 {Math.floor(totalAverage.min_krw / 10000)}만원({currencySymbolMap[totalAverage.currency] || totalAverage.currency}{totalAverage.min_converted})</span>
              <span>, </span>
              <span className="dblue">최대 약 {Math.floor(totalAverage.max_krw / 10000)}만원({currencySymbolMap[totalAverage.currency] || totalAverage.currency}{totalAverage.max_converted})</span>
              <span>입니다.</span>
            </h3>
          </div>
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="18" viewBox="0 0 24 18" fill="none">
              <path d="M7.28481 14.3132L2.3973 9.42573C2.13394 9.16237 1.77675 9.01442 1.40431 9.01442C1.03186 9.01442 0.674671 9.16237 0.411312 9.42573C0.147953 9.68909 0 10.0463 0 10.4187C0 10.6031 0.0363238 10.7858 0.106897 10.9561C0.17747 11.1265 0.28091 11.2813 0.411312 11.4117L6.29886 17.2993C6.84817 17.8486 7.73553 17.8486 8.28485 17.2993L23.1868 2.3973C23.4502 2.13394 23.5981 1.77675 23.5981 1.40431C23.5981 1.03186 23.4502 0.674671 23.1868 0.411312C22.9235 0.147954 22.5663 0 22.1938 0C21.8214 0 21.4642 0.147954 21.2008 0.411312L7.28481 14.3132Z" fill="#115BCA"/>
            </svg>
            <h3>
              <span>화연이에연 님의 1학기 미국 캘리포니아 파견 </span>
              <span className="dblue">예상 총 금액은 약 {Math.floor(totalBudgetValue.krw / 10000)}만원({currencySymbolMap[totalAverage.currency] || totalAverage.currency}{totalBudgetValue.converted})</span>
              <span>입니다.</span>
            </h3>
          </div>
        </Center>
      </Bottom>
    </Wrapper>
  );
}

export default BudgetPage;

const Wrapper = styled.div`
  width: 100vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;

  .page {
    width: 100%;

    padding-left: 6.87rem;
    margin-bottom: 1.87rem;

    text-align: left;
  }

  .plus {
    margin: 2.37rem 0 1.54rem 0;

    &:hover {
        cursor: pointer;
        filter: brightness(0.9);
    }
  }

  .red {
    color: var(--red);
  }
`

const Title = styled.div`
  width: 100%;

  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  margin-bottom: 1.4rem;

  gap: 0.3rem;

  text-align: left;
  color: var(--deep-blue);
`

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .title {
    width: 100%;
    margin-bottom: 1.4rem;

    text-align: left;
    color: var(--deep-blue);
  }
`

const Container1 = styled.div`
  width: 100%; 
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  margin-bottom: 3.12rem;
  padding-left: 2rem;

  gap: 1.1em;
`

const Box1 = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;

  gap: 1.48rem;

  .body1{
    display: flex;
    justify-content: flex-start;
    width: 9rem;
    color: var(--red);
  }
`

const Tag = styled.div`
  width: 6rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  gap: 0.4rem;

  h3{
    color: var(--deep-blue);
  }
`

const Container2 = styled.div`
  width: 85%; 
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;

  .title2{
    margin-top: 2rem;
    margin-bottom: 1.1rem;
  }
`

const TitleBox = styled.div`
  width: 100%;

  display: flex;
  justify-content: space-between;

  margin-bottom: 1.1rem;
`

const CostInput = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  position: relative;
  
  span.body1{
    position: absolute;
    right: 1rem;
  }
`

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: var(--red);
  font-size: 1.2rem;
  padding: 0 0.5rem;
  position: absolute;
  top: 50%;
  right: -2.2rem;
  transform: translateY(-50%);

  &:hover {
    cursor: pointer;
    filter: brightness(0.9);
  }
`;

const Flex = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`

const Box2 = styled.div`
  width: 100%;
  display: flex;
  gap: 0.8rem;
  position: relative;
`

const Bottom = styled.div`
  width: 100%;
  height: 10.5rem;

  display: flex;
  justify-content: center;
  align-items: center;

  margin-top: 3.12rem;

  background: #E0F0FF;

`

const Center = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  
  gap: 0.44rem;

  .dblue {
    color: var(--deep-blue);
  }

  .title{
    margin: 0 0 0.68rem 2.56rem;
  }

  div{
    display: flex;
    align-items: center;

    svg{
      margin-right: 1.1rem;
    }
  }
`