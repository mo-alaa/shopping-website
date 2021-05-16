import { shallow, mount } from "enzyme";
import toJSON from "enzyme-to-json";
import CartCount from "../components/CartCount";

describe("<Cartount/>", () => {
  xit("renders", () => {
    shallow(<CartCount count={10} />);
  });

  xit("matches the snapshot", () => {
    const wrapper = shallow(<CartCount count={12} />);
    expect(toJSON(wrapper)).toMatchSnapshot();
  });

  xit("updates via props", () => {
    //while shallow goes only 1 level deep
    const wrapper = shallow(<CartCount count={50} />);
    expect(toJSON(wrapper)).toMatchSnapshot();
    wrapper.setProps({ count: 7 });
    expect(toJSON(wrapper)).toMatchSnapshot();
  });

  xit("updates via props", () => {
     //mount actually run it in like sort of a browser environment
     //we usually will be using mount, because most of our components
     //are not as clean as cartcount
       //and we need our test to be as close to the real experience
     const wrapper = mount(<CartCount count={50} />);
    //  console.log(wrapper.debug());
 
  });
});
