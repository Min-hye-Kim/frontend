import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../components/Spinner";
import CategoryCard from "../components/CategoryCard";
import LikeCircleButton from "../components/button/LikeCircleButton";
import ScrapCircleButton from "../components/button/ScrapCircleButton";
import { getLedgerSummary } from "../apis/summaries/snapshot";
import { useProfile } from "@/hooks";
import { FeedsAPI, FeedsActionAPI } from "@/apis";
import currencySymbolMap from "@/utils/currencySymbolMap";

const AcctSummaryPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { profile } = useProfile();
  const [feedDetail, setFeedDetail] = useState(null);
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [scrapped, setScrapped] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [scrapCount, setScrapCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const detail = await FeedsAPI.getFeedDetail(id);
        setFeedDetail(detail.data);
        console.log(detail.data)

        const summaryResponse = await getLedgerSummary();
        if (summaryResponse && summaryResponse.data) {
          setSummaryData(summaryResponse.data);
        }

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

  const handleEdit = () => {
    navigate("/summaries/edit");
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

  // 성별 텍스트
  const getGenderText = (gender) => {
    if (gender === "여") return "여";
    if (gender === "남") return "남";
    return "-";
  };

  // 금액 포맷
  const formatAmount = (amount, digits = 2) => {
    if (amount === null || amount === undefined || isNaN(Number(amount))) return "-";
    return parseFloat(amount).toFixed(digits);
  };
  const formatKRW = (amount) => {
    if (amount === null || amount === undefined || isNaN(Number(amount))) return "-";
    return `₩${parseInt(amount, 10).toLocaleString()}`;
  };

  // 카테고리 리스트 안전하게
  const livingCategories = feedDetail.living_expense_summary?.categories || [];
  const baseCategories = feedDetail.base_dispatch_summary?.categories || [];

  const isOwner = (() => {
    const profileId = profile?.name;
    const feedUserId = feedDetail?.user_info?.nickname;

    // 둘 중 하나라도 없으면 false (로딩 시점 대비)
    if (!profileId || !feedUserId) return false;

    return profileId === feedUserId;
  })();


  return (
    <PageWrapper>
      <TitleRow>
        <Title>가계부 상세보기</Title>
      </TitleRow>

      {/* ————————————————————— 피드 상세 프로필 ————————————————————— */}
      <ProfileBox>
        <ProfileImage>
          <Flag>
            <img
              src={`/images/flags/${encodeURIComponent(feedDetail.exchange_info?.country || "미국")}.png`}
              alt={feedDetail.exchange_info?.country || "미국"}
            />
          </Flag>
          <Type>
            {feedDetail.exchange_info?.exchange_type || "방문학생"}
          </Type>
        </ProfileImage>
        <ProfileInfo>
          <ProfileNickname>
            <ProfileText>
              {feedDetail.user_info?.nickname || "사용자"} / {getGenderText(feedDetail.user_info?.gender)}
            </ProfileText>
            {isOwner && (
              <Me>
                <span className="body3">나</span>
              </Me>
            )}
          </ProfileNickname>
          <ProfileWrapper>
            <h3>
              {feedDetail.exchange_info?.country || "미국"} {feedDetail.exchange_info?.university || "University"}
            </h3>
            <p>
              {feedDetail.exchange_info?.exchange_semester || "25년도 1학기"} ({feedDetail.exchange_info?.exchange_period || "5개월"})
            </p>
          </ProfileWrapper>
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
      <ContentWrapper>
        <Section1Header>
          <SectionTitle>세부 프로필</SectionTitle>
          {isOwner && (
            <EditButton onClick={handleEdit}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="19"
                height="22"
                viewBox="0 0 19 22"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M16.768 0.87099C16.2101 0.313295 15.4536 0 14.6648 0C13.8759 0 13.1194 0.313295 12.5616 0.87099L11.8605 1.57305L16.7689 6.48152L17.469 5.78045C17.7453 5.50421 17.9645 5.17624 18.114 4.81528C18.2635 4.45433 18.3405 4.06745 18.3405 3.67675C18.3405 3.28605 18.2635 2.89917 18.114 2.53822C17.9645 2.17726 17.7453 1.84929 17.469 1.57305L16.768 0.87099ZM15.3658 7.88366L10.4574 2.97519L1.44362 11.9899C1.24637 12.1872 1.10858 12.436 1.04598 12.7078L0.0256175 17.1255C-0.0124018 17.2895 -0.0080408 17.4604 0.0382895 17.6223C0.0846199 17.7841 0.171394 17.9315 0.290436 18.0506C0.409478 18.1696 0.556867 18.2564 0.718717 18.3027C0.880567 18.349 1.05155 18.3534 1.21555 18.3154L5.63416 17.296C5.90567 17.2332 6.15409 17.0955 6.3511 16.8984L15.3658 7.88366Z"
                  fill="#115BCA"
                />
              </svg>
            </EditButton>
        )}
        </Section1Header>
        <Section1>
          <FormGrid>
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
                  <CategoryCard key={category.code} categoryData={category} />
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
                  <CategoryCard key={cost.code} categoryData={cost} />
                ))}
              </BasicCostGrid>
            </BasicCostSection>
          </EntireGrid>
        </Section2>

        {/* ————————————————————— 한줄평 ————————————————————— */}
        {feedDetail.lifestyle?.summary_note && (
          <Section3>
            <TitleWrapper>
              <Username>{feedDetail.user_info?.nickname || "사용자"}</Username>
              <SectionTitle>님이 남긴 한 마디</SectionTitle>
            </TitleWrapper>
            <DisplayNote>{feedDetail.lifestyle.summary_note}</DisplayNote>
          </Section3>
        )}
      </ContentWrapper>
    </PageWrapper>
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

const PageWrapper = styled.div`
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

const Title = styled.h1`
  color: var(--black);
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

const EditButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s;

  &:hover {
    opacity: 0.7;
  }

  svg {
    width: 19px;
    height: 22px;
  }
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
  background: var(--sub-btn);
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
  color: var(--white);
`;

const ProfileInfo = styled.div`
  width: 100%;
  font-size: 0.81881rem;
  font-weight: 400;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 0.19rem;
`;

const ProfileWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ProfileNickname = styled.div`
  width: 100%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
`;

const ProfileText = styled.div`
  font-size: 0.81881rem;
  font-weight: 400;
  gap: 0.19rem;
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

const ProfileBox = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 1.37rem;
  padding: 1.5rem;
`;

const BtnBox = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.5rem;
`;

//
// —————————————————————————— (세부 프로필) ——————————————————————————

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
`;

const Section3 = styled.div`
  white-space: nowrap;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 1rem;
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
  border-radius: 0.30706rem;
  border: 1px solid var(--sub-btn, #f4f4f4);
  background: var(--text-intput, #fcfcfc);
`;

const Section1 = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 0;
  border-radius: 1.07813rem;
  border: 1px solid var(--light-gray, #d9d9d9);
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
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  white-space: nowrap;
  color: var(--red, #ff0000);
  font-size: 0.925rem;
  font-weight: 500;
  display: flex;
  margin-bottom: 0.2rem;
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
  margin-bottom: 0.88rem;
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

  border-radius: 1.07813rem;
  border: 1px solid var(--light-gray);

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
  color: var(--black);
  font-size: 1.7rem;
  font-weight: 700;
`;

const CategoryAmount = styled.span`
  color: var(--deep-blue);
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
  