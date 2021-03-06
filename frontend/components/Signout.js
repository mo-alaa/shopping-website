import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import { CURRENT_USER_QUERY } from "./User";

const SING_OUT_MUTATION = gql`
  mutation SING_OUT_MUTATION {
    signout {
      message
    }
  }
`;
const Signout = (props) => (
  <Mutation
    mutation={SING_OUT_MUTATION}
    refetchQueries={[{ query: CURRENT_USER_QUERY }]}
  >
    {(signout) => <button onClick={signout}>Sign out</button>}
  </Mutation>
);
export default Signout;
