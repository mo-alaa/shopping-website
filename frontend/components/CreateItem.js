import React, { Component } from "react";
import { Mutation } from "react-apollo";
import gql from "graphql-tag";
import Router from "next/router";
import Form from "./styles/Form";
import formatMoney from "../lib/formatMoney";
import Error from "./ErrorMessage";

const CREATE_ITEM_MUTAION = gql`
  mutation CREATE_ITEM_MUTAION(
    $title: String! #type string and required
    $description: String!
    $price: Int! #type int and required
    $image: String #type string and is NOT required
    $largeImage: String
  ) {
    # this is the name of the mutation in the schema at the backend
    createItem(
      title: $title #title should use variable called title
      description: $description #description should use variable called description
      price: $price
      image: $image
      largeImage: $largeImage
    ) {
      id #and return the id
    }
  }
`;

class CreateItem extends Component {
  state = {
    title: "",
    description: "",
    image: "",
    largeImage: "",
    price: 0,
  };
  uploadImage = async (e) => {
    console.log("Uploading....");
    //get files from event
    const files = e.target.files;
    const data = new FormData(); //use formdata api (which is parth of the javascript) to kind of prep all the data
    data.append("file", files[0]);
    data.append("upload_preset", "sickfits"); //argument needed by cloudinary

    //now we need to hit the cloudinary api
    //upload path: https://api.cloudinary.com/v1_1/dujelui46/image/upload
    //here dujelui46 is the username you signed up with in cloudinary

    const res = await fetch(
      "https://api.cloudinary.com/v1_1/dujelui46/image/upload",
      {
        method: "POST",
        body: data,
      }
    );

    const file = await res.json();
    console.log(file);
    this.setState({
      image: file.secure_url,
      largeImage: file.eager[0].secure_url,
    });
  };
  handleChange = (e) => {
    const { name, type, value } = e.target;
    //if it is a number parse it
    const val = type === "number" ? parseFloat(value) : value;
    this.setState({ [name]: val });
  };
  render() {
    return (
      <Mutation mutation={CREATE_ITEM_MUTAION} variables={this.state}>
        {(createItem, { loading, error }) => (
          <Form
            data-test="form"
            onSubmit={async (e) => {
              e.preventDefault();
              //call the mutation
              const res = await createItem();
              //change them to the single item page
              console.log(res);
              Router.push({
                pathname: "/item",
                query: { id: res.data.createItem.id },
              });
            }}
          >
            {/* if there is an error the error will show up, otherwise it won't be shown */}
            <Error error={error} />
            <fieldset disabled={loading} aria-busy={loading}>
              <label htmlFor="file">
                Image
                <input
                  type="file"
                  id="file"
                  name="file"
                  placeholder="Upload an image"
                  required
                  onChange={this.uploadImage}
                />
                {this.state.image && (
                  <img src={this.state.image} alt="Upload Preview" width='200'/>
                )}
              </label>
              <label htmlFor="title">
                Title
                <input
                  type="text"
                  id="title"
                  name="title"
                  placeholder="Title"
                  required
                  onChange={this.handleChange}
                  value={this.state.title}
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
                  value={this.state.price}
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
                  value={this.state.description}
                />
              </label>
              <button type="submit">Submit</button>
            </fieldset>
          </Form>
        )}
      </Mutation>
    );
  }
}

export default CreateItem;
//export the mutation to use it in other components
export { CREATE_ITEM_MUTAION };
