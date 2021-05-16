import React, { Component } from "react";
import gql from "graphql-tag";
import { Mutation } from "react-apollo";
import { CURRENT_USER_QUERY } from "./User";

const ADD_TO_CART_MUTATION = gql`
  mutation addToCart($id: ID!) {
    addToCart(id: $id) {
      id
      quantity
    }
  }
`;

class AddToCart extends Component {
  // quantity = 1;
  // update = (cache, payload) => {
  //   console.log("running add to cart update function");
  //   //1. first read the cache
  //   let data = cache.readQuery({ query: CURRENT_USER_QUERY });

  //   //2. remove that item from the cart
  //   const cartItemId = payload.data.addToCart.id;
  
  //   //if has item increment quantity
  //   const cartItemIndex = data.me.cart.findIndex(cartItem => cartItem.id === cartItemId);
  //   if(cartItemIndex > -1){
  //     data.me.cart[cartItemIndex].quantity = data.me.cart[cartItemIndex].quantity + 1;
  //     data.me.cart[cartItemIndex].item = this.props.item;
  //     this.quantity = data.me.cart[cartItemIndex].quantity;
  //   } else {
  //     data.me.cart.push({id: cartItemId, quantity: 1});
  //   }

  //   //3. write it back to the cache
  //   cache.writeQuery({ query: CURRENT_USER_QUERY, data });
  // };
  render() {
    const { id } = this.props;
    return (
      <Mutation
        mutation={ADD_TO_CART_MUTATION}
        variables={{ id }}
        refetchQueries={[{ query: CURRENT_USER_QUERY }]}
        // update={this.update}
        // optimisticResponse={{
        //   __typename: "Mutation",
        //   addToCart: {
        //     __typename: "CartItem",
        //     id,
        //     item: this.props.item,
        //     quantity:this.quantity
        //   },
        // }}
      >
        {(addToCart, {error, loading}) => <button
        disabled={loading}
        onClick={addToCart}>Add{loading && 'ing'} To Cart 🛒</button>}
      </Mutation>
    );
  }
}

export default AddToCart;
