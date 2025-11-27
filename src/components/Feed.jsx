import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Modal from "./Modal";
import { FeedsActionAPI} from "@/apis";
import currencySymbolMap from "@/utils/currencySymbolMap";

const Feed = ({
  id,
  mySnapshotId,
  nickname,
  gender,
  country,
  university,
  exchange_type,
  exchange_semester,
  exchange_period,
  scrap_count,
  scrapped,
  base_dispatch_krw_amount,
  base_dispatch_foreign_amount,
  living_expense_krw_amount,
  living_expense_foreign_amount,
  living_expense_foreign_currency,
  // ...필요한 다른 필드
  onScrapChange,
}) => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));
  const [showModal, setShowModal] = React.useState(false);
  const [showMineModal, setShowMineModal] = React.useState(false);
  const [isScrapLoading, setIsScrapLoading] = useState(false);
  const [isMine, setIsMine] = useState(false);

  useEffect(() => {
    if (id === mySnapshotId) {
      setIsMine(true);
    } else {
      setIsMine(false);
    }
  }, [id, mySnapshotId]);

  // 로그인/로그아웃 상태 변화 감지하여 isLoggedIn 갱신
  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem("token");
      setIsLoggedIn(!!token);

      if (!token) {
        setIsScrapped(false);
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // 항상 최신 is_scraped 값을 반영하도록 상태를 동기화
  const [isScrapped, setIsScrapped] = useState(scrapped);
  const [scrapCount, setScrapCount] = useState(scrap_count);

  useEffect(() => {
    setIsScrapped(scrapped);
  }, [scrapped]);

  useEffect(() => {
    setScrapCount(scrap_count);
  }, [scrap_count]);

  // 최신 scrapCount를 API에서 받아와서 갱신
  const fetchScrapCount = async () => {
    try {
      const res = await FeedsActionAPI.getFeedDetail(id);
      if (res?.data?.scrap_count !== undefined) {
        setScrapCount(res.data.scrap_count);
      }
    } catch (err) {
      // 에러 무시 (UI만 갱신)
    }
  };

  // scrap 상태가 바뀔 때마다 최신 카운트 불러오기
  useEffect(() => {
    fetchScrapCount();
  }, [isScrapped]);

  useEffect(() => {
    setScrapCount(scrap_count);
  }, [scrap_count]);

  const handleScrapClick = async (e) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      setShowModal(true);
    } else if(isMine){
      setShowMineModal(true);
    } else {
      setIsScrapLoading(true);
      window.scrapLoading = true;
      try {
        let newScrapCount, newIsScrapped;
        if (!isScrapped) {
          newScrapCount = scrapCount + 1;
          newIsScrapped = true;
          setIsScrapped(true);
          setScrapCount(newScrapCount);
          await FeedsActionAPI.addScrap(id);
        } else {
          newScrapCount = scrapCount - 1;
          newIsScrapped = false;
          setIsScrapped(false);
          setScrapCount(newScrapCount);
          await FeedsActionAPI.removeScrap(id);
        }
        // HomePage에 알림 (id, scrapCount, scrapped 전달)
        if (onScrapChange) {
          onScrapChange(id, newScrapCount, newIsScrapped);
        }
        // API에서 최신 값으로 동기화
        fetchScrapCount();
      } catch (err) {
        console.log(err);
        if (err.response?.status === 401) {
          alert("로그인 후 이용 가능합니다.");
          navigate("/login");
        } else if (err.response?.data?.message === "이미 스크랩된 항목입니다.") {
          alert("이미 스크랩된 항목입니다.");
        } else {
          alert("스크랩 처리에 실패했습니다.");
        }
      } finally {
        setIsScrapLoading(false);
        window.scrapLoading = false;
      }
    }
  };

  const handleModalAction = () => {
    setShowModal(false);
    navigate('/login');
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setShowMineModal(false);
  };

  const handleFeedClick = () => {
    navigate(`/summaries/snapshot/${id}`);
  };

  const flagSrc = `/images/flags/${encodeURIComponent(country)}.png`;

  // 소수점 아래 버림 함수
  const toInt = (value) => {
    if (value === undefined || value === null) return 0;
    return Math.floor(Number(value));
  };

  return(
    <>
      {showMineModal && (
        <Modal
          isOpen={showMineModal}
          content="자신의 글은 스크랩할 수 없습니다."
          actionText="닫기"
          showCancelButton={false}
          onAction={handleCloseModal}
        />
      )}
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
      <Box onClick={handleFeedClick}>
        <User>
          <UserProfile>
            <Flag>
              <img src={flagSrc} alt={country}/>
            </Flag>
            <Type $exchangeType={exchange_type}>{exchange_type}</Type>
          </UserProfile>
          <UserText>
            <p className="body1">{nickname} / {gender}</p>
            <h2>{country} {university}</h2>
            <p className="body1">{exchange_semester} ({exchange_period})</p>
          </UserText>
          <ScrapBtn onClick={handleScrapClick} $isScrapped={isScrapped}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="25" viewBox="0 0 20 25" fill="none">
              <path d="M10 22.0125L3.77 24.7515C2.87222 25.1466 2.01944 25.0706 1.21167 24.5232C0.403889 23.977 0 23.2133 0 22.2322V2.75262C0 1.96794 0.257222 1.31329 0.771666 0.788653C1.28611 0.26402 1.92667 0.00113557 2.69333 0H17.3083C18.075 0 18.7156 0.262884 19.23 0.788653C19.7444 1.31442 20.0011 1.96908 20 2.75262V22.2322C20 23.2133 19.5961 23.977 18.7883 24.5232C17.9806 25.0706 17.1278 25.1466 16.23 24.7515L10 22.0125ZM10 20.0996L16.8917 23.1384C17.2328 23.2917 17.5583 23.2593 17.8683 23.0413C18.1783 22.8221 18.3333 22.5269 18.3333 22.1556V2.75433C18.3333 2.49201 18.2267 2.25127 18.0133 2.0321C17.8 1.81294 17.5644 1.70336 17.3067 1.70336H2.69333C2.43667 1.70336 2.20111 1.81237 1.98667 2.0304C1.77222 2.24843 1.66556 2.48917 1.66667 2.75262V22.1573C1.66667 22.5286 1.82167 22.8233 2.13167 23.0413C2.44167 23.2593 2.76722 23.2917 3.10833 23.1384L10 20.0996ZM10 1.70336H1.66667H18.3333H10Z" fill={isScrapped ? "var(--blue)" : "var(--gray)"}/>
              <path d="M10 20.0996L16.8917 23.1384C17.2328 23.2917 17.5583 23.2593 17.8683 23.0413C18.1783 22.8221 18.3333 22.5269 18.3333 22.1556V2.75433C18.3333 2.49201 18.2267 2.25127 18.0133 2.0321C17.8 1.81294 17.5644 1.70336 17.3067 1.70336H10H2.69333C2.43667 1.70336 2.20111 1.81237 1.98667 2.0304C1.77222 2.24843 1.66556 2.48917 1.66667 2.75262V22.1573C1.66667 22.5286 1.82167 22.8233 2.13167 23.0413C2.44167 23.2593 2.76722 23.2917 3.10833 23.1384L10 20.0996Z" fill={isScrapped ? "var(--blue)" : "none"}/>
            </svg>
            {!isScrapped && <p className="body1">{scrapCount}</p>}
          </ScrapBtn>
        </User>
        <Cost>
          <CostSection>
            <p className="body2">총 파견 비용</p>
            <CostText>
              <h3>{toInt(base_dispatch_krw_amount).toLocaleString()}원</h3>
              <h3 className="dblue">
                {living_expense_foreign_currency
                  ? `${currencySymbolMap[living_expense_foreign_currency] || living_expense_foreign_currency}${toInt(base_dispatch_foreign_amount)}`
                  : `$${toInt(base_dispatch_foreign_amount)}`}
              </h3>
            </CostText>
          </CostSection>
          <CostSection>
            <p className="body2">한달 평균 생활비</p>
            <CostText>
              <h3>{toInt(living_expense_krw_amount).toLocaleString()}원</h3>
              <h3 className="dblue">
                {living_expense_foreign_currency
                  ? `${currencySymbolMap[living_expense_foreign_currency] || living_expense_foreign_currency}${toInt(living_expense_foreign_amount)}`
                  : `$${toInt(living_expense_foreign_amount)}`}
              </h3>
            </CostText>
          </CostSection>
        </Cost>
      </Box>
    </>
  );
};

