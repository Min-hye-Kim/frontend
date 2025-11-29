import React, { useState, useEffect, useRef } from "react";
import styled from "styled-components";
import { useParams } from "react-router-dom";
import Modal from "../components/Modal";
import Spinner from "../components/Spinner";
import CategoryCard from "../components/CategoryCard";
import CircleButton from "../components/button/CircleButton";
import LikeCircleButton from "../components/button/LikeCircleButton";
import ScrapCircleButton from "../components/button/ScrapCircleButton";
import Inputfield from "../components/Inputfield";
import { useProfile } from "@/hooks";
import { FeedsAPI, FeedsActionAPI, SummariesAPI } from "@/apis";
import currencySymbolMap from "@/utils/currencySymbolMap";

const AcctSummaryPage = () => {
  const inputRefs = useRef([]);
  const { id } = useParams();
  const { profile } = useProfile();
  const [feedDetail, setFeedDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [scrapped, setScrapped] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [scrapCount, setScrapCount] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));
  // 로그인/로그아웃 상태 변화 감지
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

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

  //데이터 띄울때 구분자(,)
  const formatNumberLocale = (value) => {
    if (value === null || value === undefined || value === "") return "";
    const num = Number(String(value).replace(/,/g, ""));
    if (isNaN(num)) return value;
    return num.toLocaleString();
  };

  const toggleEdit = async () => {
    // editMode OFF → ON : 기존 값 불러오기
    if (!editMode) {
      try {
        const snapshotRes = await SummariesAPI.getSnapshot();
        const data = snapshotRes.data;

      setFormData({
        monthly_spend_in_korea: data.monthly_spend_in_korea
          ? Number(data.monthly_spend_in_korea).toLocaleString()
          : "",
        meal_frequency: data.meal_frequency || "",
        dineout_per_week: data.dineout_per_week ?? "",
        coffee_per_week: data.coffee_per_week ?? "",
        smoking_per_day: data.smoking_per_day ?? "",
        drinking_per_week: data.drinking_per_week ?? "",
        shopping_per_month: data.shopping_per_month ?? "",
        culture_per_month: data.culture_per_month ?? "",
        residence_type: data.residence_type || "",
        commute: data.commute,
        summary_note: data.summary_note || "",
      });

        setEditMode(true);
      } catch (err) {
        console.error(err);
        alert("세부 프로필 정보를 불러올 수 없습니다.");
      }
      return;
    }

    // editMode ON → OFF : 저장 (PUT)
    try {
      const payload = {
        monthly_spend_in_korea: getMonthlySpendRawValue(),
        meal_frequency: formData.meal_frequency || null,
        dineout_per_week: formData.dineout_per_week || null,
        coffee_per_week: formData.coffee_per_week || null,
        smoking_per_day: formData.smoking_per_day || null,
        drinking_per_week: formData.drinking_per_week || null,
        shopping_per_month: formData.shopping_per_month || null,
        culture_per_month: formData.culture_per_month || null,
        residence_type: formData.residence_type || "",
        commute: formData.commute,
        summary_note: formData.summary_note || "",
      };

      // 1) lifestyle 업데이트
      const res = await SummariesAPI.updateSnapshot(payload);

      // 2) 전체 feedDetail 다시 불러오기
      const updatedDetail = await FeedsAPI.getFeedDetail(id);

      // 3) 최신 데이터 위에 lifestyle만 PUT 응답으로 덮어쓰기
      const merged = {
        ...updatedDetail.data,
        lifestyle: {
          ...updatedDetail.data.lifestyle,
          ...res.data,
        },
      };

      // 4) 최종 반영
      setFeedDetail(merged);

      setEditMode(false);

    } catch (err) {
      console.error(err);
      alert("세부 프로필 수정에 실패했습니다.");
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const detail = await FeedsAPI.getFeedDetail(id);
        setFeedDetail(detail.data);

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  useEffect(() => {
    if (feedDetail) {
      setLiked(feedDetail.liked ?? false);
      setScrapped(feedDetail.scrapped ?? false);
      setLikeCount(feedDetail.like_count ?? 0);
      setScrapCount(feedDetail.scrap_count ?? 0);
    }
  }, [feedDetail]);

  const handleToggleLike = async () => {
    if (!isLoggedIn) {
      setShowModal(true);
      return;
    }
    try {
      // UI 먼저 반영 (optimistic update)
      setLiked(prev => !prev);
      setLikeCount(prev => (liked ? prev - 1 : prev + 1));

      if (!liked) await FeedsActionAPI.addFavorite(id);
      else await FeedsActionAPI.removeFavorite(id);
    } catch (err) {
      console.error("좋아요 처리 실패:", err);

      // 실패 시 롤백
      setLiked(prev => !prev);
      setLikeCount(prev => (liked ? prev + 1 : prev - 1));
    }
  };

  const handleToggleScrap = async () => {
    if (!isLoggedIn) {
      setShowModal(true);
      return;
    }
    try {
      setScrapped(prev => !prev);
      setScrapCount(prev => (scrapped ? prev - 1 : prev + 1));

      if (!scrapped) await FeedsActionAPI.addScrap(id);
      else await FeedsActionAPI.removeScrap(id);
    } catch (err) {
      console.error("스크랩 처리 실패:", err);

      setScrapped(prev => !prev);
      setScrapCount(prev => (scrapped ? prev + 1 : prev - 1));
    }
  };

  // 모달 핸들러
  const handleModalAction = () => {
    setShowModal(false);
    window.location.href = '/login';
  };
  const handleCloseModal = () => {
    setShowModal(false);
  };

  if (loading) {
    return (
      <LoadingWrapper>
        <Spinner />
      </LoadingWrapper>
    );
  }

  if (!feedDetail) {
    return <PageWrapper>데이터를 불러올 수 없습니다.</PageWrapper>;
  }

  // 금액 포맷
  const formatAmount = (amount, digits = 2) => {
    if (amount === null || amount === undefined || isNaN(Number(amount))) return "-";
    return parseFloat(amount).toFixed(digits);
  };
  const formatKRW = (amount) => {
    if (amount === null || amount === undefined || isNaN(Number(amount))) return "-";
    return `₩${parseInt(amount, 10).toLocaleString()}`;
  };

  // 기본 카테고리 구조
  const DEFAULT_LIVING_CATEGORIES = [
    { code: "FOOD", label: "식비" },
    { code: "HOUSING", label: "주거비" },
    { code: "TRANSPORT", label: "교통비" },
    { code: "SHOPPING", label: "쇼핑비" },
    { code: "TRAVEL", label: "여행비" },
    { code: "STUDY_MATERIALS", label: "교재비" },
    { code: "ETC", label: "기타" },
  ];

  // 실제 데이터
  const apiCategories =
    feedDetail?.living_expense_summary?.categories || [];

  // 코드 기준으로 merge
  const livingCategories = DEFAULT_LIVING_CATEGORIES.map((cat) => {
    const found = apiCategories.find((c) => c.code === cat.code);

    return {
      code: cat.code,
      label: cat.label,
      foreign_amount: found?.foreign_amount ?? "0.00",
      foreign_currency: found?.foreign_currency ?? feedDetail.living_expense_foreign_currency,
      krw_amount: found?.krw_amount ?? "0",
      krw_currency: found?.krw_currency ?? "KRW",
      budget_diff: found?.budget_diff ?? {
        foreign_amount: "0.00",
        foreign_currency: found?.foreign_currency ?? feedDetail.living_expense_foreign_currency,
      },
    };
  });

  const baseCategories = feedDetail.base_dispatch_summary?.categories || [];

  const isOwner = (() => {
    const profileId = profile?.name;
    const feedUserId = feedDetail?.user_info?.nickname;

    // 둘 중 하나라도 없으면 false (로딩 시점 대비)
    if (!profileId || !feedUserId) return false;

    return profileId === feedUserId;
  })();

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
    <TitleRow>
      <p className="page">가계부 상세보기</p>
    </TitleRow>
    <PageWrapper>
      <ContentWrapper>
        {showModal && (
          <Modal
            isOpen={showModal}
            content="로그인이 필요한 기능입니다."
            cancelText="닫기"
            actionText="로그인하러 가기"
            onClose={handleCloseModal}
            onAction={handleModalAction}
          />
        )}
        {/* ————————————————————— 피드 상세 프로필 ————————————————————— */}
        <ProfileBox>
          <ProfileImage>
            <Flag>
              <img
                src={
                  feedDetail.exchange_info?.country 
                    ? `/images/flags/${encodeURIComponent(feedDetail.exchange_info?.country)}.png`
                    : ""
                  }
                alt={feedDetail.exchange_info?.country || ""}
              />
            </Flag>
            <Type $exchangeType={feedDetail.exchange_info?.exchange_type}>
              {feedDetail.exchange_info?.exchange_type}
            </Type>
          </ProfileImage>
          <ProfileInfo>
            <ProfileInfoMe>
              <p className="body1">
                {feedDetail.user_info?.nickname || "User"} / {feedDetail.user_info?.gender}
              </p>
              {isOwner && (
                <Me>
                  <span className="body3">나</span>
                </Me>
              )}
            </ProfileInfoMe>
            <h2>
              {feedDetail.exchange_info?.country || "미국"} {feedDetail.exchange_info?.university || "University"}
            </h2>
            <p className="body1">
              {feedDetail.exchange_info?.exchange_semester || "semester"} ({feedDetail.exchange_info?.exchange_period || "period"})
            </p>
          </ProfileInfo>
          <BtnBox>
            <LikeCircleButton 
              liked={liked}
              likeCount={likeCount}
              onToggle={handleToggleLike}
              disabled={isOwner}
            />
            <ScrapCircleButton 
              scrapped={scrapped}
              scrapCount={scrapCount}
              onToggle={handleToggleScrap}
              disabled={isOwner}
            />
          </BtnBox>
        </ProfileBox>

        {/* ————————————————————— 세부 프로필 ————————————————————— */}
        <Section1Header>
          <SectionTitle>세부 프로필</SectionTitle>
          {isOwner && (
            editMode ? (
            <h3
              onClick={toggleEdit}
              style={{ cursor: 'pointer', color: 'var(--blue)' }}
            >
              저장
            </h3>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="22"
              viewBox="0 0 19 22"
              fill='none'
              onClick={toggleEdit}
              style={{ cursor: 'pointer' }}
            >
              <path fillRule="evenodd" clipRule="evenodd" d="M16.768 0.87099C16.2101 0.313295 15.4536 0 14.6648 0C13.8759 0 13.1194 0.313295 12.5616 0.87099L11.8605 1.57305L16.7689 6.48152L17.469 5.78045C17.7453 5.50421 17.9645 5.17624 18.114 4.81528C18.2635 4.45433 18.3405 4.06745 18.3405 3.67675C18.3405 3.28605 18.2635 2.89917 18.114 2.53822C17.9645 2.17726 17.7453 1.84929 17.469 1.57305L16.768 0.87099ZM15.3658 7.88366L10.4574 2.97519L1.44362 11.9899C1.24637 12.1872 1.10858 12.436 1.04598 12.7078L0.0256175 17.1255C-0.0124018 17.2895 -0.0080408 17.4604 0.0382895 17.6223C0.0846199 17.7841 0.171394 17.9315 0.290436 18.0506C0.409478 18.1696 0.556867 18.2564 0.718717 18.3027C0.880567 18.349 1.05155 18.3534 1.21555 18.3154L5.63416 17.296C5.90567 17.2332 6.15409 17.0955 6.3511 16.8984L15.3658 7.88366Z" fill="#115BCA" />
            </svg>
          )
        )}
        </Section1Header>
        {editMode ? (
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
        ) : (
          <Section1>
            <FormGrid>
              {feedDetail.lifestyle?.monthly_spend_in_korea && (
                <FormRow>
                  <Label>한국에서의 월 지출</Label>
                  <DisplayValue>{formatNumberLocale(feedDetail.lifestyle.monthly_spend_in_korea)}원</DisplayValue>
                </FormRow>
              )}
              {feedDetail.lifestyle?.meal_frequency && (
                <FormRow>
                  <Label>식사</Label>
                  <DisplayValue>{feedDetail.lifestyle.meal_frequency}</DisplayValue>
                </FormRow>
              )}
              {feedDetail.lifestyle?.dineout_per_week !== undefined && feedDetail.lifestyle?.dineout_per_week !== null && (
                <FormRow>
                  <Label>외식 및 배달음식 소비</Label>
                  <DisplayValue>주 {feedDetail.lifestyle.dineout_per_week}회</DisplayValue>
                </FormRow>
              )}
              {feedDetail.lifestyle?.coffee_per_week !== undefined && feedDetail.lifestyle?.coffee_per_week !== null && (
                <FormRow>
                  <Label>커피 등 음료 소비</Label>
                  <DisplayValue>주 {feedDetail.lifestyle.coffee_per_week}회</DisplayValue>
                </FormRow>
              )}
              {feedDetail.lifestyle?.smoking_per_day !== undefined && feedDetail.lifestyle?.smoking_per_day !== null && (
                <FormRow>
                  <Label>흡연</Label>
                  <DisplayValue>하루 {feedDetail.lifestyle.smoking_per_day}회</DisplayValue>
                </FormRow>
              )}
              {feedDetail.lifestyle?.drinking_per_week !== undefined && feedDetail.lifestyle?.drinking_per_week !== null && (
                <FormRow>
                  <Label>음주</Label>
                  <DisplayValue>주 {feedDetail.lifestyle.drinking_per_week}회</DisplayValue>
                </FormRow>
              )}
              {feedDetail.lifestyle?.shopping_per_month !== undefined && feedDetail.lifestyle?.shopping_per_month !== null && (
                <FormRow>
                  <Label>쇼핑</Label>
                  <DisplayValue>월 {feedDetail.lifestyle.shopping_per_month}회</DisplayValue>
                </FormRow>
              )}
              {feedDetail.lifestyle?.culture_per_month !== undefined && feedDetail.lifestyle?.culture_per_month !== null && (
                <FormRow>
                  <Label>여가 및 문화생활 소비</Label>
                  <DisplayValue>월 {feedDetail.lifestyle.culture_per_month}회</DisplayValue>
                </FormRow>
              )}
              {feedDetail.lifestyle?.residence_type && (
                <FormRow>
                  <Label>거주유형</Label>
                  <DisplayValue>{feedDetail.lifestyle.residence_type}</DisplayValue>
                </FormRow>
              )}
              {feedDetail.lifestyle?.commute !== undefined && feedDetail.lifestyle?.commute !== null && (
                <FormRow>
                  <Label>통학 여부</Label>
                  <DisplayValue>{feedDetail.lifestyle.commute ? "예" : "아니오"}</DisplayValue>
                </FormRow>
              )}
            </FormGrid>
          </Section1>
        )}

        {/* ————————————————————— 가계부 요약본  ————————————————————— */}
        <Section2>
          <Section2Header>
            <TitleWrapper>
              <Username>{feedDetail.user_info?.nickname || "사용자"}</Username>
              <SectionTitle>님의 가계부 요약본</SectionTitle>
            </TitleWrapper>
            <Notice>* 기록시점의 환율 기준</Notice>
          </Section2Header>
          <EntireGrid>
            <CategorySection>
              <CategoryLabel>
                <CategoryText>한달평균생활비</CategoryText>
                <CategoryAmount>
                  {currencySymbolMap[feedDetail.living_expense_foreign_currency]}
                  {formatAmount(feedDetail.living_expense_summary?.foreign_amount)}
                  {" "}
                  ({formatKRW(feedDetail.living_expense_summary?.krw_amount)})
                </CategoryAmount>
              </CategoryLabel>
              <CategoryGrid>
                {livingCategories.map((category) => (
                  <CategoryCard key={category.code} categoryData={category} showBudgetStatus={false} />
                ))}
              </CategoryGrid>
            </CategorySection>

            <BasicCostSection>
              <BasicCostLabel>
                <BasicCostText>기본파견비용</BasicCostText>
                <BasicCostAmount>
                  {currencySymbolMap[feedDetail.living_expense_foreign_currency]}
                  {formatAmount(feedDetail.base_dispatch_summary?.foreign_amount)}
                  {" "}
                  ({formatKRW(feedDetail.base_dispatch_summary?.krw_amount)})
                </BasicCostAmount>
              </BasicCostLabel>
              <BasicCostGrid>
                {baseCategories.map((cost) => (
                  <CategoryCard key={cost.code} categoryData={cost} showBudgetStatus={false} />
                ))}
              </BasicCostGrid>
            </BasicCostSection>
          </EntireGrid>
        </Section2>

        {/* ————————————————————— 한줄평 ————————————————————— */}
        {editMode ? (
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
              `}
              type="text"
              placeholder="예: 교통비가 생각보다 많이 들었어요!"
              value={formData.summary_note}
              onChange={(e) => handleInputChange("summary_note", e.target.value)}
            />
          </FormRow2>
        ) : (
          feedDetail.lifestyle?.summary_note && (
            <Section3>
              <Section2Header>
                <TitleWrapper>
                  <Username>{feedDetail.user_info?.nickname || "사용자"}</Username>
                  <SectionTitle>님이 남긴 한 마디</SectionTitle>
                </TitleWrapper>
              </Section2Header>
              <DisplayNote>{feedDetail.lifestyle.summary_note}</DisplayNote>
            </Section3>
          )
        )}
      </ContentWrapper>
    </PageWrapper>
    </>
  );
};

export default AcctSummaryPage;

// 로딩 스피너 중앙 정렬 스타일
const LoadingWrapper = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--white);
`;
//
// —————————————————————————— 스타일링 ——————————————————————————

const TitleRow = styled.div`
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
  background: var(--white);
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

const ProfileInfoMe = styled.div`
  width: 100%;
  display: flex;
`;

const Me = styled.div`
  width: 1.5rem;
  height: 1.5rem;

  display: flex;
  align-items: center;
  justify-content: center;

  margin-left: 0.8rem;

  border-radius: 50%;
  background: var(--gray);
  color: var(--white);
`;

const BtnBox = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
`;

// ———————————— 세부 프로필 (editMode) ————————————

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
const OptionalNotice = styled.span`
  color: var(--gray, #a5a5a5);
  font-size: 0.925rem;
  font-weight: 500;
  display: flex;
`;

//
// —————————————————————————— 세부 프로필 ——————————————————————————

const FormGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem 2rem;
  padding: 2rem 3rem;
  max-width: fit-content;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  align-items: center;
`;

const FormRow2 = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  grid-column: ${(props) => (props.$fullWidth ? "1 / -1" : "auto")};
`;

const Section3 = styled.div`
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Label = styled.span`
  white-space: nowrap;
  text-align: left;
  min-width: fit-content;
  color: var(--, #000);
  font-family: "Pretendard Variable";
  font-size: 0.9rem;
  font-weight: 500;
`;

const DisplayValue = styled.div`
  height: 2.3rem;
  width: 19rem;

  display: flex;
  justify-content: flex-start;
  align-items: center;

  padding: 0 1rem;

  color: var(--, #000);
  font-size: 0.75rem;
  font-weight: 400;

  border-radius: 0.5rem;
  border: 1px solid var(--light-gray);
  background: var(--text-intput, #fcfcfc);
`;

const Section1 = styled.section`
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
  color: var(--black);
  margin-left: 0.4rem;
  text-align: left;
`;

const Section1Header = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
`;

const Notice = styled.div`
  white-space: nowrap;
  color: var(--red, #ff0000);
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

  padding-bottom: 2rem;
  margin-bottom: 3rem;

  border-radius: 1.07813rem;
  border: 1px solid var(--light-gray);

  margin: 0;
  width: 100%;
`;

const Section2 = styled.div`
  width: 100%;
  margin-bottom: 3rem;
`;

// ————— 요약본(카테고리) —————

const CategoryLabel = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.89rem;
  flex-wrap: wrap;
  padding: 2rem 2rem 1rem 2rem;
  margin: 1rem 0 0 0;
`;

const CategoryText = styled.h2`
  width: 100%;
  white-space: nowrap;
  color: var(--black);
  font-size: 1.7rem;
  font-weight: 700;
`;

const CategoryAmount = styled.span`
  width: 100%;
  color: var(--deep-blue);
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
  color: var(--black);
  font-size: 1.7rem;
  font-weight: 700;
  margin: 0;
`;

const BasicCostAmount = styled.span`
  color: var(--deep-blue);
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

const DisplayNote = styled.div`
  width: 100%;
  height: 4.5rem;

  display: flex;
  align-items: center;
  min-height: 3.55456rem;
  text-align: left;
  padding: 0 3.6rem;

  border-radius: 1.177rem;
  border: 1px solid var(--light-gray, #d9d9d9);
  background: var(--text-input, #fcfcfc);

  color: var(--, #000);
  font-size: 0.925rem;
  font-weight: 500;
`;
  