import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Inputfield from "../components/Inputfield";
import Feed from "../components/Feed";
import Modal from "../components/Modal";
import Spinner from '../components/Spinner';
import { FeedsAPI, SummariesAPI } from '@/apis';
import { useProfile } from "@/hooks";

const HomeInputStyle = {
  width: "100%",
  border: "none",
  borderRadius: "1.07813rem",
  background: "#F3F7FF",
  padding: "0.845rem 1.96rem 0.845rem 4rem",
  fontWeight: "400",
  outline: "none",
  
  "&:focus": {
    outline: "none",
    border: "none",
  }
}

const HomePlaceholderStyle = {
    color: "#6B7280;",
}

const HomePage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem("token"));
  const { profile } = useProfile();
  const effectiveProfile = isLoggedIn ? profile : null;
  const [sort, setSort] = useState("latest"); // 선택된 정렬방법 (latest: 최신순, scrap: 스크랩 많은 순)
  const [feeds, setFeeds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false); // 검색 중 여부
  const [showModal, setShowModal] = useState(false);
  const [mySnapshotId, setMySnapshotId] = useState(null);

  useEffect(() => {
    const fetchMySnapshot = async () => {
      try {
        const res = await SummariesAPI.getLatestSnapshot();
        setMySnapshotId(res.data.snapshot_id);
      } catch (err) {
        setMySnapshotId(null);
        console.log(err.data);
      }
    };
    fetchMySnapshot();
  }, []);

  // Feed에서 scrap/un-scrap 시 호출되는 핸들러
  const fetchFeeds = async () => {
    try {
      let data;
      if (sort === "latest") {
        data = await FeedsAPI.getFeeds();
      } else {
        data = await FeedsAPI.getPopularFeeds();
      }
      setFeeds(data.data);
    } catch (err) {
      setFeeds([]);
    } finally {
      setLoading(false);
    }
  };

  // 검색어 상태
  const [searchQuery, setSearchQuery] = useState("");

  // Feed 검색 시 호출되는 핸들러
  const onSearch = async () => {
    setLoading(true);
    setSearching(true);
    setSort("latest"); // 버튼만 최신순으로
    try {
      const data = await FeedsAPI.searchFeeds(searchQuery);
      setFeeds(data.data);
    } catch (err) {
      setFeeds([]);
    } finally {
      setLoading(false);
    }
  };

  const handleScrapChange = () => {
    fetchFeeds();
  };

  useEffect(() => {
    if (!searching) {
      setLoading(true);
      fetchFeeds();
    }
  }, [sort, searching]);

  // 로그인/로그아웃 상태 변화 감지하여 isLoggedIn 갱신
  useEffect(() => {
    const handleStorageChange = () => {
      setIsLoggedIn(!!localStorage.getItem("token"));
    };
    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const handleSortClick = (sortType) => {
    setSort(sortType);
    setSearchQuery("");
    setSearching(false); // 정렬 버튼 클릭 시 검색모드 해제
  };

  const profileClicked = () => {
    if(effectiveProfile){
      navigate('/profile');
    } else {
      setShowModal(true);
    }
  };

  const handleModalAction = () => {
    setShowModal(false);
    navigate('/login');
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const flagSrc = effectiveProfile ? `/images/flags/${encodeURIComponent(effectiveProfile.exchange_country)}.png` : '';

  return(
    <Wrapper>
      <Left> 
        <Top>
          <h1>✈️ 다른 사람들의 가계부 둘러보기</h1>
          <SearchBox>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="23" height="24" viewBox="0 0 23 24" fill="none"
              style={{ cursor: 'pointer' }}
              onClick={onSearch}
            >
              <path d="M0 12.9804C0 19.0663 4.93366 24 11.0196 24C17.1056 24 22.0393 19.0663 22.0393 12.9804V11.0196C22.0393 4.93366 17.1056 0 11.0196 0C4.93366 0 0 4.93365 0 11.0196V12.9804Z" fill="none"/>
              <path d="M18.3203 20.7998L12.6064 15.1998C12.1529 15.5554 11.6314 15.8368 11.0419 16.0442C10.4523 16.2517 9.82503 16.3554 9.15992 16.3554C7.51227 16.3554 6.11781 15.7961 4.97655 14.6776C3.83528 13.5591 3.26465 12.1924 3.26465 10.5776C3.26465 8.96277 3.83528 7.5961 4.97655 6.47758C6.11781 5.35906 7.51227 4.7998 9.15992 4.7998C10.8076 4.7998 12.202 5.35906 13.3433 6.47758C14.4846 7.5961 15.0552 8.96277 15.0552 10.5776C15.0552 11.2294 14.9494 11.8442 14.7378 12.422C14.5261 12.9998 14.2389 13.5109 13.8761 13.9554L19.59 19.5554L18.3203 20.7998ZM9.15992 14.5776C10.2936 14.5776 11.2573 14.1887 12.0509 13.4109C12.8445 12.6331 13.2413 11.6887 13.2413 10.5776C13.2413 9.46647 12.8445 8.52203 12.0509 7.74425C11.2573 6.96647 10.2936 6.57758 9.15992 6.57758C8.02622 6.57758 7.06257 6.96647 6.26897 7.74425C5.47538 8.52203 5.07858 9.46647 5.07858 10.5776C5.07858 11.6887 5.47538 12.6331 6.26897 13.4109C7.06257 14.1887 8.02622 14.5776 9.15992 14.5776Z" fill="#595959"/>
            </svg>
            <Inputfield
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') onSearch(); }}
              placeholder="관심 대학 또는 국가의 가계부를 검색하세요"
              customStyle={HomeInputStyle}
              placeholderStyle={HomePlaceholderStyle}
            />
          </SearchBox>
          <Sort>
            <SortButton 
              className="body1" 
              $isActive={sort === "latest"}
              onClick={() => handleSortClick("latest")}
            >
              최신순
            </SortButton>
            <SortButton 
              className="body1" 
              $isActive={sort === "scrap"}
              onClick={() => handleSortClick("scrap")}
            >
              스크랩 많은 순
            </SortButton>
          </Sort>    
        </Top>
        <Feeding>
          {loading ? (
            <div style={{
              width: "100%",
              height: "80%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center"
            }}>
              <Spinner />
            </div>
          ) : feeds && feeds.length > 0 ? (
            feeds.map(feed => (
              <Feed
                key={feed.id}
                {...feed}
                mySnapshotId={mySnapshotId}
                onScrapChange={handleScrapChange}
              />
            ))
          ) : (
            <NoFeedMsg>피드가 없습니다.</NoFeedMsg>
          )}
        </Feeding>
      </Left>
      <Right>
        <Profile>
          <h2>프로필</h2>
          <ProfileButton onClick={profileClicked}>
            <Flag>
                {effectiveProfile ? (<img src={flagSrc} alt={effectiveProfile.exchange_country}/>) : null}
            </Flag>
            <TextContainer>
                <h3>{effectiveProfile ? `${effectiveProfile.name} / ${effectiveProfile.gender}` : '로그인하지 않았습니다.'}</h3>
                <p className="body1">{effectiveProfile ? effectiveProfile.university : '일부 기능이 제한됩니다.'}</p>
            </TextContainer>
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" viewBox="0 0 25 25" fill="none">
                <path d="M21.3021 12.4999L13.6458 20.1562C13.3854 20.4166 13.2594 20.7204 13.2677 21.0676C13.276 21.4149 13.4108 21.7187 13.6719 21.9791C13.933 22.2395 14.2368 22.3697 14.5833 22.3697C14.9299 22.3697 15.2337 22.2395 15.4948 21.9791L23.5156 13.9843C23.724 13.776 23.8802 13.5416 23.9844 13.2812C24.0885 13.0208 24.1406 12.7603 24.1406 12.4999C24.1406 12.2395 24.0885 11.9791 23.9844 11.7187C23.8802 11.4583 23.724 11.2239 23.5156 11.0156L15.4948 2.99472C15.2344 2.73431 14.926 2.60827 14.5698 2.6166C14.2135 2.62493 13.9056 2.75965 13.6458 3.02077C13.3861 3.28188 13.2559 3.5857 13.2552 3.93222C13.2545 4.27875 13.3847 4.58257 13.6458 4.84368L21.3021 12.4999Z" fill="#A5A5A5"/>
            </svg>
          </ProfileButton>
        </Profile>
        <img className="ad" src="/images/Advertising.png" alt="advertising" />
      </Right>
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
    </Wrapper>
  );
};

export default HomePage;

const Wrapper = styled.div`
  width: 100vw;

  display: grid;
  grid-template-columns: 1.9fr 1fr;
  gap: 2.68rem;

  padding: 0 5.44rem 0 4.44rem;
`

const Left = styled.div`
  width: 100%;
  height: calc(100vh - 5.5rem - 1.25rem); /* Right와 동일한 높이 */
  max-height: calc(100vh - 5.5rem - 1.25rem);

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`

const Top = styled.div`
  width: 100%;
  flex-shrink: 0; /* Top 영역이 축소되지 않도록 고정 */

  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  padding: 0 1rem;
  gap: 1.25rem;
  
  h1{
      width: 100%;
      text-align: left;
  }
`

const SearchBox = styled.div`
  width: 100%;
  display: flex;
  position: relative;

  margin-bottom: 0.25rem;

  svg{
    flex-shrink: 0;
    position: absolute;
    left: 2rem;       /* input 내부 오른쪽 여백 */
    top: 50%;
    transform: translateY(-50%);
  }
`

const Sort = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  gap: 1rem;

  padding-right: 0.45rem;
  margin-bottom: 1rem;
`

const SortButton = styled.button`
  background: none;
  border: none;

  transition: color 0.2s ease;

  &:hover {
        cursor: pointer;
        filter: brightness(0.9);
  }
  
  color: ${({ $isActive }) => $isActive ? 'var(--blue)' : 'var(--gray)'};
  font-weight: ${({ $isActive }) => $isActive ? '700' : 'none'};
`

const Feeding = styled.div`
  width: 100%;
  flex: 1; /* 남은 공간을 모두 차지 */
  overflow-y: auto; /* 세로 스크롤 활성화 */
  overflow-x: hidden; /* 가로 스크롤 방지 */

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;

  gap: 1rem;
  padding: 0 1rem 1rem 1rem;

  /* 스크롤바 숨기기 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE, Edge */

  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
`

const NoFeedMsg = styled.div`
    width: 100%;
    padding: 5rem 0;
    text-align: center;
    color: var(--gray);
    font-size: 1.2rem;
    font-weight: 500;
`

const Right = styled.div`
  width: 100%;
  height: calc(100vh - 5.5rem - 1.25rem); /* 뷰포트 높이 - topbar(5.5rem) - padding-top(1.25rem) */
  max-height: calc(100vh - 5.5rem - 1.25rem);
  overflow: hidden; /* 스크롤 방지 */

  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .ad {
    width: 100%;
    object-fit: contain; /* 이미지가 찌그러지지 않도록 */
    margin-bottom: 2rem;
  }
`

const Profile = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;

  h2 {
    width: 100%;
    text-align: left;
    margin-bottom: 0.69rem;
  }

  h3,p{
    white-space: nowrap;
  }
`

const ProfileButton = styled.button`
  width: 100%;

  display: flex;
  justify-content: space-between;
  align-items: center;

  width: 100%;
  padding: 1.5rem 1.66rem;
  gap: 2.77rem;


  background: var(--white);
  border-radius: 0.97744rem;
  border: 1px solid var(--light-gray);

  &:hover {
        cursor: pointer;
        filter: brightness(0.9);
  }

  svg {
    flex-shrink: 0; /* SVG 크기가 축소되지 않도록 */
  }
`

const Flag = styled.div`
  width: 4.20725rem;;
  height: 4.20725rem;;

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
    width: 2.5rem;
    height: 2.5rem;
  }
`

const TextContainer = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;

  gap: 0.13rem;

  color: var(--black);

  .body1 {
    color: #767676;
  }
`
