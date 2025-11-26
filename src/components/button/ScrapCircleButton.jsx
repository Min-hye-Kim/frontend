import React, { useState } from "react";
import styled from "styled-components";


const ScrapCircleButton = ({ scrapped, scrapCount, onToggle, disabled }) => {
    
    return (
        <StyledScrapCircleButton onClick={onToggle} $isScrapped={scrapped} disabled={disabled}>
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="15" viewBox="-1 -1 13 16" fill="none">
                <path d="M9.72124 0H1.62021C0.729093 0 0 0.729093 0 1.62021V14.5819L5.67072 12.1515L11.3414 14.5819V1.62021C11.3414 0.729093 10.6124 0 9.72124 0Z" fill="var(--white, #fff)" stroke={scrapped? "var(--white, #fff)" : "var(--gray, #A5A5A5)"} strokeWidth="1"/>
            </svg>
            {scrapCount}
        </StyledScrapCircleButton>
    );
}

export default ScrapCircleButton;

const StyledScrapCircleButton = styled.button`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.62rem;

    height: 2.69rem;
    width: 6.08rem;

    white-space: nowrap;

    border-radius: 2.5rem;

    border: ${({ $isScrapped }) =>
    $isScrapped ? "none" : "1px solid var(--gray, #A5A5A5)"};

    background: ${({ $isScrapped }) =>
    $isScrapped ? "var(--blue, #115BCA)" : "var(--white, #fff)"};

    color: ${({ $isScrapped }) =>
    $isScrapped ? "var(--white, #fff)" : "var(--black, #000)"};

    font-size: 0.92113rem;
    font-weight: 700;

    cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};

    &:hover {
            filter: ${({ disabled }) => (disabled ? "none" : "brightness(0.9)")};
    }
`;