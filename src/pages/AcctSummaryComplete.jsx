import React from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import SquareButton from "../components/button/SquareButton";
import { SummariesAPI } from "@/apis";

//
// ————————————————————— 마크업/로직 ————————————————————————
// 가계부 요약본_uploaded
// AcctSummaryProfileData.jsx 에서 popup 창 확인 누를 시 여기로 이동

const signupCompleteButtonStyle = {
  width: "13rem",
  height: "3.25rem",
  backgroundColor: "var(--black)",
}

const SignupCompletePage = () => {
  const navigate = useNavigate();
  const onMySum = async () => {
    const mySumData = await SummariesAPI.getSnapshot();
    const id = mySumData.data.id;

    navigate(`/summaries/snapshot/${id}`);
  }

  return(
    <Wrapper>
      <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none">
        <circle cx="50" cy="50" r="50" fill="#115BCA"/>
        <path d="M41.6282 60.667L69.8782 32.417C70.5449 31.7503 71.3227 31.417 72.2115 31.417C73.1004 31.417 73.8782 31.7503 74.5449 32.417C75.2115 33.0837 75.5449 33.8759 75.5449 34.7937C75.5449 35.7114 75.2115 36.5025 74.5449 37.167L43.9615 67.8337C43.2949 68.5003 42.5171 68.8337 41.6282 68.8337C40.7393 68.8337 39.9615 68.5003 39.2949 67.8337L24.9615 53.5003C24.2949 52.8337 23.9749 52.0426 24.0015 51.127C24.0282 50.2114 24.376 49.4192 25.0449 48.7503C25.7138 48.0814 26.506 47.7481 27.4215 47.7503C28.3371 47.7525 29.1282 48.0859 29.7949 48.7503L41.6282 60.667Z" fill="white"/>
      </svg>
      <h1>게시가 완료되었습니다!</h1>
      <SquareButton
        onClick={onMySum}
        customStyle={signupCompleteButtonStyle}
      >
        <span className="h3">게시글 바로가기</span>
      </SquareButton>
    </Wrapper>
  );
};

export default SignupCompletePage;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 1.88rem;
`