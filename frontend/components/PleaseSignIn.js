import { Query } from "react-apollo";
import { CURRENT_USER_QUERY } from "./User";
import Signin from "./Signin";
import Error from "./ErrorMessage";

const PleaseSignIn = (props) => (
  <Query query={CURRENT_USER_QUERY}>
    {({ data, loading, error }) => {
      if (loading) return <p>Loading...</p>;

      <Error error={error} />;

      if (!data.me) {
        return (
          <div>
            <p>Please Sign In</p>
            <Signin />
          </div>
        );
      }

      return props.children;
    }}
  </Query>
);

export default PleaseSignIn;
