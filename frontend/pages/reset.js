import Reset from "../components/Reset";

const reset = (props) => (
  <div>
    <p>reset pass for token {props.query.resetToken}</p>
    <Reset resetToken={props.query.resetToken} />
  </div>
);

export default reset;
