import React, { useState } from "react";
import styled from "styled-components";


const LikeCircleButton = ({ liked, likeCount, onToggle, disabled }) => {
    
    return (
        <StyledLikeCircleButton onClick={onToggle} $isLiked={liked} disabled={disabled}>
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="15" viewBox="-1 -1 18 16" fill="none">
                <path d="M4.60921 7.35221e-07C2.06367 7.35221e-07 0 2.06367 0 4.60921C0 9.21842 5.44725 13.4086 8.38038 14.3832C11.3135 13.4086 16.7608 9.21842 16.7608 4.60921C16.7608 2.06367 14.6971 7.35221e-07 12.1515 7.35221e-07C10.5928 7.35221e-07 9.21423 0.773929 8.38038 1.9585C7.95528 1.35317 7.39063 0.85916 6.7342 0.518254C6.07777 0.177348 5.34888 -0.000417196 4.60921 7.35221e-07Z" fill="var(--white, #fff)" stroke={liked? "var(--white, #fff)" : "var(--gray, #A5A5A5)"} strokeWidth="1"/>
            </svg>
            {likeCount}
        </StyledLikeCircleButton>
    );
}

export default LikeCircleButton;

const StyledLikeCircleButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.62rem;

    height: 2.69rem;
    width: 6.08rem;

    white-space: nowrap;

    border-radius: 2.5rem;

    border: ${({ $isLiked }) =>
    $isLiked ? "none" : "1px solid var(--gray, #A5A5A5)"};

    background: ${({ $isLiked }) =>
    $isLiked ? "var(--red, #CA1111)" : "var(--white, #fff)"};

    color: ${({ $isLiked }) =>
    $isLiked ? "var(--white, #fff)" : "var(--black, #000)"};

    font-size: 0.92113rem;
    font-weight: 700;

    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

    &:hover {
            filter: ${({ disabled }) => (disabled ? "none" : "brightness(0.9)")};
    }
`;