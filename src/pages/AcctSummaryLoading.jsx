import React, { useEffect } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Spinner from "../components/Spinner";
import BackTopbar from "../components/topbar/BackTopbar";

const AcctSummaryLoading = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // 2초 후 세부 프로필 입력 페이지로 이동
    const timer = setTimeout(() => {
      navigate("/summaries/loading");
    }, 2000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <>
      <BackTopbar />
      <Wrapper>
        <ContentContainer>
          <Spinner />
          <TextContainer>
            <MainText>요약본을 열심히 생성하고 있어요.</MainText>
            <SubText>잠시만 기다려주세요. 약 ~분이 소요됩니다.</SubText>
          </TextContainer>
        </ContentContainer>
      </Wrapper>
    </>
  );
};

export default AcctSummaryLoading;

//
// —————————————————————  스타일링 ————————————————————————

const Wrapper = styled.div`
  width: 100%;
  flex: 1;
  background: var(--white, #fff);

  display: flex;
  justify-content: center;
  align-items: center;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.40625rem;
`;

const TextContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.46875rem;
`;

const MainText = styled.h1`
  color: var(--black, #000);
  font-family: var(--font-main);
  font-size: 2.15625rem;
  font-weight: 700;
  line-height: 3.2375rem;
  text-align: center;
  white-space: pre-wrap;
`;

const SubText = styled.h3`
  color: var(--gray, #a5a5a5);
  font-family: var(--font-main);
  font-size: 1.125rem;
  font-weight: 700;
  line-height: 1.6875rem;
  text-align: center;
  white-space: pre-wrap;
`;
