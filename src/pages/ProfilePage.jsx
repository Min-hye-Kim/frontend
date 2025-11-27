import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Inputfield from "../components/Inputfield";
import SearchDropdown from "../components/SearchDropdown";
import Dropdown from "../components/Dropdown";
import Modal from "../components/Modal";
import Spinner from '../components/Spinner';
import { useDropdownData, useProfile } from "@/hooks";
import { ProfileAPI, SummariesAPI } from "@/apis";

// 프로필 페이지용 인풋 스타일
const profileInputStyle = {
  width: "19.5915rem",
  height: "2.93238rem",
  fontSize: "0.925rem",
  fontWeight: "500",
}

const ProfilePage = () => {
  const navigate = useNavigate();
  const { profile, setProfile } = useProfile();
  const [showModal, setShowModal] = React.useState(false);

  // 커스텀 훅으로 드롭다운 데이터 관리
  const {
    countryList,
    exUnivList,
    allExUnivs,
    typeList,
    filterExchangeUniversitiesByCountry
  } = useDropdownData();

  const [editMode, setEditMode] = useState(false);

  // 수정용 데이터
  const [editData, setEditData] = useState(null);

  // profile 불러오면 editData 초기화
  useEffect(() => {
    if (!profile || countryList.length === 0 || allExUnivs.length === 0) return;

    const matchedCountry = countryList.find(
      c => c.label === profile.exchange_country
    );

    filterExchangeUniversitiesByCountry(matchedCountry?.value);

    const matchedUniv = allExUnivs.find(
      u => u.univ_name === profile.exchange_university
    );

    setEditData({
      exchange_country: matchedCountry ?? "",
      exchange_type: typeList.find(t => t.label === profile.exchange_type) ?? "",
      exchange_university: matchedUniv
        ? { label: matchedUniv.univ_name, value: matchedUniv.id }
        : "",
      exchange_semester: profile.exchange_semester,
      exchange_period: profile.exchange_period,
    });
  }, [profile, countryList, allExUnivs]);

  if (!profile) {
    return (
      <div style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}>
        <Spinner />
      </div>
    );
  }

  // build flag src safely (encode in case of non-ascii names)
  const flagSrc = `/images/flags/${encodeURIComponent(profile.exchange_country)}.png`;

  // 입력 필드 변경
  const handleEditChange = (key) => (e) => {
    setEditData(prev => ({ ...prev, [key]: e.target.value }));
  };

  // 드롭다운 선택 처리
  const handleDropdownSelect = (key) => (option) => {
    setEditData(prev => ({
      ...prev,
      [key]: option
    }));

    if (key === "exchange_country") {
      filterExchangeUniversitiesByCountry(option.value);
    }
  };

  const toggleEdit = async () => {
    if (!editMode) {
      setEditMode(true);
      return;
    }
    try {
      const payload = {
        exchange_country: editData.exchange_country.label, // 국가명 문자열
        exchange_type: editData.exchange_type.value,       // 코드 (EX/VS/OT)
        exchange_univ: editData.exchange_university.label, // 대학명 문자열
        exchange_semester: editData.exchange_semester,
        exchange_period: editData.exchange_period,
      };
      console.log("payload:", payload)
      const res = await ProfileAPI.updateProfile(payload);
      console.log("res:", res)
      
      setProfile(res.data);
      setEditMode(false);
    } catch (err) {
      console.error(err);
      alert("프로필 업데이트 실패");
    }
  };

  const onMySum = async () => {
    const hasSnapshot = await SummariesAPI.getHasSnapshot();
    const hasSummary = hasSnapshot.data.has_summary_snapshot;

    if (!hasSummary) {
      setShowModal(true);
      return;
    }

    const mySumData = await SummariesAPI.getLatestSnapshot();
    const id = mySumData.data.snapshot_id;

    navigate(`/summaries/snapshot/${id}`);
  };

  const handleModalAction = () => {
    setShowModal(false);
    navigate('/accountbook');
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  return(
    <>
    {showModal && (
      <Modal
        isOpen={showModal}
        content="게시된 가계부 요약본이 없습니다."
        cancelText="닫기"
        actionText="요약본 게시하러 가기"
        onClose={handleCloseModal}
        onAction={handleModalAction}
      />
    )}
    <Wrapper>
        <h2 className="title">프로필</h2>
        <Box>
          <Container>
            <Flag>
                <img
                  src={flagSrc}
                  alt={profile.exchange_country}
                />
            </Flag>
            <TextContainer>
                <h3>{profile.name} (@{profile.user_id})</h3>
                <p className="body1">{profile.university}</p>
            </TextContainer>
          </Container>
        </Box>
        <EditContainer className="title">
          <h2>파견 정보</h2>
          {editMode ? (
            <h3
              className="blue"
              onClick={toggleEdit}
              style={{ cursor: 'pointer' }}
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
          )}
        </EditContainer>
        <Box>
          {editMode ? (
            <>
              <Input>
                <h3>파견 국가</h3>
                <SearchDropdown
                  options={countryList}
                  value={editData.exchange_country?.value}
                  searchPlaceholder="파견 국가를 검색하세요"
                  onSelect={handleDropdownSelect("exchange_country")}
                  customStyle={profileInputStyle}
                />
              </Input>
              <Input>
                <h3>파견 유형</h3>
                <Dropdown
                  options={typeList}
                  value={editData.exchange_type?.value}
                  onSelect={handleDropdownSelect("exchange_type")}
                  customStyle={profileInputStyle}
                />
              </Input>
              <Input>
                <h3>파견 학교</h3>
                <SearchDropdown
                  options={exUnivList}
                  value={editData.exchange_university?.value}
                  searchPlaceholder="파견 학교를 검색하세요"
                  onSelect={handleDropdownSelect("exchange_university")}
                  customStyle={profileInputStyle}
                />
              </Input>
              <Input>
                <h3>파견 시기</h3>
                <Inputfield 
                  customStyle={profileInputStyle}
                  value={editData.exchange_semester} 
                  onChange={handleEditChange("exchange_semester")} 
                />
              </Input>
              <Input>
                <h3>파견 기간</h3>
                <Inputfield 
                  customStyle={profileInputStyle}
                  value={editData.exchange_period} 
                  onChange={handleEditChange("exchange_period")} 
                />
              </Input>
            </>
          ) : (
            <>
              <Input>
                <h3>파견 국가</h3>
                <p className="body1">{profile.exchange_country}</p>
              </Input>
              <Input>
                <h3>파견 유형</h3>
                <p className="body1">{profile.exchange_type}</p>
              </Input>
              <Input>
                <h3>파견 학교</h3>
                <p className="body1">{profile.exchange_university}</p>
              </Input>
              <Input>
                <h3>파견 시기</h3>
                <p className="body1">{profile.exchange_semester}</p>
              </Input>
              <Input>
                <h3>파견 기간</h3>
                <p className="body1">{profile.exchange_period}</p>
              </Input>
            </>
          )}
        </Box>
        <Button onClick={onMySum}>
          <h3>내 게시글 바로가기</h3>
          <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 30 30" fill="none">
            <path d="M24.9127 14.6189L15.9585 23.5731C15.6539 23.8777 15.5065 24.233 15.5162 24.6391C15.526 25.0452 15.6835 25.4005 15.9889 25.7051C16.2943 26.0097 16.6496 26.162 17.0549 26.162C17.4602 26.162 17.8155 26.0097 18.1209 25.7051L27.5015 16.3549C27.7452 16.1113 27.9279 15.8372 28.0497 15.5326C28.1716 15.228 28.2325 14.9235 28.2325 14.6189C28.2325 14.3143 28.1716 14.0098 28.0497 13.7052C27.9279 13.4006 27.7452 13.1265 27.5015 12.8829L18.1209 3.50225C17.8163 3.19769 17.4557 3.05028 17.0391 3.06002C16.6224 3.06977 16.2622 3.22733 15.9585 3.53271C15.6547 3.83809 15.5024 4.19341 15.5016 4.59869C15.5008 5.00397 15.6531 5.35929 15.9585 5.66467L24.9127 14.6189Z" fill="#A5A5A5"/>
          </svg>
        </Button>
    </Wrapper>
    </>
  );
}

