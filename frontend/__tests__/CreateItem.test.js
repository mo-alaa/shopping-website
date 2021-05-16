import { mount } from "enzyme";
import wait from "waait";
import toJSON from "enzyme-to-json";
import Router from "next/router";
import { MockedProvider } from "react-apollo/test-utils";
import CreateItem, { CREATE_ITEM_MUTAION } from "../components/CreateItem";
import { fakeItem } from "../lib/testUtils";

const testImage = "https://example.com/example.jpg";

//mock the global fetch api
global.fetch = jest.fn().mockResolvedValue({
  json: () => ({
    secure_url: testImage,
    eager: [{ secure_url: testImage }],
  }),
});

// const mocks = [
//   {
//     request: {
//       query: CREATE_ITEM_MUTAION,
//       variables: { email: "example@example.com" },
//     },
//     result: {
//       data: { requestReset: { message: "success", __typename: "Message" } },
//     },
//   },
// ];

describe("<CreateItem/>", () => {
  it("renders and matches snapshot", async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );

    const form = wrapper.find('form[data-test="form"]');
    expect(toJSON(form)).toMatchSnapshot();
  });

  it("uploads a file when changes", async () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );

    const input = wrapper.find('input[type="file"]');
    input.simulate("change", { target: { files: ["example.jpg"] } });
    await wait();

    const component = wrapper.find("CreateItem").instance();
    expect(component.state.image).toEqual(testImage);
    expect(component.state.largeImage).toEqual(testImage);
    expect(global.fetch).toHaveBeenCalled();

    global.fetch.mockReset(); //reset the global fetch
  });

  it("handles state updating", () => {
    const wrapper = mount(
      <MockedProvider>
        <CreateItem />
      </MockedProvider>
    );

    wrapper
      .find("#title")
      .simulate("change", { target: { value: "Testing", name: "title" } });

    wrapper.find("#price").simulate("change", {
      target: { value: 1000, name: "price", type: "number" },
    });

    wrapper.find("#description").simulate("change", {
      target: { value: "This is a really nice item", name: "description" },
    });

    expect(wrapper.find("CreateItem").instance().state).toMatchObject({
      title: "Testing",
      price: 1000,
      description: "This is a really nice item",
    });
  });

  it("creates an item when the form is submitted", async () => {
    const item = fakeItem();
    const mocks = [
      {
        request: {
          query: CREATE_ITEM_MUTAION,
          variables: {
            title: item.title,
            description: item.description,
            price: item.price,
            image: "",
            largeImage: "",
          },
        },
        result: {
          data: {
            createItem: {
              ...fakeItem(),
              id: "abc123",
              __typeName: "Item",
            },
          },
        },
      },
    ];

    const wrapper = mount(
      <MockedProvider mocks={mocks}>
        <CreateItem />
      </MockedProvider>
    );

    wrapper
      .find("#title")
      .simulate("change", { target: { value: item.title, name: "title" } });

    wrapper.find("#price").simulate("change", {
      target: { value: item.price, name: "price", type: "number" },
    });

    wrapper.find("#description").simulate("change", {
      target: { value: item.description, name: "description" },
    });

    //mock router
    Router.router = { push: jest.fn() };

    wrapper.find("form").simulate("submit");
    await wait(50);

    expect(Router.router.push).toHaveBeenCalled();
    expect(Router.router.push).toHaveBeenCalledWith({
      pathname: "/item",
      query: { id: "abc123" },
    });

  });
});
