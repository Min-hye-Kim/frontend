import React, { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import SquareButton from "../components/button/SquareButton";
import CircleButton from "../components/button/CircleButton";
import Inputfield from "../components/Inputfield";
import SearchDropdown from "../components/SearchDropdown";
import Dropdown from "../components/Dropdown";
import { SignupAPI } from "@/apis";
import { useDropdownData } from "@/hooks";

// 회원가입 페이지용 인풋 스타일
const signupInputStyle = {
  width: "30.5rem",
  padding: "0.54rem 0.71rem",
}

// 에러 상태일 때의 인풋필드 추가 스타일
const errorInputStyle = {
  ...signupInputStyle,
  borderColor: "var(--red)"
}

// 회원가입 페이지용 드롭다운 스타일
const signupDropStyle = {
  width: "30.5rem",
}

// 에러 상태일 때의 드롭다운 추가 스타일
const errorDropStyle = {
  ...signupDropStyle,
  borderColor: "var(--red)"
}

// 회원가입 페이지용 성별 버튼 스타일
const signupButtonStyle = {
  width: "15.25rem",
  height: "3rem",
  border: "1px solid var(--light-gray, #A5A5A5)",
  background: "var(--white, #fff)",
  color: "var(--black, #000)",
  fontSize: "1rem",
  fontWeight: "400",
}

// 클릭된 상태의 성별 버튼 스타일
const signupButtonClickedStyle = {
  ...signupButtonStyle,
  border: "none",
  background: "var(--blue, #115BCA)",
  color: "var(--white, #fff)",
}

// 에러 상태일 때의 성별 버튼 추가 스타일
const errorButtonStyle = {
  ...signupButtonStyle,
  borderColor: "var(--red)"
}

const SignupPage = () => {
  const navigate = useNavigate();

  // 커스텀 훅으로 드롭다운 데이터 관리
  const {
    univList,
    countryList,
    exUnivList,
    typeList,
    filterExchangeUniversitiesByCountry
  } = useDropdownData();

  const [id, setId] = useState(""); // 아이디 값
  const [idError, setIdError] = useState(""); // 아이디 에러 메시지

  const [password, setPassword] = useState(""); // 비밀번호 값
  const [passwordError, setPasswordError] = useState(""); // 비밀번호 에러 메시지

  const [passwordCheck, setPasswordCheck] = useState(""); // 비밀번호 확인 값
  const [passwordCheckError, setPasswordCheckError] = useState(""); // 비밀번호 확인 에러 메시지

  const [nickname, setNickname] = useState(""); // 닉네임 값
  const [nicknameError, setNicknameError] = useState(""); // 닉네임 에러 메시지

  const [gender, setGender] = useState(""); // 선택된 성별
  const [genderError, setGenderError] = useState(""); // 성별 에러 메시지

  const [univ, setSelectedUniv] = useState(null); // 선택된 본교
  const [univError, setUnivError] = useState(""); // 본교 선택 에러 메시지

  const [country, setCountry] = useState(""); // 선택된 파견국가
  const [countryError, setCountryError] = useState(""); // 파견국가 에러 메시지

  const [exUniv, setexUniv] = useState(""); // 선택된 파견학교
  const [exUnivError, setExUnivError] = useState(""); // 파견학교 에러 메시지

  const [type, setType] = useState(""); // 선택된 파견유형
  const [typeError, setTypeError] = useState(""); // 파견유형 에러 메시지

  const [time, setTime] = useState(""); // 선택된 파견시기
  const [timeError, setTimeError] = useState(""); // 파견시기 에러 메시지

  const [period, setPeriod] = useState(""); // 선택된 파견기간
  const [periodError, setPeriodError] = useState(""); // 파견기간 에러 메시지

  // 선택된 국가에 따라 파견학교 목록 필터링
  useEffect(() => {
    filterExchangeUniversitiesByCountry(country);
  }, [country]);

  const onClick = async () => {
    try {
      const userData = {
        account: {
          username: id,
          password: password,
          passwordConfirm: passwordCheck,
          nickname: nickname,
          gender: gender,
          homeUniversity: univ?.label,
        },
        dispatch:{
          country: country?.label || country,
          hostUniversity: exUniv?.label,
          dispatchType: type?.label || type, // 한글명
          term:  time,
          duration: period,
        }
      };
      const res = await SignupAPI.signup(userData);
      //console.log("전송할 데이터:", userData);
      //console.log("API 응답:", res);
      
      // 응답에 에러가 있는지 확인
      if (res.error) {
        // 각 필드별 에러 처리
        if (res.error.account) {
          if (res.error.account.username) {
            setIdError("* " + res.error.account.username[0]);
          }
          if (res.error.account.password) {
            setPasswordError("* " + res.error.account.password[0]);
          }
          if (res.error.account.nickname) {
            setNicknameError("* " + res.error.account.nickname[0]);
          }
        }
        // 기타 에러
        if (res.error.dispatch) {
          console.log("파견 정보 에러:", res.error.dispatch);
        }
        alert("회원가입에 실패하였습니다.");
        return; // 에러가 있으면 여기서 중단
      }
      
      // 성공 시에만 페이지 이동
      navigate("/signup/complete");
    } catch(err) {
      console.error("회원가입 네트워크 에러:", err);
      alert("네트워크 오류가 발생했습니다.");
    }
  }

  // 각 인풋필드에 대한 ref 생성 (13개 필드)
  const inputRefs = useRef(Array.from({length: 13}, () => React.createRef()));
  
  // 통합 키보드 핸들러
  const handleKeyDown = (e, currentIndex) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const nextIndex = currentIndex + 1;
      if (nextIndex < inputRefs.length) {
        inputRefs[nextIndex].current?.focus();
      }
    }
  };

  // 회원가입 버튼 클릭 핸들러
  const handleSignup = () => {
    let hasError = false;

    // 아이디 입력여부 검증
    if (id.length < 1) {
      setIdError("* 아이디를 입력하세요");
      hasError = true;
    }
    
    // 비밀번호 8자 이상 검증
    if (password.length < 8) {
      setPasswordError("* 비밀번호를 8자 이상 입력하세요");
      hasError = true;
    }

    // 비밀번호 일치 여부 검증
    if (passwordCheck!=password || password.length < 8) {
      setPasswordCheckError("* 비밀번호가 일치하지 않습니다");
      hasError = true;
    }

    // 비밀번호 일치 여부 검증
    if (nickname.length<1 || nickname.length>10) {
      setNicknameError("* 닉네임을 10자 이내로 입력하세요");
      hasError = true;
    }

    // 성별 선택여부 검증
    if (!gender) {
      setGenderError("* 성별을 선택하세요");
      hasError = true;
    }

    // 본교 선택여부 검증
    if (!univ) {
      setUnivError("* 본교를 선택하세요");
      hasError = true;
    }

    // 파견국가 선택여부 검증
    if (!country) {
      setCountryError("* 파견 국가를 선택하세요");
      hasError = true;
    }

    // 파견학교 선택여부 검증
    if (!exUniv) {
      setExUnivError("* 파견 학교를 선택하세요");
      hasError = true;
    }

    // 파견유형 선택여부 검증
    if (!type) {
      setTypeError("* 파견 유형을 선택하세요");
      hasError = true;
    }

    // 파견시기 입력여부 검증
    if (time.length < 1) {
      setTimeError("* 파견 시기를 입력하세요");
      hasError = true;
    }

    // 파견기간 입력여부 검증
    if (period.length < 1) {
      setPeriodError("* 파견 기간를 입력하세요");
      hasError = true;
    }
    
    // 에러가 있으면 로그인 실행하지 않음
    if (hasError) {
      alert("회원가입에 실패하였습니다.");
      return;
    }
    
    // 검증 통과 시 기존 회원가입 로직 실행
    onClick();
  }

  // 공통 입력 변경 핸들러
  const createInputHandler = (setValue, setError) => (e) => {
    setValue(e.target.value);
    setError("");
  };

  // 공통 선택 핸들러
  const createSelectHandler = (setValue, setError) => (option) => {
    setValue(option);
    setError("");
  };

  // 핸들러들
  const handleIdChange = createInputHandler(setId, setIdError);
  const handlePasswordChange = createInputHandler(setPassword, setPasswordError);
  const handlePasswordCheckChange = createInputHandler(setPasswordCheck, setPasswordCheckError);
  const handleNicknameChange = createInputHandler(setNickname, setNicknameError);
  const handleTimeChange = createInputHandler(setTime, setTimeError);
  const handlePeriodChange = createInputHandler(setPeriod, setPeriodError);
  
  const handleGenderSelect = createSelectHandler(setGender, setGenderError);
  const handleUnivSelect = createSelectHandler(setSelectedUniv, setUnivError);
  const handleCountrySelect = createSelectHandler(setCountry, setCountryError);
  const handleExUnivSelect = createSelectHandler(setexUniv, setExUnivError);
  const handleTypeSelect = createSelectHandler(setType, setTypeError);

  return(
    <Wrapper>
      <img src="/icons/Logo.svg" alt="로고" style={{width: "13.93656rem"}}/>
      <h2 className="title">개인정보 입력</h2>
      <Container>
        <Input>
          <h3>아이디</h3>
          <Inputfield
            ref={inputRefs[0]}
            placeholder="아이디"
            value={id}
            onChange={handleIdChange}
            customStyle={idError ? errorInputStyle : signupInputStyle}
            onKeyDown={(e) => handleKeyDown(e, 0)}
          />
          <ErrorMessage>
            {idError || " "}
          </ErrorMessage>
        </Input>
        <Input>
          <h3>비밀번호</h3>
          <Inputfield
            ref={inputRefs[1]}
            type="password"
            placeholder="비밀번호 (최소 8자)"
            value={password}
            onChange={handlePasswordChange}
            customStyle={passwordError ? errorInputStyle : signupInputStyle}
            onKeyDown={(e) => handleKeyDown(e, 1)}
          />
          <ErrorMessage>
            {passwordError || " "}
          </ErrorMessage>
        </Input>
        <Input>
          <h3>비밀번호 확인</h3>
          <Inputfield
            ref={inputRefs[2]}
            type="password"
            placeholder="비밀번호 확인 (최소 8자)"
            value={passwordCheck}
            onChange={handlePasswordCheckChange}
            customStyle={passwordCheckError ? errorInputStyle : signupInputStyle}
            onKeyDown={(e) => handleKeyDown(e, 2)}
          />
          <ErrorMessage>
            {passwordCheckError || " "}
          </ErrorMessage>
        </Input>
        <Input>
          <h3>닉네임</h3>
          <Inputfield
            ref={inputRefs[3]}
            placeholder="닉네임 (최대 10자)"
            value={nickname}
            onChange={handleNicknameChange}
            customStyle={nicknameError ? errorInputStyle : signupInputStyle}
            onKeyDown={(e) => handleKeyDown(e, 3)}
          />
          <ErrorMessage>
            {nicknameError || " "}
          </ErrorMessage>
        </Input>
        <Input>
          <h3>성별</h3>
          <ButtonContainer>
            <CircleButton 
              ref={inputRefs[4]}
              onClick={() => handleGenderSelect("남성")}
              customStyle={gender === "남성" ? signupButtonClickedStyle : (genderError ? errorButtonStyle : signupButtonStyle)}
              onKeyDown={(e) => handleKeyDown(e, 4)}
            >
              남성
            </CircleButton>
            <CircleButton 
              ref={inputRefs[5]}
              onClick={() => handleGenderSelect("여성")}
              customStyle={gender === "여성" ? signupButtonClickedStyle : (genderError ? errorButtonStyle : signupButtonStyle)}
              onKeyDown={(e) => handleKeyDown(e, 5)}
            >
              여성
            </CircleButton>
          </ButtonContainer>
          <ErrorMessage>
            {genderError || " "}
          </ErrorMessage>
        </Input>
        <Input>
          <h3>본교</h3>
          <SearchDropdown
            ref={inputRefs[6]}
            options={univList}
            placeholder="본교 선택"
            searchPlaceholder="학교를 검색하세요"
            value={univ?.value}
            onSelect={handleUnivSelect}
            customStyle={univError ? errorDropStyle : signupDropStyle}
            onKeyDown={(e) => handleKeyDown(e, 6)}
          />
          <ErrorMessage>
            {univError || " "}
          </ErrorMessage>
        </Input>
      </Container>
      <h2 className="title">파견정보 입력</h2>
      <Container>
        <Input>
          <h3>파견 국가</h3>
          <SearchDropdown
            ref={inputRefs[7]}
            options={countryList}
            placeholder="파견 국가 선택"
            searchPlaceholder="파견 국가를 검색하세요"
            value={country?.value}
            onSelect={handleCountrySelect}
            customStyle={countryError ? errorDropStyle : signupDropStyle}
            onKeyDown={(e) => handleKeyDown(e, 7)}
          />
          <ErrorMessage>
            {countryError || " "}
          </ErrorMessage>
        </Input>
        <Input>
          <h3>파견 학교</h3>
          <SearchDropdown
            ref={inputRefs[8]}
            options={exUnivList}
            placeholder="파견 학교 선택"
            searchPlaceholder="파견 학교를 검색하세요"
            value={exUniv?.value}
            onSelect={handleExUnivSelect}
            customStyle={exUnivError ? errorDropStyle : signupDropStyle}
            onKeyDown={(e) => handleKeyDown(e, 8)}
          />
          <ErrorMessage>
            {exUnivError || " "}
          </ErrorMessage>
        </Input>
        <Input>
          <h3>파견 유형</h3>
          <Dropdown
            ref={inputRefs[9]}
            options={typeList}
            placeholder="파견 유형 선택"
            value={type?.value}
            onSelect={handleTypeSelect}
            customStyle={typeError ? errorDropStyle : signupDropStyle}
            onKeyDown={(e) => handleKeyDown(e, 9)}
          />
          <ErrorMessage>
            {typeError || " "}
          </ErrorMessage>
        </Input>
        <Input>
          <h3>파견 시기</h3>
          <Inputfield
            ref={inputRefs[10]}
            placeholder="예: 2024년 2학기"
            value={time}
            onChange={handleTimeChange}
            customStyle={timeError ? errorInputStyle : signupInputStyle}
            onKeyDown={(e) => handleKeyDown(e, 10)}
          />
          <ErrorMessage>
            {timeError || " "}
          </ErrorMessage>
        </Input>
        <Input>
          <h3>파견 기간</h3>
          <Inputfield
            ref={inputRefs[11]}
            placeholder="예: 3개월"
            value={period}
            onChange={handlePeriodChange}
            customStyle={periodError ? errorInputStyle : signupInputStyle}
            onKeyDown={(e) => handleKeyDown(e, 11)}
          />
          <ErrorMessage>
            {periodError || " "}
          </ErrorMessage>
        </Input>
      </Container>
      <SquareButton
        ref={inputRefs[12]}
        onClick={handleSignup}
      >
        <span className="h2">회원가입</span>
      </SquareButton>
    </Wrapper>
  );
};

export default SignupPage;

const Wrapper = styled.div`
  width: 30.88rem;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  margin-bottom: 5rem;

  img{
    margin-top: 2rem;
    margin-bottom: 3.85rem;
  }

  h2.title {
    width: 100%;
    margin-bottom: 3.85rem;
    text-align: left;
    color: var(--deep-blue);

    margin-bottom: 1.5rem;
  }
`

const Container = styled.div`
  width: 30.88rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.5rem;

  margin-left: 0.19rem;  
  margin-bottom: 3.5rem;
`

const Input = styled.div`
  width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  
  h3{
    width: 100%;
    text-align: left;
    font-weight: var(--fw-md);

    margin-bottom: 0.27rem;
  }
`

const ErrorMessage = styled.div`
  color: var(--red);
  font-size: 0.9rem;
  min-height: 1rem;
  display: flex;
  align-items: left;
  position: absolute;
  top: 100%;
  left: 0;
  padding-top: 0.15rem;
  padding-left: 0.5rem;
`

const ButtonContainer = styled.div`
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
`