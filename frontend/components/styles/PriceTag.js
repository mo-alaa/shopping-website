import styled from 'styled-components';

const PriceTag = styled.span`
  background: ${props => props.theme.red};
  /* transform: rotate(3deg); */
  color:white;
  font-weight: 600;
  padding: 5px;
  line-height: 1;
  font-size: 3rem;
  display: inline-block;
  position: absolute;
  top: -7px;
  left: -7px;
  border-radius: 23px;
`;

export default PriceTag;