export default Feed;

// ------ 스타일링 영역 ------ 
const Box = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.72rem;

  padding: 1rem 1.5rem;

  background: var(--white);
  border-radius: 0.97744rem;
  border: 1px solid var(--light-gray);

  transition: all 0.2s ease;

  &:hover {
    cursor: pointer;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
`;

const User = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  gap: 1.37rem;
`;

const UserProfile = styled.div`
  position: relative; /* Type의 기준점 */
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
  /* make perfectly circular and prevent inner overflow */
  border-radius: 50%;
  overflow: hidden;
  flex: 0 0 auto; /* prevent flex children from stretching the box */

  img{
    width: 2.78438rem;
    height: 2.78438rem;
  }
`

const Type = styled.div`
  position: absolute;
  bottom: -12%; /* Flag 하단에 배치 */
  left: 50%;
  transform: translateX(-50%); /* 가로 중앙 정렬 */
  
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
  color: var(--white);
`

const UserText = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;

  gap: 0.19rem;
`;

const ScrapBtn = styled.button`
  height: 3.25rem;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  gap: 0.25rem;

  background: none;
  border: none;

  color: var(--gray);

  margin: 0.75rem 1.5rem 0 0;

  &:hover {
    cursor: pointer;
    filter: brightness(0.9);
  }

  svg {
    flex-shrink: 0; /* SVG 크기가 축소되지 않도록 */
  }
`

const Cost = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.37rem;
`;

const CostSection = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  gap: 0.3rem;

  h3{
    white-space: nowrap;
  }
`;

const CostText = styled.div`
  width: 100%;
  height: 2.6875rem;
  
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;

  padding: 0 1.88rem;

  border-radius: 1.07813rem;
  background: #F6FAFF;

  .dblue {
    color: var(--deep-blue);
  }
`;