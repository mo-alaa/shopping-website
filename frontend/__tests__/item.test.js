import Item from "../components/Item";
import { shallow } from "enzyme";
import toJson from 'enzyme-to-json';//adaptor confirms react omponent to sort of html we used to see when we console log the debug

import AddToCart from "../components/AddToCart";

const fakeItem = {
  id: "ABC123",
  title: "A Cool Item",
  price: 5000,
  description: "This item is really cool",
  image: "dog.jpg",
  largeImage: "largedog.jpg",
};

/*
    THIS DEMONSTRATES SNAPSHOT TESTING
    update snapshot by hitting u
*/

describe("<Item/>", () => {
  xit("renders and matches snapshot", () => {
    const wrapper = shallow(<Item item={fakeItem} />);

    expect(toJson(wrapper)).toMatchSnapshot();
  });
});

/*
    THIS DEMOSTRATES SHALLOW RENDERING
    how ever it sometimes seems to be a 
    lot diving into the code
 */
describe("<Item/>", () => {
  xit("renders the title and price tag properly", () => {
    const wrapper = shallow(<Item item={fakeItem} />);
    console.log(wrapper.debug());
    const priceTag = wrapper.find("PriceTag");
    console.log(priceTag.children().text());
    expect(priceTag.children().text()).toBe("$50");
    expect(wrapper.find("Title a").text()).toBe(fakeItem.title);
  });

  xit("renders the image properly", () => {
    const wrapper = shallow(<Item item={fakeItem} />);
    const img = wrapper.find("img");
    expect(img.props().src).toBe(fakeItem.image);
    expect(img.props().alt).toBe(fakeItem.title);
  });

  xit("renders out the buttons properly", () => {
    const wrapper = shallow(<Item item={fakeItem} />);
    const buttonList = wrapper.find(".buttonList");
    //has 3 children i.e. 3 buttons
    expect(buttonList.children()).toHaveLength(3);
    //has 1 link
    expect(buttonList.find("Link")).toHaveLength(1);
    //has a link
    expect(buttonList.find("Link")).toBeTruthy();
    expect(buttonList.find("Link").exists()).toBe(true);
    //has AddToCart component (can be string or as a component)
    expect(buttonList.find(AddToCart).exists()).toBe(true);
    //has DeleteItem component
    expect(buttonList.find("DeleteItem").exists()).toBe(true);
  });
});
