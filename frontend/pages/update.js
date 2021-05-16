import Link from "next/link";
import UpdateItem from "../components/UpdateItem";

const Update = ({ query }) => (
  <div>
    <UpdateItem id={query.id} />
  </div>
);

export default Update;

// if look at the Item.js, we are passing the id to this component, (pathname, query,...)
//but we need it to be passed also to the child components, we can pass it via props.
//the query is passed to us here via getInitialProps (in the app component), all children can see the query.
//if we didn't do the getInitialProps we would wrap our Update with: withRouter(Update) and it would have access to the query
