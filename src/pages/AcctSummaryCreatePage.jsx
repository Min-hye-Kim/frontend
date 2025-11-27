import React, { useState, useEffect, useRef } from "react";
import UploadTopbar from "../components/topbar/UploadTopbar";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Inputfield from "../components/Inputfield";
import CategoryCard from "../components/CategoryCard";
import CircleButton from "../components/button/CircleButton";
import { SummariesAPI } from "@/apis";
import { useProfile } from "../hooks";

const AcctSummaryCreatePage = () => {
  const navigate = useNavigate();
  const inputRefs = useRef([]);
  const { profile } = useProfile();
  const [summaryData, setSummaryData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await SummariesAPI.getLedgerSummary();
        const summary = res.data;

        setSummaryData(summary);
        setCategoryData(summary.categories || []);

      } catch (err) {
        console.error("요약본/카테고리 불러오기 실패:", err);
      }
    };

    fetchSummary();
  }, []);

  const onMySum = async () => {
    const mySumData = await SummariesAPI.getSnapshot();
    const id = mySumData.data.id;

    navigate(`/summaries/snapshot/${id}`);
  }

  const MAX_INT = 2147483647;
  const [formData, setFormData] = useState({
    monthly_spend_in_korea: "",
    meal_frequency: "",
    dineout_per_week: "",
    coffee_per_week: "",
    smoking_per_day: "",
    drinking_per_week: "",
    shopping_per_month: "",
    culture_per_month: "",
    residence_type: "",
    commute: null, //
    summary_note: "",
  });

  // 월 지출 인풋 전용 핸들러: 숫자, 콤마, 소수점만 허용, 천 단위 콤마 포맷, 최대값 제한
  const handleMonthlySpendChange = (e) => {
    const value = e.target.value;
    if (/^[\d,.]*$/.test(value)) {
      const numericValue = value.replace(/,/g, '');
      const numberVal = Number(numericValue);
      if (numberVal > MAX_INT) {
        alert("최대 입력 가능 금액은 2,147,483,647원입니다.");
        return;
      }
      const parts = numericValue.split('.');
      if (parts[0]) {
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
      }
      const formattedValue = parts.join('.');
      setFormData(prev => ({
        ...prev,
        monthly_spend_in_korea: formattedValue
      }));
    }
  };

  // 백엔드 전송용: 콤마 제거, 빈값은 null
  const getMonthlySpendRawValue = () => {
    const val = formData.monthly_spend_in_korea;
    if (val === "") return null;
    return val.replace(/,/g, '');
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };



  const handleConfirmPublish = async () => {
    try {
      const requestData = {};

      // 필수 필드
      const rawMonthlySpend = getMonthlySpendRawValue();
      if (rawMonthlySpend !== null) {
        requestData.monthly_spend_in_korea = parseInt(rawMonthlySpend);
      }

      // 선택 필드 (값 있을 때만 추가)
      if (formData.meal_frequency) {
        requestData.meal_frequency = formData.meal_frequency;
      }
      if (formData.dineout_per_week) {
        requestData.dineout_per_week = parseInt(formData.dineout_per_week);
      }
      if (formData.coffee_per_week) {
        requestData.coffee_per_week = parseInt(formData.coffee_per_week);
      }
      if (formData.smoking_per_day) {
        requestData.smoking_per_day = parseInt(formData.smoking_per_day);
      }
      if (formData.drinking_per_week) {
        requestData.drinking_per_week = parseInt(formData.drinking_per_week);
      }
      if (formData.shopping_per_month) {
        requestData.shopping_per_month = parseInt(formData.shopping_per_month);
      }
      if (formData.culture_per_month) {
        requestData.culture_per_month = parseInt(formData.culture_per_month);
      }
      if (formData.residence_type) {
        requestData.residence_type = formData.residence_type;
      }
      if (formData.commute !== null && formData.commute !== undefined) {
        requestData.commute = formData.commute;
      }
      if (formData.summary_note) {
        requestData.summary_note = formData.summary_note;
      }
      const response = await SummariesAPI.createSnapshot(requestData);
      if (response && response.data) {
        // 성공하면? AcctSummaryComplete 페이지로 ㄱㄱ
        navigate("/summaries/complete");
      }
    } catch (error) {
      console.error("Error publishing summary:", error);
      if (
        error.message &&
        error.message.includes("이미 세부 프로필이 존재합니다")
      ) {
        onMySum();
      } else {
        alert(error.message || "게시 중 오류가 발생했습니다.");
      }
    }
  };

  const handleEnter = (e, nextIndex) => {
    if (e.key === "Enter") {
      e.preventDefault();

      const nextInput = inputRefs.current[nextIndex];
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  return (
    <>
    <UploadTopbar disabled={!formData.monthly_spend_in_korea} onClick={handleConfirmPublish} />
    <Title>
      <p className="page">내 가계부 요약본</p>
    </Title>
    <PageWrapper>
        <ContentWrapper>   
          {/* ————————————————————— 프로필 ————————————————————— */}
          <ProfileBox>
            <ProfileImage>
              <Flag>
                {profile?.exchange_country && (
                  <img
                    src={`/images/flags/${encodeURIComponent(profile.exchange_country)}.png`}
                    alt={profile.exchange_country}
                  />
                )}
              </Flag>
              <Type $exchangeType={profile?.exchange_type}> {profile?.exchange_type} </Type>
            </ProfileImage>
            <ProfileInfo>
              <p className="body1">
                {profile?.name ?? "User"} / 
                {profile?.gender}
              </p>

              <h2>
                {profile?.exchange_country ?? "Country"} {profile?.exchange_university ?? "University"}
              </h2>

              <p className="body1">
                {profile?.exchange_semester ?? "semester"} ({profile?.exchange_period ?? "period"})
              </p>
            </ProfileInfo>
          </ProfileBox>

          {/* ————————————————————— 세부 프로필 ————————————————————— */}
          <SectionTitle>세부 프로필</SectionTitle>
          <Section>
            <FormGrid>
              <Required>*필수입력</Required>
              <FormRow>
                <Label>한국에서의 월 지출</Label>
                <InputWrapper2>
                  <Inputfield
                    ref={(el) => (inputRefs.current[0] = el)}
                    onKeyDown={(e) => handleEnter(e, 1)}
                    customStyle={`height: 2.3rem; font-size: 0.75rem; padding: 0 1rem;`}
                    placeholder="금액을 입력해주세요"
                    value={formData.monthly_spend_in_korea}
                    onChange={handleMonthlySpendChange}
                  />
                  <p className="body2">원</p>
                </InputWrapper2>
              </FormRow>

              <Optional>* 선택입력</Optional>
              <FormRow>
                <Label>식사</Label>
                <ButtonGroup1>
                  {["1", "2", "3"].map((freq, idx) => (
                    <CircleButton
                      ref={(el) => (inputRefs.current[1 + idx] = el)}
                      onKeyDown={(e) => handleEnter(e, 4)}
                      key={freq}
                      onClick={() => handleInputChange("meal_frequency", freq)}
                      customStyle={`
                      font-size: 0.85rem;
                      height: 2.15625rem;
                      background-color: ${
                        formData.meal_frequency === freq
                          ? "var(--blue, #115BCA)"
                          : "var(--white, #fff)"
                      };
                      color: ${
                        formData.meal_frequency === freq
                          ? "var(--white, #fff)"
                          : "var(--gray, #A5A5A5)"
                      };
                      border: ${
                        formData.meal_frequency === freq
                          ? "none"
                          : "1px solid var(--gray, #A5A5A5)"
                      };
                    `}
                    >
                      하루 {freq}회
                    </CircleButton>
                  ))}
                </ButtonGroup1>
              </FormRow>

              <FormRow>
                <Label>외식 및 배달음식 소비</Label>
                <InputWrapper>
                  <p className="body2">주</p>
                  <Inputfield
                    ref={(el) => (inputRefs.current[4] = el)}
                    onKeyDown={(e) => handleEnter(e, 5)}
                    customStyle={`
                    height: 2.3rem;
                    font-size: 0.75rem;
                    font-weight: 400;
                    padding: 0 2.5rem;
                    text-align: right;
                    `}
                    placeholder=""
                    value={formData.dineout_per_week}
                    onChange={(e) =>
                      handleInputChange("dineout_per_week", e.target.value)
                    }
                  />
                  <p className="body2">회</p>
                </InputWrapper>
              </FormRow>

              <FormRow>
                <Label>커피 등 음료 소비</Label>
                <InputWrapper>
                  <p className="body2">주</p>
                  <Inputfield
                    ref={(el) => (inputRefs.current[5] = el)}
                    onKeyDown={(e) => handleEnter(e, 6)}
                    customStyle={`
                    height: 2.3rem;
                    font-size: 0.75rem;
                    font-weight: 400;
                    padding: 0 2.5rem;
                    text-align: right;
                    `}
                    placeholder=""
                    value={formData.coffee_per_week}
                    onChange={(e) =>
                      handleInputChange("coffee_per_week", e.target.value)
                    }
                  />
                  <p className="body2">회</p>
                </InputWrapper>
              </FormRow>

              <FormRow>
                <Label>흡연</Label>
                <InputWrapper>
                  <p className="body2">하루</p>
                  <Inputfield
                    ref={(el) => (inputRefs.current[6] = el)}
                    onKeyDown={(e) => handleEnter(e, 7)}
                    customStyle={`
                    height: 2.3rem;
                    font-size: 0.75rem;
                    font-weight: 400;
                    padding: 0 2.5rem;
                    text-align: right;
                    `}
                    placeholder=""
                    value={formData.smoking_per_day}
                    onChange={(e) =>
                      handleInputChange("smoking_per_day", e.target.value)
                    }
                  />
                  <p className="body2">회</p>
                </InputWrapper>
              </FormRow>

              <FormRow>
                <Label>음주</Label>
                <InputWrapper>
                  <p className="body2">주</p>
                  <Inputfield
                    ref={(el) => (inputRefs.current[7] = el)}
                    onKeyDown={(e) => handleEnter(e, 8)}
                    customStyle={`
                    height: 2.3rem;
                    font-size: 0.75rem;
                    font-weight: 400;
                    padding: 0 2.5rem;
                    text-align: right;
                    `}
                    placeholder=""
                    value={formData.drinking_per_week}
                    onChange={(e) =>
                      handleInputChange("drinking_per_week", e.target.value)
                    }
                  />
                  <p className="body2">회</p>
                </InputWrapper>
              </FormRow>

              <FormRow>
                <Label>쇼핑</Label>
                <InputWrapper>
                  <p className="body2">월</p>
                  <Inputfield
                    ref={(el) => (inputRefs.current[8] = el)}
                    onKeyDown={(e) => handleEnter(e, 9)}
                    customStyle={`
                    height: 2.3rem;
                    font-size: 0.75rem;
                    font-weight: 400;
                    padding: 0 2.5rem;
                    text-align: right;
                    `}
                    placeholder=""
                    value={formData.shopping_per_month}
                    onChange={(e) =>
                      handleInputChange("shopping_per_month", e.target.value)
                    }
                  />
                  <p className="body2">회</p>
                </InputWrapper>
              </FormRow>

              <FormRow>
                <Label>여가 및 문화생활 소비</Label>
                <InputWrapper>
                  <p className="body2">월</p>
                  <Inputfield
                    ref={(el) => (inputRefs.current[9] = el)}
                    onKeyDown={(e) => handleEnter(e, 10)}
                    customStyle={`
                    height: 2.3rem;
                    font-size: 0.75rem;
                    font-weight: 400;
                    padding: 0 2.5rem;
                    text-align: right;
                    `}
                    placeholder=""
                    value={formData.culture_per_month}
                    onChange={(e) =>
                      handleInputChange("culture_per_month", e.target.value)
                    }
                  />
                  <p className="body2">회</p>
                </InputWrapper>
              </FormRow>

              <FormRow>
                <Label>거주유형</Label>
                <InputWrapper>
                  <Inputfield
                    ref={(el) => (inputRefs.current[10] = el)}
                    onKeyDown={(e) => handleEnter(e, 11)}
                    customStyle={`
                    height: 2.3rem;
                    font-size: 0.75rem;
                    font-weight: 400;
                    padding: 0 1rem;
                  `}
                    type="text"
                    placeholder="거주 유형을 직접 입력해주세요"
                    value={formData.residence_type}
                    onChange={(e) =>
                      handleInputChange("residence_type", e.target.value)
                    }
                  />
                </InputWrapper>
              </FormRow>

              <FormRow>
                <Label>통학 여부</Label>
                <ButtonGroup2>
                  <CircleButton
                    ref={(el) => (inputRefs.current[11] = el)}
                    onKeyDown={(e) => handleEnter(e, 12)}
                    onClick={() => handleInputChange("commute", true)}
                    customStyle={`
                    width: 90%;
                    height: 2.15625rem;
                    font-size: 0.85rem;
                    background-color: ${
                      formData.commute === true
                        ? "var(--blue, #115BCA)"
                        : "var(--white, #fff)"
                    };
                    color: ${
                      formData.commute === true
                        ? "var(--white, #fff)"
                        : "var(--gray, #A5A5A5)"
                    };
                    border: ${
                      formData.commute === true
                        ? "none"
                        : "1px solid var(--gray, #A5A5A5)"
                    };
                  `}
                  >
                    예
                  </CircleButton>
                  <CircleButton
                    ref={(el) => (inputRefs.current[12] = el)}
                    onKeyDown={(e) => handleEnter(e, 13)}
                    onClick={() => handleInputChange("commute", false)}
                    customStyle={`
                      width: 100%;
                      height: 2.15625rem;
                      font-size: 0.85rem;
                      background-color: ${
                        formData.commute === false
                          ? "var(--blue, #115BCA)"
                          : "var(--white, #fff)"
                      };
                    color: ${
                      formData.commute === false
                        ? "var(--white, #fff)"
                        : "var(--gray, #A5A5A5)"
                    };
                    border: ${
                      formData.commute === false
                        ? "none"
                        : "1px solid var(--gray, #A5A5A5)"
                    };
                  `}
                  >
                    아니오
                  </CircleButton>
                </ButtonGroup2>
              </FormRow>
            </FormGrid>
          </Section>

          {/* ————————————————————— 가계부 요약본  ————————————————————— */}

          <Section2Header>
            <TitleWrapper>
              <Username>{profile?.name || "사용자"}</Username>
              <SectionTitle>님의 가계부 요약본</SectionTitle>
            </TitleWrapper>
            <Notice>* 기록시점의 환율 기준</Notice>
          </Section2Header>
          <Section2>
            <CategorySection>
              <CategoryHeader>
                <CategoryTitle>한달평균생활비</CategoryTitle>
                {summaryData && (
                  <CategoryAmount>
                    {summaryData.average_monthly_living_expense
                      .foreign_currency === "KRW"
                      ? "₩"
                      : "$"}
                    {parseFloat(
                      summaryData.average_monthly_living_expense.foreign_amount
                    ).toFixed(2)}{" "}
                    (₩
                    {parseFloat(
                      summaryData.average_monthly_living_expense.krw_amount
                    ).toLocaleString()}
                    )
                  </CategoryAmount>
                )}
              </CategoryHeader>
              <CategoryGrid>
                {categoryData.map((category) => (
                  <CategoryCard
                    key={category.code}
                    categoryData={category}
                    showBudgetStatus={false}
                  />
                ))}
              </CategoryGrid>
            </CategorySection>

            <BasicCostSection>
              <BasicCostHeader>
                <BasicCostTitle>기본파견비용</BasicCostTitle>
                {summaryData && (
                  <BasicCostAmount>
                    {summaryData.base_dispatch_cost.total.foreign_currency ===
                    "KRW"
                      ? "₩"
                      : "$"}
                    {parseFloat(
                      summaryData.base_dispatch_cost.total.foreign_amount
                    ).toFixed(2)}{" "}
                    (₩
                    {parseFloat(
                      summaryData.base_dispatch_cost.total.krw_amount
                    ).toLocaleString()}
                    )
                  </BasicCostAmount>
                )}
              </BasicCostHeader>
              <BasicCostGrid>
                {summaryData &&
                  [
                    {
                      code: "flight",
                      label: "항공권",
                      ...summaryData.base_dispatch_cost.flight,
                      budget_diff: null,
                    },
                    {
                      code: "insurance",
                      label: "보험료",
                      ...summaryData.base_dispatch_cost.insurance,
                      budget_diff: null,
                    },
                    {
                      code: "visa",
                      label: "비자",
                      ...summaryData.base_dispatch_cost.visa,
                      budget_diff: null,
                    },
                    {
                      code: "tuition",
                      label: "등록금",
                      ...summaryData.base_dispatch_cost.tuition,
                      budget_diff: null,
                    },
                  ].map((cost) => (
                    <CategoryCard
                      key={cost.code}
                      categoryData={cost}
                      showBudgetStatus={false}
                    />
                  ))}
              </BasicCostGrid>
            </BasicCostSection>
          </Section2>

          {/* ————————————————————— 한줄평 ————————————————————— */}

          <FormRow2 $fullWidth>
            <Section2Header>
              <TitleWrapper>
                <Username>{profile?.name || "사용자"}</Username>
                <SectionTitle>님이 남긴 한 마디</SectionTitle>
              </TitleWrapper>
              <OptionalNotice>* 선택입력</OptionalNotice>
            </Section2Header>
            <Inputfield
              ref={(el) => (inputRefs.current[13] = el)}
              customStyle={`
                width: 100%;
                height: 4.55456rem;
                flex-shrink: 0;
                border-radius: 1.177rem;
                border: 1px solid var(--light-gray, #D9D9D9);
                background: var(--text-input, #FCFCFC);
                padding: 0 3.6rem;
                margin-top: 1rem;
              `}
              type="text"
              placeholder="예: 교통비가 생각보다 많이 들었어요!"
              value={formData.summary_note}
              onChange={(e) =>
                handleInputChange("summary_note", e.target.value)
              }
            />
          </FormRow2>
        </ContentWrapper>
    </PageWrapper>
    </>
  );
};

export default AcctSummaryCreatePage;

// —————————————————————————— 스타일링 ——————————————————————————

const Title = styled.h1`
  width: 100vw;
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100vw;

  .page {
    width: 100%;

    padding-left: 6.87rem;
    margin-bottom: 1.87rem;

    text-align: left;
  }
`;

const PageWrapper = styled.div`
  width: 60%;
  min-height: 100vh;
  background: var(--white, #ffffff);
  margin-bottom: 3rem;
`;

const ContentWrapper = styled.div`
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ProfileBox = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 1.37rem;
  padding: 1.5rem;
`;

const ProfileImage = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const Flag = styled.div`
  width: 4.64063rem;
  height: 4.64063rem;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--sub-btn, #f4f4f4);
  border-radius: 50%;
  overflow: hidden;
  flex: 0 0 auto;

  img {
    width: 2.78438rem;
    height: 2.78438rem;
  }
`;

const Type = styled.div`
  position: absolute;
  bottom: -12%;
  left: 50%;
  transform: translateX(-50%);
  width: 4.70569rem;
  height: 1.31756rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ $exchangeType }) => {
    if ($exchangeType === "교환학생") return "var(--exchange)";       // 교환학생
    if ($exchangeType === "방문학생") return "var(--visiting)";       // 방문학생
    return "var(--gray)";                                       // 기타(OT)
  }};
  border-radius: 2.5rem;
  font-family: "Pretendard Variable";
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--white, #ffffff);
`;

const ProfileInfo = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 0.19rem;
`;

//
// ———————————— 세부 프로필 입력받는 곳 ————————————

const Required = styled.div`
  color: var(--red, #ff0000);
  font-size: 0.925rem;
  font-weight: 500;
  display: flex;
`;

const Optional = styled.div`
  margin-top: 1rem;
  display: flex;
  color: var(--gray, #a5a5a5);
  font-family: "Pretendard Variable";
  font-size: 0.925rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.38125rem; /* 149.324% */
`;

const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem 2rem;
  padding: 2rem 2rem 1.67rem 3rem;
  max-width: fit-content;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  align-items: baseline;
  grid-column: ${(props) => (props.$fullWidth ? "1 / -1" : "auto")};
`;

const FormRow2 = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  grid-column: ${(props) => (props.$fullWidth ? "1 / -1" : "auto")};
  margin-top: 1rem;
`;

const Label = styled.span`
  text-align: left;
  min-width: fit-content;
  color: var(--, #000);
  font-family: "Pretendard Variable";
  font-size: 0.925rem;
  font-style: normal;
  font-weight: 500;
  line-height: 1.38125rem; /* 149.324% */
`;

const ButtonGroup1 = styled.div`
  display: flex;
  justify-content: stretch;
  align-items: center;
  height: 2.15625rem;
  gap: 0.44625rem;
`;

const ButtonGroup2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  padding: 0;
  border-radius: 1.07813rem;
  border: 1px solid var(--light-gray, #d9d9d9);
  margin-bottom: 3rem;
`;

const SectionTitle = styled.h2`
  color: var(--black, #000);
  margin-left: 0.4rem;
  text-align: left;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  /* 단위 텍스트를 Inputfield 위에 겹치게 absolute로 배치 */
  p.body2 {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
  }
  /* 첫 번째 단위는 왼쪽, 두 번째 단위는 오른쪽에 배치 */
  p.body2:first-of-type {
    left: 1rem;
  }
  p.body2:last-of-type {
    right: 1rem;
  }
`;

const InputWrapper2 = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  /* 단위 텍스트를 Inputfield 위에 겹치게 absolute로 배치 */
  p.body2 {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    pointer-events: none;
    right: 1rem;
  }
`;

const Notice = styled.div`
  color: var(--red, #ff0000);
  font-size: 0.925rem;
  font-weight: 500;
  display: flex;
`;

const OptionalNotice = styled.span`
  color: var(--gray, #a5a5a5);
  font-size: 0.925rem;
  font-weight: 500;
  display: flex;
`;

//
// ———————————— 가계부 요약본 부분 ————————————

const Username = styled.h2`
  color: var(--blue, #115bca);
  margin-left: 2rem;
`;

const TitleWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const Section2Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const Section2 = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  border-radius: 1.07813rem;
  border: 1px solid var(--light-gray, #d9d9d9);
  margin-bottom: 2rem;
  padding-bottom: 2rem;
`;

// ————— 요약본(카테고리) —————

const CategoryHeader = styled.div`
  width: 100%;  
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.89rem;
  flex-wrap: wrap;
  padding: 2rem 2rem 1rem 2rem;
  margin: 1rem 0 0 0;
`;

const CategoryTitle = styled.h2`
  width: 100%;  
  color: var(--black, #000);
  font-size: 1.7rem;
  font-weight: 700;
`;

const CategoryAmount = styled.span`
  width: 100%;  
  color: var(--deep-blue, #0b3e99);
  font-size: 1.7rem;
  font-weight: 700;
`;

const CategoryGrid = styled.div`
  width: 100%;  
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  padding: 0 1rem 1rem 1rem;
  width: 90%;
`;

const CategorySection = styled.div`
  width: 100%;  
  display: flex;
  flex-direction: column;
  align-items: center;
`;

// ————— 요약본(기본비용) —————

const BasicCostSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const BasicCostHeader = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.89rem;
  flex-wrap: wrap;
  padding: 2rem 2rem 1rem 2rem;
`;

const BasicCostTitle = styled.h2`
  color: var(--black, #000);
  font-size: 1.7rem;
  font-weight: 700;
  margin: 0;
`;

const BasicCostAmount = styled.span`
  color: var(--deep-blue, #0b3e99);
  font-size: 1.7rem;
  font-weight: 700;
`;

const BasicCostGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding: 0 1rem 1rem 1rem;
  width: 95%;
  margin: 0 1rem 0 1rem;
`;
