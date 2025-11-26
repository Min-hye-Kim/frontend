import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import UploadTopbar from "../components/topbar/UploadTopbar";
import Inputfield from "../components/Inputfield";
import Modal from "../components/Modal";
import CategoryCard from "../components/CategoryCard";
import CircleButton from "../components/button/CircleButton";
import {
  getSnapshot,
  updateSnapshot,
  getLedgerSummary,
} from "../apis/summaries/snapshot";
import { useProfile } from "../hooks";

const AcctSummaryProfileEdit = () => {
  const navigate = useNavigate();
  const { profile } = useProfile();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [summaryData, setSummaryData] = useState(null);
  const [categoryData, setCategoryData] = useState([]);

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
    commute: null,
    summary_note: "",
  });

  // 기존 데이터를 불러와서 formData에 채우기
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setLoading(true);

        // 세부프로필 조회
        const profileResponse = await getSnapshot();
        if (profileResponse.status === "success" && profileResponse.data) {
          const data = profileResponse.data;

          // formData에 기존 데이터 설정
          setFormData({
            monthly_spend_in_korea:
              data.monthly_spend_in_korea?.toString() || "",
            meal_frequency: data.meal_frequency || "",
            dineout_per_week: data.dineout_per_week?.toString() || "",
            coffee_per_week: data.coffee_per_week?.toString() || "",
            smoking_per_day: data.smoking_per_day?.toString() || "",
            drinking_per_week: data.drinking_per_week?.toString() || "",
            shopping_per_month: data.shopping_per_month?.toString() || "",
            culture_per_month: data.culture_per_month?.toString() || "",
            residence_type: data.residence_type || "",
            commute: data.commute,
            summary_note: data.summary_note || "",
          });
        }

        // 비용 데이터 조회
        const summaryResponse = await getLedgerSummary();
        if (summaryResponse.status === "success" && summaryResponse.data) {
          setSummaryData(summaryResponse.data);
          setCategoryData(summaryResponse.data.categories || []);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile data:", error);
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePublish = () => {
    if (!formData.monthly_spend_in_korea) {
      alert("한국에서의 한달 지출 비용은 필수 입력 항목입니다.");
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmPublish = async () => {
    try {
      const requestData = {};
      if (formData.monthly_spend_in_korea) {
        requestData.monthly_spend_in_korea = parseInt(
          formData.monthly_spend_in_korea
        );
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
      // commute는 boolean이므로 명시적으로 선택한 경우에만 추가
      if (formData.commute !== null && formData.commute !== undefined) {
        requestData.commute = formData.commute;
      }
      if (formData.summary_note) {
        requestData.summary_note = formData.summary_note;
      }

      // API 호출
      const response = await updateSnapshot(requestData);
      if (response.status === "success") {
        // 성공하면? AcctSummaryPage로 ㄱㄱ
        navigate("/summaries/snapshot");
      }
    } catch (error) {
      console.error("Error updating summary:", error);
      alert(error.message || "수정 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return <PageWrapper>Loading...</PageWrapper>;
  }

  return (
    <PageWrapper>
      <UploadTopbar onPublish={handlePublish} />

      <TitleRow>
        <Title>내 가계부 요약본</Title>
      </TitleRow>

      {/* ————————————————————— 프로필 ————————————————————— */}
      <ProfileBox>
        <ProfileImage>
          <Flag>
            <img
              src={`/images/flags/${encodeURIComponent(
                profile?.exchange_country || "미국"
              )}.png`}
              alt={profile?.exchange_country || "미국"}
            />
          </Flag>
          <Type>
            {profile?.exchange_type === "EX"
              ? "교환학생"
              : profile?.exchange_type === "VS"
              ? "방문학생"
              : profile?.exchange_type === "OT"
              ? "기타"
              : "방문학생"}
          </Type>
        </ProfileImage>
        <ProfileInfo>
          <p className="body1">
            {profile?.name || "사용자"} /{" "}
            {profile?.gender === "M"
              ? "남"
              : profile?.gender === "F"
              ? "여"
              : "-"}
          </p>
          <h2>
            {profile?.exchange_country || "미국"}{" "}
            {profile?.exchange_university || "University of California, Davis"}
          </h2>
          <p className="body1">
            {profile?.exchange_semester || "25년도 1학기"} (
            {profile?.exchange_period || "5개월"})
          </p>
        </ProfileInfo>
      </ProfileBox>

      {/* ————————————————————— 세부 프로필 ————————————————————— */}
      <ContentWrapper>
        <Section1Header>
          <SectionTitle>세부 프로필</SectionTitle>
        </Section1Header>
        <Section>
          <FormGrid>
            <Required>*필수입력</Required>
            <FormRow>
              <Label>한국에서의 월 지출</Label>
              <InputWrapper>
                <Inputfield
                  type="number"
                  placeholder="금액을 입력해주세요"
                  value={formData.monthly_spend_in_korea}
                  onChange={(e) =>
                    handleInputChange("monthly_spend_in_korea", e.target.value)
                  }
                />
              </InputWrapper>
            </FormRow>

            <Optional>* 선택입력</Optional>

            <FormRow>
              <Label>식사</Label>
              <BtnGroup1>
                {["1", "2", "3"].map((freq) => (
                  <CircleButton
                    key={freq}
                    onClick={() => handleInputChange("meal_frequency", freq)}
                    customStyle={`
                    width: 100%;
                      white-space: nowrap;
                      height: 2.15625rem;
                      font-size: 0.85rem;
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
              </BtnGroup1>
            </FormRow>

            <FormRow>
              <Label>외식 및 배달음식 소비</Label>
              <InputWrapper>
                <span style={{ minWidth: "fit-content" }}>주</span>
                <Inputfield
                  customStyle={`
                    color: var(--black, #000);
                    border: none;
                    `}
                  type="number"
                  placeholder=""
                  value={formData.dineout_per_week}
                  onChange={(e) =>
                    handleInputChange("dineout_per_week", e.target.value)
                  }
                />
                <Unit>회</Unit>
              </InputWrapper>
            </FormRow>

            <FormRow>
              <Label>커피 등 음료 소비</Label>
              <InputWrapper>
                <span style={{ minWidth: "fit-content" }}>주</span>
                <Inputfield
                  customStyle={`
                    color: var(--black, #000);
                    border: none;
                    `}
                  type="number"
                  placeholder=""
                  value={formData.coffee_per_week}
                  onChange={(e) =>
                    handleInputChange("coffee_per_week", e.target.value)
                  }
                />
                <Unit>회</Unit>
              </InputWrapper>
            </FormRow>

            <FormRow>
              <Label>흡연</Label>
              <InputWrapper>
                <span style={{ minWidth: "fit-content" }}>하루</span>
                <Inputfield
                  customStyle={`
                    color: var(--black, #000);
                    border: none;
                    `}
                  type="number"
                  placeholder=""
                  value={formData.smoking_per_day}
                  onChange={(e) =>
                    handleInputChange("smoking_per_day", e.target.value)
                  }
                />
                <Unit>회</Unit>
              </InputWrapper>
            </FormRow>

            <FormRow>
              <Label>음주</Label>
              <InputWrapper>
                <span style={{ minWidth: "fit-content" }}>주</span>
                <Inputfield
                  customStyle={`
                    color: var(--black, #000);
                    border: none;
                    `}
                  type="number"
                  placeholder=""
                  value={formData.drinking_per_week}
                  onChange={(e) =>
                    handleInputChange("drinking_per_week", e.target.value)
                  }
                />
                <Unit>회</Unit>
              </InputWrapper>
            </FormRow>

            <FormRow>
              <Label>쇼핑</Label>
              <InputWrapper>
                <span style={{ minWidth: "fit-content" }}>월</span>
                <Inputfield
                  customStyle={`
                    color: var(--black, #000);
                    border: none;
                    `}
                  type="number"
                  placeholder=""
                  value={formData.shopping_per_month}
                  onChange={(e) =>
                    handleInputChange("shopping_per_month", e.target.value)
                  }
                />
                <Unit>회</Unit>
              </InputWrapper>
            </FormRow>

            <FormRow>
              <Label>여가 및 문화생활 소비</Label>
              <InputWrapper>
                <span style={{ minWidth: "fit-content" }}>월</span>
                <Inputfield
                  customStyle={`
                    color: var(--black, #000);
                    border: none;
                    `}
                  type="number"
                  placeholder=""
                  value={formData.culture_per_month}
                  onChange={(e) =>
                    handleInputChange("culture_per_month", e.target.value)
                  }
                />
                <Unit>회</Unit>
              </InputWrapper>
            </FormRow>

            <FormRow>
              <Label>거주유형</Label>
              <InputWrapper>
                <Inputfield
                  customStyle={`
                    color: var(--black, #000);
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
              <BtnGroup2>
                <CircleButton
                  onClick={() => handleInputChange("commute", true)}
                  customStyle={`
                    width: 100%;
                    white-space: nowrap;
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
                  onClick={() => handleInputChange("commute", false)}
                  customStyle={`
                    width: 100%;
                      white-space: nowrap;
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
              </BtnGroup2>
            </FormRow>
          </FormGrid>
        </Section>

        {/* ————————————————————— 가계부 요약본  ————————————————————— */}
        <Section2>
          <Section2Header>
            <TitleWrapper>
              <Username>{profile?.name || "사용자"}</Username>
              <SectionTitle>님의 가계부 요약본</SectionTitle>
            </TitleWrapper>
            <Notice>* 기록시점의 환율 기준</Notice>
          </Section2Header>
          <EntireGrid>
            <CategorySection>
              <CategoryLabel>
                <CategoryText>한달평균생활비</CategoryText>
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
              </CategoryLabel>
              <CategoryGrid>
                {summaryData &&
                  summaryData.categories &&
                  summaryData.categories.map((category) => (
                    <CategoryCard
                      key={category.code}
                      categoryData={category}
                      showBudgetStatus={false}
                    />
                  ))}
              </CategoryGrid>
            </CategorySection>

            <BasicCostSection>
              <BasicCostLabel>
                <BasicCostText>기본파견비용</BasicCostText>
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
              </BasicCostLabel>
              <BasicCostGrid>
                {summaryData &&
                  summaryData.base_dispatch_cost &&
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
          </EntireGrid>
        </Section2>
        {/* ————————————————————— 한줄평 ————————————————————— */}

        <Section3>
          <Section3Header>
            <TitleWrapper>
              <Username>{profile?.name || "사용자"}</Username>
              <SectionTitle>님이 남긴 한 마디</SectionTitle>
            </TitleWrapper>
            <OptionalNotice>* 선택입력</OptionalNotice>
          </Section3Header>
          {formData.summary_note ? (
            <DisplayNote>{formData.summary_note}</DisplayNote>
          ) : (
            <DisplayNote style={{ color: "var(--gray, #a5a5a5)" }}>
              한 마디를 남겨보세요!
            </DisplayNote>
          )}
        </Section3>
      </ContentWrapper>

      {/* —————————————————————————— 모달 —————————————————————————— */}
      <Modal
        isOpen={isModalOpen}
        content="수정하시겠습니까?"
        subtext="수정 후에도 다시 수정하실 수 있습니다."
        customContentStyle={`
          font-size: 1.3125rem;
          font-weight: 700;
          `}
        customSubtextStyle={`
          font-size: 0.9rem;
          color: var(--dark-gray);
          `}
        actionText="네"
        cancelText="아니오"
        showCancelButton={true}
        showImage={false}
        onAction={handleConfirmPublish}
        onCancel={() => setIsModalOpen(false)}
        onClose={() => setIsModalOpen(false)}
      />
    </PageWrapper>
  );
};

export default AcctSummaryProfileEdit;

// —————————————————————————— 스타일링 ——————————————————————————

const PageWrapper = styled.div`
  min-height: 100vh;
  background: var(--white, #ffffff);
  padding-top: 5.5rem;
`;

const ContentWrapper = styled.div`
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Title = styled.h1`
  color: var(--black, #000);
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 1.87rem 0;
  padding: 0;
  text-align: left;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
`;

const ProfileBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.37rem;
  padding: 1.5rem;
`;

const ProfileImage = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
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
  background: var(--visiting);
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
  white-space: nowrap;
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
  gap: 1.5rem;
  padding: 2rem 2rem 1.67rem 3rem;
  text-align: left;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  align-items: center;
  gap: 2rem;
`;

const Section3 = styled.div`
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const Label = styled.span`
  white-space: nowrap;
  text-align: left;
  min-width: fit-content;
  color: var(--, #000);
  font-family: "Pretendard Variable";
  font-size: 0.925rem;
  font-style: normal;
  font-weight: 500;
`;

const BtnGroup1 = styled.div`
  display: flex;
  justify-content: stretch;
  align-items: center;
  height: 2.15625rem;
  gap: 0.44625rem;
`;

const BtnGroup2 = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.5rem;
`;

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0;
  border-radius: 1.07813rem;
  border: 1px solid var(--light-gray, #d9d9d9);
`;

const SectionTitle = styled.h2`
  color: var(--black, #000);
  margin-left: 0.4rem;
  text-align: left;
`;

const Section1Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-top: 1.5rem;
`;

const InputWrapper = styled.div`
  height: 2.15625rem;
  font-size: 0.85rem;
  font-weight: 400;
  color: var(--black, #000);
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;

  border-radius: 0.28125rem;
  border: 1px solid var(--text-input, #f4f4f4);
  background: var(--text-input, #fcfcfc);
`;

const Unit = styled.span`
  color: var(--black, #000);
  font-size: 0.875rem;
  font-weight: 400;
  white-space: nowrap;
  margin-right: 1.31rem;
`;

const Notice = styled.div`
  white-space: nowrap;
  color: var(--red, #ff0000);
  font-size: 0.925rem;
  font-weight: 500;
  display: flex;
`;

const OptionalNotice = styled.span`
  white-space: nowrap;
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
  white-space: nowrap;
  display: flex;
  align-items: center;
  margin-top: 3.06rem;
`;

const Section2Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 1rem;
`;

const EntireGrid = styled.section`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  border-radius: 0.625rem;
  border: 1px solid var(--light-gray, #d9d9d9);

  margin: 0;
  width: 100%;
`;

const Section2 = styled.div`
  width: 100%;
`;

// ————— 요약본(카테고리) —————

const CategoryLabel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.89rem;
  flex-wrap: wrap;
  padding: 2rem 2rem 1rem 2rem;
  margin: 1rem 0 0 0;
`;

const CategoryText = styled.h2`
  white-space: nowrap;
  color: var(--black, #000);
  font-size: 1.7rem;
  font-weight: 700;
`;

const CategoryAmount = styled.span`
  color: var(--deep-blue, #0b3e99);
  font-size: 1.7rem;
  font-weight: 700;
`;

const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1rem;
  padding: 0 1rem 1rem 1rem;
  width: 90%;
`;

const CategorySection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
`;

// ————— 요약본(기본비용) —————

const BasicCostSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  max-width: 100%;
`;

const BasicCostLabel = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.89rem;
  flex-wrap: wrap;
  padding: 2rem 2rem 1rem 2rem;
`;

const BasicCostText = styled.h2`
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

const Section3Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const DisplayNote = styled.div`
  width: 100%;
  min-height: 3.55456rem;
  text-align: left;
  padding: 1rem;
  border-radius: 1.177rem;
  border: 1px solid var(--light-gray, #d9d9d9);
  background: var(--text-input, #fcfcfc);
  color: var(--, #000);
  font-size: 0.925rem;
  font-weight: 500;
`;
