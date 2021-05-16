function Person(name, foods) {
  this.name = name;
  this.foods = foods;
}

Person.prototype.fetchFavFoods = function () {
  return new Promise((resolve, reject) => {
    //simulate an api
    setTimeout(() => resolve(this.foods), 2000);
  });
};

describe("mocking learning", () => {
  xit("mocks a reg function", () => {
    const fetchDogs = jest.fn();//makes the fetchDogs a mock function
    fetchDogs("snickers");
    expect(fetchDogs).toHaveBeenCalled();
    expect(fetchDogs).toHaveBeenCalledWith("snickers");
    fetchDogs("snickers");
    expect(fetchDogs).toHaveBeenCalledTimes(2);
    // console.log(fetchDogs);
  });
  xit("can create a person", () => {
    const me = new Person("wes", ["pizza", "burgs"]);
    expect(me.name).toBe("wes");
  });

  xit("can fetch foods", async () => {
    const me = new Person("wes", ["pizza", "burgs"]);
    //mock the fav foods function
    me.fetchFavFoods = jest.fn().mockResolvedValue(["sushi", "ramen"]);
    const favFoods = await me.fetchFavFoods();

    expect(favFoods).toContain("ramen");
  });
});
