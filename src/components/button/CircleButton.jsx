import React, { useState, forwardRef } from "react";
import styled from "styled-components";

const CircleButton = forwardRef(({
  children,       // 버튼 안의 내용
  onClick,        // 클릭 시 실행할 함수
  disabled = false, // 비활성화 여부
  customStyle,       // 인라인 스타일 오버라이드
  onKeyDown, // 키보드 이벤트를 받을 props
  toggleOnClick = true, // 클릭 시 토글 여부 (기본 true)
}, ref) => {
    const [isClickedIn, setIsClickedIn] = useState(false);
    const handleClick = (e) => {
        if (toggleOnClick) {
            setIsClickedIn((prev) => !prev);   // 내부 토글
        }
        onClick?.(e);                   // 외부 onClick 실행
    };

    const handleKeyDown = (e) => {
        // 엔터키나 스페이스키로 버튼 클릭
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e);
        }
        // 외부 onKeyDown 핸들러도 실행
        onKeyDown?.(e);
    };
    
    return (
        <StyledCircleButton
        onClick={handleClick}
        $isClickedIn={isClickedIn}
        disabled={disabled}
        $customStyle={customStyle} // 커스텀 스타일 전달
        onKeyDown={handleKeyDown} // 내부 키보드 이벤트 처리
        ref={ref} // ref 전달
        tabIndex={0} // 키보드 포커스 허용
        >
            {children}
        </StyledCircleButton>
    );
});

export default CircleButton;

const StyledCircleButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;

    height: 3.25rem;
    width: 6.5625rem;

    white-space: nowrap;

    border-radius: 2.5rem;

    border: ${({ $isClickedIn }) =>
    $isClickedIn ? "1px solid var(--gray, #A5A5A5)" : "none"};

    background: ${({ $isClickedIn }) =>
    $isClickedIn ? "var(--white, #fff)" : "var(--blue, #115BCA)"};

    color: ${({ $isClickedIn }) =>
    $isClickedIn ? "var(--black, #000)" : "var(--white, #fff)"};

    font-size: 1.125rem;
    font-weight: 500;

    &:hover {
        cursor: pointer;
        filter: brightness(0.9);
    }

    &:focus {
        outline: 1px solid var(--blue, #115BCA);
        outline-offset: 2px;
    }

    &:disabled {
        background: var(--gray, #A5A5A5);
        cursor: not-allowed;
        color: var(--white)
    }

    /* 커스텀 스타일 적용 */
    ${({ $customStyle }) => $customStyle && $customStyle}
`;