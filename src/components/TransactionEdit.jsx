import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import styled from "styled-components";
import Dropdown from "./Dropdown";
import CircleButton from "./button/CircleButton";
import Button from "./button/SquareButton";

const MAX_INT = 2147483647;

const TransactionEdit = forwardRef(
  ({ initialData = null, onSave, onDelete, onClose }, ref) => {
    const [entryType, setEntryType] = useState(
      initialData?.entry_type || "EXPENSE"
    );

    const [formData, setFormData] = useState({
      date: initialData?.date || new Date().toISOString().split("T")[0],
      payment_method: initialData?.payment_method || "CARD",
      category: initialData?.category || "FOOD",
      amount: initialData?.amount || "",
      currency_code: initialData?.currency_code || "USD",
    });

    const categoryOptions = [
      { value: "FOOD", label: "식비" },
      { value: "HOUSING", label: "주거비" },
      { value: "TRANSPORT", label: "교통비" },
      { value: "SHOPPING", label: "쇼핑비" },
      { value: "TRAVEL", label: "여행비" },
      { value: "STUDY_MATERIALS", label: "교재비" },
      { value: "ALLOWANCE", label: "용돈" },
      { value: "ETC", label: "기타" },
    ];

    // 결제수단 옵션은 : 지출일 때만 ?
    const paymentMethodOptions = [
      { value: "CARD", label: "카드" },
      { value: "CASH", label: "현금" },
    ];

    const currencyOptions = [
      { value: "USD", label: "달러 ($)" },
      { value: "KRW", label: "원화 (₩)" },
      { value: "EUR", label: "유로 (€)" },
      { value: "JPY", label: "엔화 (¥)" },
      { value: "GBP", label: "파운드 (£)" },
      { value: "CNY", label: "위안화 (¥)" },
      { value: "CAD", label: "캐나다 달러 (C$)" },
      { value: "TWD", label: "대만 달러 (NT$)" },
    ];

    const handleInputChange = (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = () => {
      if (!formData.date || !formData.category || !formData.amount) {
        alert("모든 필수 항목을 입력해주세요.");
        return;
      }

      // 백엔드 전송용: 콤마 제거한 순수 숫자값, 빈값은 null로 변환
      const rawAmount = formData.amount === "" ? null : formData.amount.replace(/,/g, '');

      // API 요청용 데이터 준비
      const requestData = {
        entry_type: entryType,
        date: formData.date,
        category: formData.category,
        amount: rawAmount ? parseFloat(rawAmount) : null,
        currency_code: formData.currency_code,
      };
      if (entryType === "EXPENSE") {
        requestData.payment_method = formData.payment_method;
      }

      if (onSave) {
        onSave(requestData);
      }

      // 등록 때만 초기화 (모달 아닐 때)
      if (!initialData && !onClose) {
        setFormData({
          date: new Date().toISOString().split("T")[0],
          payment_method: "CARD",
          category: "FOOD",
          amount: "",
          currency_code: "USD",
        });
        setEntryType("EXPENSE");
      }
    };

    // 금액 입력 핸들러
    const handleAmountChange = (e) => {
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
        setFormData((prev) => ({
          ...prev,
          amount: formattedValue,
        }));
      }
    };

    // 외부에서 handleSave 호출할수ㅇ있ㄱ게함
    useImperativeHandle(ref, () => ({
      handleSave,
    }));

    const handleDelete = () => {
      if (window.confirm("정말 삭제하시겠습니까?")) {
        onDelete(initialData?.id);
      }
    };

    return (
      <Container>
        {/* 지출/수입 토글 */}
        <ToggleContainer>
          <CircleButton
            onClick={() => setEntryType("EXPENSE")}
            customStyle={`
            background: ${
              entryType === "EXPENSE" ? "var(--blue)" : "var(--white)"
            };
            color: ${entryType === "EXPENSE" ? "var(--white)" : "var(--black)"};
            border: ${
              entryType === "EXPENSE" ? "none" : "1px solid var(--light-gray)"
            };
            padding: 0.5rem 1.40625rem;
            gap: 0.5rem;
            font-size: 0.84375rem;
            width: 6.79688rem;
            height: 2.48438rem;
            font-height: 2.48438rem;
          `}
          >
            <ButtonWrapper>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="3" viewBox="0 0 16 3" fill="none">
                <path d="M0 1.36719C0 0.6125 0.6125 0 1.36719 0H14.4922C14.8548 0 15.2025 0.144043 15.4589 0.40044C15.7153 0.656837 15.8594 1.00459 15.8594 1.36719C15.8594 1.72979 15.7153 2.07754 15.4589 2.33394C15.2025 2.59033 14.8548 2.73438 14.4922 2.73438H1.36719C0.6125 2.73438 0 2.12188 0 1.36719Z" fill={entryType === "EXPENSE" ? "var(--white)" : "var(--black)"}/>
              </svg>
              <span>지출</span>
            </ButtonWrapper>
          </CircleButton>
          <CircleButton
            onClick={() => setEntryType("INCOME")}
            customStyle={`
            background: ${
              entryType === "INCOME" ? "var(--blue)" : "var(--white)"
            };
            color: ${entryType === "INCOME" ? "var(--white)" : "var(--black)"};
            border: ${
              entryType === "INCOME" ? "none" : "1px solid var(--light-gray)"
            };
            padding: 0.70313rem 1.7rem;
            gap: 0.5rem;
            font-size: 0.84375rem;
            width: 6.79688rem;
            height: 2.48438rem;
          `}
          >
            <ButtonWrapper>
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 17 17" fill="none">
                <path d="M9.43359 1.23047C9.43359 0.904128 9.30396 0.591153 9.0732 0.360396C8.84244 0.129638 8.52947 0 8.20312 0C7.87678 0 7.56381 0.129638 7.33305 0.360396C7.10229 0.591153 6.97266 0.904128 6.97266 1.23047V6.97266H1.23047C0.904128 6.97266 0.591153 7.10229 0.360396 7.33305C0.129638 7.56381 0 7.87678 0 8.20312C0 8.52947 0.129638 8.84244 0.360396 9.0732C0.591153 9.30396 0.904128 9.43359 1.23047 9.43359H6.97266V15.1758C6.97266 15.5021 7.10229 15.8151 7.33305 16.0459C7.56381 16.2766 7.87678 16.4062 8.20312 16.4062C8.52947 16.4062 8.84244 16.2766 9.0732 16.0459C9.30396 15.8151 9.43359 15.5021 9.43359 15.1758V9.43359H15.1758C15.5021 9.43359 15.8151 9.30396 16.0459 9.0732C16.2766 8.84244 16.4062 8.52947 16.4062 8.20312C16.4062 7.87678 16.2766 7.56381 16.0459 7.33305C15.8151 7.10229 15.5021 6.97266 15.1758 6.97266H9.43359V1.23047Z" fill={entryType === "INCOME" ? "var(--white)" : "var(--black)"}/>
              </svg>
              <span>수입</span>
            </ButtonWrapper>
          </CircleButton>
        </ToggleContainer>

        {/* 입력 폼 */}
        <FormContainer>
          {/* 1행: 발생일 + 결제수단 */}
          <FormRow1>
            <FormGroup style={{ flex: 1 }}>
              <LabelRow>
                <Label>발생일</Label>
              </LabelRow>
              <DateInputWrapper>
                <DateInput
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 28 28" fill="none">
                  <path d="M9.6106 15.8294C9.98544 15.8294 10.3449 15.6804 10.61 15.4154C10.875 15.1503 11.0239 14.7909 11.0239 14.416C11.0239 14.0412 10.875 13.6817 10.61 13.4166C10.3449 13.1516 9.98544 13.0027 9.6106 13.0027C9.23576 13.0027 8.87627 13.1516 8.61122 13.4166C8.34617 13.6817 8.19727 14.0412 8.19727 14.416C8.19727 14.7909 8.34617 15.1503 8.61122 15.4154C8.87627 15.6804 9.23576 15.8294 9.6106 15.8294ZM9.6106 19.7867C9.98544 19.7867 10.3449 19.6378 10.61 19.3727C10.875 19.1077 11.0239 18.7482 11.0239 18.3734C11.0239 17.9985 10.875 17.639 10.61 17.374C10.3449 17.1089 9.98544 16.96 9.6106 16.96C9.23576 16.96 8.87627 17.1089 8.61122 17.374C8.34617 17.639 8.19727 17.9985 8.19727 18.3734C8.19727 18.7482 8.34617 19.1077 8.61122 19.3727C8.87627 19.6378 9.23576 19.7867 9.6106 19.7867ZM14.9813 14.416C14.9813 14.7909 14.8324 15.1503 14.5673 15.4154C14.3023 15.6804 13.9428 15.8294 13.5679 15.8294C13.1931 15.8294 12.8336 15.6804 12.5686 15.4154C12.3035 15.1503 12.1546 14.7909 12.1546 14.416C12.1546 14.0412 12.3035 13.6817 12.5686 13.4166C12.8336 13.1516 13.1931 13.0027 13.5679 13.0027C13.9428 13.0027 14.3023 13.1516 14.5673 13.4166C14.8324 13.6817 14.9813 14.0412 14.9813 14.416ZM13.5679 19.7867C13.9428 19.7867 14.3023 19.6378 14.5673 19.3727C14.8324 19.1077 14.9813 18.7482 14.9813 18.3734C14.9813 17.9985 14.8324 17.639 14.5673 17.374C14.3023 17.1089 13.9428 16.96 13.5679 16.96C13.1931 16.96 12.8336 17.1089 12.5686 17.374C12.3035 17.639 12.1546 17.9985 12.1546 18.3734C12.1546 18.7482 12.3035 19.1077 12.5686 19.3727C12.8336 19.6378 13.1931 19.7867 13.5679 19.7867ZM18.9386 14.416C18.9386 14.7909 18.7897 15.1503 18.5247 15.4154C18.2596 15.6804 17.9001 15.8294 17.5253 15.8294C17.1504 15.8294 16.7909 15.6804 16.5259 15.4154C16.2608 15.1503 16.1119 14.7909 16.1119 14.416C16.1119 14.0412 16.2608 13.6817 16.5259 13.4166C16.7909 13.1516 17.1504 13.0027 17.5253 13.0027C17.9001 13.0027 18.2596 13.1516 18.5247 13.4166C18.7897 13.6817 18.9386 14.0412 18.9386 14.416Z" fill="#A5A5A5"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M9.04567 3.67468C9.27057 3.67468 9.48626 3.76403 9.64529 3.92306C9.80432 4.08209 9.89367 4.29778 9.89367 4.52268V5.37068H17.243V4.52268C17.243 4.29778 17.3323 4.08209 17.4914 3.92306C17.6504 3.76403 17.8661 3.67468 18.091 3.67468C18.3159 3.67468 18.5316 3.76403 18.6906 3.92306C18.8497 4.08209 18.939 4.29778 18.939 4.52268V5.37973C19.1109 5.38425 19.271 5.39254 19.4195 5.4046C19.8492 5.43852 20.2517 5.51541 20.6327 5.70988C21.2179 6.00801 21.6937 6.48377 21.9918 7.06895C22.1863 7.44998 22.2632 7.8525 22.2971 8.28215C22.331 8.69485 22.331 9.19799 22.331 9.8029V18.4638C22.331 19.0687 22.331 19.5719 22.2971 19.9846C22.2632 20.4142 22.1863 20.8167 21.9918 21.1978C21.694 21.7828 21.2186 22.2585 20.6339 22.5568C20.2517 22.7513 19.8492 22.8282 19.4195 22.8621C19.0068 22.896 18.5037 22.896 17.8999 22.896H9.23788C8.63297 22.896 8.12983 22.896 7.71713 22.8621C7.28748 22.8282 6.88496 22.7513 6.50393 22.5568C5.91909 22.2593 5.44337 21.7844 5.14486 21.2C4.95039 20.8179 4.8735 20.4153 4.83958 19.9857C4.80566 19.573 4.80566 19.0699 4.80566 18.4661V9.8029C4.80566 9.19799 4.80566 8.69485 4.83958 8.28215C4.8735 7.8525 4.95039 7.44998 5.14486 7.06895C5.44299 6.48377 5.91875 6.00801 6.50393 5.70988C6.88496 5.51541 7.28748 5.43852 7.71713 5.4046C7.86563 5.39254 8.0258 5.38425 8.19767 5.37973V4.52268C8.19767 4.41132 8.2196 4.30105 8.26222 4.19817C8.30483 4.09528 8.3673 4.0018 8.44604 3.92306C8.52478 3.84431 8.61827 3.78185 8.72115 3.73923C8.82404 3.69662 8.93431 3.67468 9.04567 3.67468ZM20.635 11.5894H6.50167V18.4299C6.50167 19.0766 6.50167 19.5119 6.52993 19.8455C6.55594 20.1711 6.60343 20.326 6.65544 20.4278C6.79112 20.6946 7.00707 20.9106 7.27391 21.0463C7.37567 21.0983 7.53057 21.1458 7.85507 21.1718C8.18975 21.1989 8.62393 21.2 9.2718 21.2H17.8649C18.5116 21.2 18.9469 21.2 19.2805 21.1718C19.6061 21.1458 19.761 21.0983 19.8628 21.0463C20.1291 20.9107 20.3457 20.6942 20.4812 20.4278C20.5332 20.326 20.5807 20.1711 20.6067 19.8455C20.6339 19.5119 20.635 19.0766 20.635 18.4299V11.5894ZM11.8723 7.91469C11.6474 7.91469 11.4317 8.00403 11.2727 8.16306C11.1137 8.32209 11.0243 8.53778 11.0243 8.76269C11.0243 8.98759 11.1137 9.20328 11.2727 9.36231C11.4317 9.52134 11.6474 9.61069 11.8723 9.61069H15.2643C15.4892 9.61069 15.7049 9.52134 15.864 9.36231C16.023 9.20328 16.1123 8.98759 16.1123 8.76269C16.1123 8.53778 16.023 8.32209 15.864 8.16306C15.7049 8.00403 15.4892 7.91469 15.2643 7.91469H11.8723Z" fill="#A5A5A5"/>
                </svg>  
              </DateInputWrapper>
            </FormGroup>

            {/* 결제수단 (지출일 때만!) */}
            {entryType === "EXPENSE" && (
              <FormGroup style={{ flex: 1 }}>
                <LabelRow>
                  <Label>결제수단</Label>
                  <Note>*신용카드의 경우 예상환율 적용</Note>
                </LabelRow>
                <Dropdown
                  options={paymentMethodOptions}
                  value={formData.payment_method}
                  placeholder={paymentMethodOptions[0].label}
                  onSelect={(option) =>
                    handleInputChange("payment_method", option.value)
                  }
                  customStyle={`
                min-width: 100%;
                  height: 2.53125rem;
                  font-size: 0.84375rem;
                  text-align: center;
                `}
                />
              </FormGroup>
            )}
          </FormRow1>

          {/* 2행: 카테고리 + 금액 + 화폐단위 */}
          <FormRow2>
            <FormGroup style={{ flex: 1 }}>
              <LabelRow>
                <Label>카테고리</Label>
              </LabelRow>
              <Dropdown
                options={categoryOptions}
                value={formData.category}
                placeholder={categoryOptions[0].label}
                onSelect={(option) =>
                  handleInputChange("category", option.value)
                }
                customStyle={`
                height: 2.53125rem;
                font-size: 0.84375rem;
                color: var(--blue);
                text-align: center;
              `}
              />
            </FormGroup>

            <FormGroup style={{ flex: 2 }}>
              <Label>&nbsp;</Label>
              <AmountInput
                type="text"
                placeholder="금액을 입력하세요."
                value={formData.amount}
                onChange={handleAmountChange}
              />
            </FormGroup>

            <FormGroup style={{ flex: 1 }}>
              <LabelRow>
                <Label>화폐단위</Label>
              </LabelRow>
              <Dropdown
                options={currencyOptions}
                value={formData.currency_code}
                placeholder={currencyOptions[0].label}
                onSelect={(option) =>
                  handleInputChange("currency_code", option.value)
                }
                customStyle={`
                height: 2.53125rem;
                font-size: 0.84375rem;
                text-align: center;
              `}
              />
            </FormGroup>
          </FormRow2>
        </FormContainer>

        {/* 등록 모드일 때만 등록하기 버튼 표시 (모달 X) */}
        {!initialData && !onClose && (
          <RegisterButtonContainer>
            <Button
              onClick={handleSave}
              customStyle={`
              width: 17.4375rem;
              height: 3.375rem;
              border-radius: 1.078125rem;
              font-size: 1.3125rem;
              background: var(--blue);
              color: var(--white);
            `}
            >
              <span style={{ color: "var(--white)" }}>등록하기</span>
            </Button>
          </RegisterButtonContainer>
        )}
      </Container>
    );
  }
);

