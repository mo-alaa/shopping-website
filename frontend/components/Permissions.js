import { Query, Mutation } from "react-apollo";
import gql from "graphql-tag";
import checkPropTypes from "prop-types/checkPropTypes";
import propTypes from "prop-types";
import Error from "./ErrorMessage";
import Table from "./styles/Table";
import SickButton from "./styles/SickButton";

const possiblePermission = [
  "ADMIN",
  "USER",
  "ITEMCREATE",
  "ITEMUPDATE",
  "ITEMDELETE",
  "PERMISSIONUPDATE",
];

const UPDATE_PERMISSION_MUTATION = gql`
  mutation updatePermissions($permissions: [Permission], $userId: ID!) {
    updatePermissions(permissions: $permissions, userId: $userId) {
      id
      name
      email
      permissions
    }
  }
`;
const ALL_USERS_QUERY = gql`
  query {
    users {
      id
      name
      email
      permissions
    }
  }
`;

const Permissions = (props) => (
  <Query query={ALL_USERS_QUERY}>
    {({ data, error, loading }) => (
      <div>
        <Error error={error} />
        <h2>Manage Accounts</h2>
        <Table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              {possiblePermission.map((permission) => (
                <th key={permission}>{permission}</th>
              ))}
              <th>👇</th>
            </tr>
          </thead>
          <tbody>
            {data.users.map((user) => (
              <UserPermissions key={user.id} user={user} />
            ))}
          </tbody>
        </Table>
      </div>
    )}
  </Query>
);

class UserPermissions extends React.Component {
  static propTypes = {
    user: propTypes.shape({
      name: propTypes.string,
      email: propTypes.string,
      id: propTypes.string,
      permissions: propTypes.array,
    }).isRequired,
  };

  state = {
    permissions: this.props.user.permissions,
  };

  handlePermissionChange = (e) => {
    const checkbox = e.target;
    //take a copy of the current permissions
    let updatePermissions = [...this.state.permissions];
    //figure out if we need to remove or add this permission
    if (checkbox.checked) {
      //add it in
      updatePermissions.push(checkbox.value);
    } else {
      updatePermissions = updatePermissions.filter(
        (permission) => permission !== checkbox.value
      );
    }

    this.setState({ permissions: updatePermissions });
  };

  render() {
    const user = this.props.user;

    return (
      <Mutation
        mutation={UPDATE_PERMISSION_MUTATION}
        variables={{
          permissions: this.state.permissions,
          userId: user.id,
        }}
      >
        {(updatePermissions, { error, loading }) => (
          <>
            {error && (
              <tr>
                <td colSpan="8">
                  <Error error={error} />
                </td>
              </tr>
            )}
            <tr>
              <td>{user.name}</td>
              <td>{user.email}</td>
              {possiblePermission.map((permission) => (
                <td key={permission}>
                  <label htmlFor={`${user.id}-permission-${permission}`}>
                    <input
                      id={`${user.id}-permission-${permission}`}
                      type="checkbox"
                      checked={this.state.permissions.includes(permission)}
                      value={permission}
                      onChange={this.handlePermissionChange}
                    />
                  </label>
                </td>
              ))}
              <td>
                <SickButton
                  type="button"
                  disabled={loading}
                  onClick={updatePermissions}
                >
                  Updat{loading ? "ing" : "e"}
                </SickButton>
              </td>
            </tr>
          </>
        )}
      </Mutation>
    );
  }
}

export default Permissions;
