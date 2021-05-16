import React, { Component } from "react";
import { Mutation, Query } from "react-apollo";
import gql from "graphql-tag";
import Router from "next/router";
import Form from "./styles/Form";
import formatMoney from "../lib/formatMoney";
import Error from "./ErrorMessage";

const SINGLE_ITEM_QUERY = gql`
  query SINGLE_ITEM_QUERY($id: ID!) {
    item(where: { id: $id }) {
      id
      title
      description
      price
    }
  }
`;
const UPDATE_ITEM_MUTAION = gql`
  mutation UPDATE_ITEM_MUTAION(
    $id: ID!
    $title: String #type string and required
    $description: String
    $price: Int #type int and required
  ) {
    # this is the name of the mutation in the schema at the backend
    updateItem(
      id: $id
      title: $title #title should use variable called title
      description: $description #description should use variable called description
      price: $price
    ) {
      id #and return the id
      title
      description
      price
    }
  }
`;

class UpdateItem extends Component {
  state = {};

  handleChange = (e) => {
    const { name, type, value } = e.target;
    //if it is a number parse it
    const val = type === "number" ? parseFloat(value) : value;
    this.setState({ [name]: val });
  };
  updateItem = async (e, updateItemMutaion) => {
    e.preventDefault();
    console.log("Updating........");

    const res = await updateItemMutaion({
      variables: {
        id: this.props.id,
        ...this.state,
      },
    });

    console.log("Updated!!!!!");
  };
  render() {
    return (
      <Query
        query={SINGLE_ITEM_QUERY}
        variables={{
          id: this.props.id,
        }}
      >
        {({ data, loading }) => {
          if (loading) return <p>Loading...</p>;
          if (!data.item) return <p>No Item found for ID {this.props.id}</p>;
          return (
            <Mutation mutation={UPDATE_ITEM_MUTAION} variables={this.state}>
              {(updateItem, { loading, error }) => (
                <Form onSubmit={(e) => this.updateItem(e, updateItem)}>
                  {/* if there is an error the error will show up, otherwise it won't be shown */}
                  <Error error={error} />
                  <fieldset disabled={loading} aria-busy={loading}>
                    <label htmlFor="title">
                      Title
                      <input
                        type="text"
                        id="title"
                        name="title"
                        placeholder="Title"
                        required
                        onChange={this.handleChange}
                        defaultValue={data.item.title}
                      />
                    </label>
                    <label htmlFor="price">
                      Price
                      <input
                        type="number"
                        id="price"
                        name="price"
                        placeholder="Price"
                        required
                        onChange={this.handleChange}
                        defaultValue={data.item.price}
                      />
                    </label>
                    <label htmlFor="description">
                      Description
                      <textarea
                        id="description"
                        name="description"
                        placeholder="Enter A Description"
                        required
                        onChange={this.handleChange}
                        defaultValue={data.item.description}
                      />
                    </label>
                    <button type="submit">
                      Sav{loading ? "ing" : "e"} Changes
                    </button>
                  </fieldset>
                </Form>
              )}
            </Mutation>
          );
        }}
      </Query>
    );
  }
}

export default UpdateItem;
//export the mutation to use it in other components
export { UPDATE_ITEM_MUTAION };
