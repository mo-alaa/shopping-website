import React, { Component } from "react";

//allow us to directly query data into this component
import { Query } from "react-apollo";

//this is needed to write query
import gql from "graphql-tag";

// import styled from 'styled-component';
import styled from "styled-components";

import Item from "./Item";
import Pagination from "./Pagination";
import { perPage } from "../config";

const ALL_ITEMS_QUERY = gql`
  query ALL_ITEMS_QUERY($skip: Int=0, $first: Int=${perPage}) {
    items (first: $first, skip: $skip, orderBy: createdAt_DESC) {
      id
      title
      price
      description
      image
      largeImage
    }
  }
`;

const Center = styled.div`
  text-align: center;
`;
const ItemsList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 60px;
  max-width: ${(props) => props.theme.maxWidth};
  margin: 0 auto;
`;

class Items extends Component {
  render() {
    return (
      <Center>
        {/* the only child  of a Query component is a function*/}
        <Pagination page={this.props.page} />
        <Query query={ALL_ITEMS_QUERY} variables={{
          skip: this.props.page * perPage - perPage,
        }}>
          {({ data, loading, error }) => {
            if (loading) return <p>Loading......</p>;
            if (error) return <p>Error: {error.message}</p>;
            return (
              <ItemsList>
                {data.items.map((item) => (
                  <Item item={item} key={item.id} />
                ))}
              </ItemsList>
            );
          }}
        </Query>
        <Pagination page={this.props.page} />
      </Center>
    );
  }
}

export default Items;
export { ALL_ITEMS_QUERY };