export default TransactionEdit;

//
// ————————————————————— 스타일링 —————————————————————

const Container = styled.div`
  width: 100%;
  padding: 1rem;
  background: var(--white);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ButtonWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;

  span{
    font-size: 0.84375rem;
    font-weight: 500;
  }
`;

const IconCircle = styled.div`
  width: 1.23rem;
  height: 1.23rem;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  font-weight: 700;
  color: ${({ $active }) => ($active ? "var(--white)" : "var(--gray)")};
`;

const FormContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormRow1 = styled.div`
  display: flex;
  align-items: flex-end;
  width: 100%;
  gap: 0.5rem;
`;

const FormRow2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr 1fr;
  width: 100%;
  gap: 0.5rem;
`;
const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Label = styled.label`
  color: var(--black);
  font-size: 0.8rem;
  font-weight: 400;
  min-width: fit-content;
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 0.5rem;
`;

const Note = styled.span`
  color: var(--red);
  font-size: 0.6rem;
  font-weight: 400;
  white-space: nowrap;
`;

const DateInputWrapper = styled.div`
  position: relative;
  width: 100%;
  height: 2.53125rem;

  svg{
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    right: 1rem;
  }
`;

const DateInput = styled.input`
  width: 100%;
  height: 100%;
  padding: 0 2.5rem 0 1.5rem;
  border: 1px solid var(--light-gray);
  border-radius: 0.28125rem;
  background: var(--white);
  color: var(--black);
  font-size: 0.84375rem;
  font-weight: 500;

  &:focus {
    outline: none;
    border-color: var(--blue);
  }

  &::-webkit-calendar-picker-indicator {
    opacity: 0;
    position: absolute;
    right: 0;
    width: 100%;
    height: 100%;
    cursor: pointer;
  }
`;

const CalendarIcon = styled.img`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  width: 1.6875rem;
  height: 1.6875rem;
  pointer-events: none;
`;

const AmountInput = styled.input`
  min-width: fit-content;
  height: 2.53125rem;
  padding: 0 1.125rem;

  border: 1px solid var(--light-gray);
  border-radius: 0.28125rem;
  background: #fcfcfc;

  color: var(--black);
  font-size: 0.84375rem;
  font-weight: 500;

  &::placeholder {
    color: #fcfcfc;
  }

  &:focus {
    outline: none;
    border-color: var(--blue);
    background: var(--white);

    &::placeholder {
      color: var(--gray);
    }
  }

  /* 숫자 입력 화살표 제거 */
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* 파폭 */
  appearance: textfield;
  -moz-appearance: textfield;
`;

const ButtonContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
  margin-top: 0.5rem;
`;

const RegisterButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin: 0.5rem 0;
`;