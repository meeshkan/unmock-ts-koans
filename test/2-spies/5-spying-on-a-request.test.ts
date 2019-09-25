// sometimes, we want to make sure that a function
// called an API exactly like it should. this is
// called a side effect, and to determine information about
// side effects, unmock uses spies.

// you'll see that below, we are expecting that the path will
// have a certain form, but it looks like we're using the
// wrong method on the spy! we didn't call a post method, so the spy
// will not yield the right value. can you change the method
// to the right one? a list of valid spy methods is
// on the unmock readme

import unmock from "unmock";
import axios from "axios";
import { IService } from "unmock-core/dist/service/interfaces";

unmock
  .nock("https://api.myservice.io", "myservice")
  .delete("/users/{id}")
  .reply(201);

interface User {
  id: number;
  isAdmin: boolean;
}

let myservice: IService;
beforeAll(() => {
  myservice = unmock.on().services.myservice;
});
afterAll(() => {
  unmock.off();
});

const deleteUser = async (id: number) => {
  await axios.delete("https://api.myservice.io/users/" + id);
};

test("the request path contains the id", async () => {
  await deleteUser(42);
  expect(
    myservice.spy
      .deleteRequestPath()
  ).toBe("/users/42");
});
