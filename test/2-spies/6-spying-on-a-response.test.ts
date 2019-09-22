// when using the runner and indeterminate output from
// unmock, you never know what you're going to get, which
// means that you cannot make any assertions about any one
// particular value unmock will generate. instead, you
// can use spies to reason about things like the response
// body. the test below is correct, but it catches a bug
// in our function. can you spot it and fix it?

import unmock, { u } from "unmock";
import axios from "axios";
import { IService } from "unmock-core/dist/service/interfaces";

unmock
  .nock("https://api.myservice.io", "myservice")
  .get("/users/")
  .reply(200, { users: u.array({ id: u.integer(), name: u.string("name.firstName") })});

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

const getUsers = async () => {
  const { data } = await axios.delete("https://api.myservice.io/users/");
  return { users: data, timestamp: new Date().getTime() };
};

test("users from our API are split into admins and nonAdmins", async () => {
  const users = await getUsers();
  expect(users).toMatchObject(myservice.spy.getResponseBody());
});
