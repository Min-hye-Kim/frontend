import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate} from 'react-router-dom';
import CircleButton from "../button/CircleButton"
import Modal from "../Modal";


const BackTopbar = ({ disabled = true, onClick }) => {
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 게시하기 버튼 클릭 시 모달 오픈
    const handlePublish = () => {
        setIsModalOpen(true);
    };

    // 모달에서 네(확인) 클릭 시 동작 (예시: 실제 게시 로직 필요시 추가)
    const handleConfirm = () => {
        setIsModalOpen(false);
        if (onClick) { onClick(); }
    };

    // 모달에서 아니오/닫기 클릭 시
    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Wrapper>
                <Button onClick={() => navigate(-1)}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="28" viewBox="0 0 16 28" fill="none">
                        <path d="M3.97396 13.8372L14.6927 24.556C15.0573 24.9205 15.2338 25.3459 15.2221 25.832C15.2104 26.3181 15.0218 26.7435 14.6563 27.108C14.2907 27.4726 13.8653 27.6549 13.3802 27.6549C12.8951 27.6549 12.4697 27.4726 12.1042 27.108L0.875 15.9153C0.583333 15.6237 0.364583 15.2955 0.21875 14.931C0.0729167 14.5664 0 14.2018 0 13.8372C0 13.4726 0.0729167 13.108 0.21875 12.7435C0.364583 12.3789 0.583333 12.0508 0.875 11.7591L12.1042 0.529918C12.4688 0.165334 12.9004 -0.011124 13.3992 0.000542636C13.8979 0.0122093 14.3291 0.20082 14.6927 0.566376C15.0563 0.931932 15.2386 1.35728 15.2396 1.84242C15.2406 2.32756 15.0583 2.7529 14.6927 3.11846L3.97396 13.8372Z" fill="black"/>
                    </svg>
                    이전으로
                </Button>
                <CircleButton onClick={handlePublish} disabled={disabled} toggleOnClick={false}>게시하기</CircleButton>
            </Wrapper>
            <Modal
                isOpen={isModalOpen}
                content="게시하시겠습니까?"
                subtext="게시 후에도 게시물을 수정하실 수 있습니다."
                customContentStyle={`
                  font-size: 1.3125rem;
                  font-weight: 700;
                `}
                customSubtextStyle={`
                  font-size: 0.9rem;
                  color: var(--dark-gray);
                `}
                actionText="네"
                cancelText="아니오"
                showCancelButton={true}
                showImage={false}
                onAction={handleConfirm}
                onCancel={handleCancel}
                onClose={handleCancel}
            />
        </>
    );
};

export default BackTopbar;


const Wrapper = styled.div`
    width: 100vw;
    height: 5.5rem;

    position: fixed; 
    top: 0;
    left: 0;  

    display: flex;
    justify-content: space-between;
    align-items: center;

    padding: 0 2.56rem;

    background-color: var(--white);

    z-index: 1000;
`

const Button = styled.button`
    display: flex;
    align-items: center;
    
    background-color: transparent;
    border: none;
    padding: 0;
    gap: 1.16rem;

    color: var(--black);


    &:focus,
    &:active {
        outline: none;
        box-shadow: none;
        background-color: transparent;
    }
`