export default ProfilePage;

const Wrapper = styled.div`
  width: 36.71788rem;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-start;

  color: var(--black);

  h2 {
    text-align: left;
  }

  .body1 {
    color: #767676;
  }

  .title{
    margin-bottom: 1rem;
  }

  .blue{
    color: var(--blue);
  }
`

const Box = styled.div`
  width: 100%;
  padding: 1.5rem 1.66rem;
  margin-bottom: 1.38rem;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.09rem;

  background: var(--white);
  border-radius: 0.97744rem;
  border: 1px solid var(--light-gray);
`

const Container = styled.div`
  width: 100%;

  display: flex;
  justify-content: flex-start;
  align-items: center;

  gap: 3.69rem;
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

const EditContainer = styled.div`
  width: 100%;

  display: flex;
  justify-content: space-between;
  align-items: center;

  gap: 0.19rem;
`

const TextContainer = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;

  gap: 0.13rem;
`

const Input = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  gap: 6.62rem;
`

const Button = styled.button`
  width: 100%;
  padding: 1.5rem 1.66rem;
  margin-bottom: 2.5rem;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background: var(--white);
  border-radius: 0.97744rem;
  border: 1px solid var(--light-gray);

  color: var(--black);

  &:hover {
        cursor: pointer;
        filter: brightness(0.9);
  }
`