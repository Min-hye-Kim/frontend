import SpinnerImage from "../../src/assets/Spinner.svg";
import styled, { keyframes } from "styled-components";

const Spinner = () => {
  return <SpinnerComponent src={SpinnerImage} alt="Loading.." />;
};

const rotation = keyframes`
    from{
        transform: rotate(0deg);
    }

    to{
        transform: rotate(360deg);
    }

`;
const SpinnerComponent = styled.img`
  width: 3rem;
  height: 3rem;
  animation: ${rotation} 0.8s linear infinite;
`;

export default Spinner;