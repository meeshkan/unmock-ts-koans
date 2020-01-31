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
  .reply(200, u.array({
    id: u.integer(),
    age: u.opt(u.integer({ minimum: 0 })),
    isAdmin: u.boolean()
  }));

interface User {
  id: number;
  age?: number;
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
  const { data } = await axios("https://api.myservice.io/users/");
  data.timestamp = new Date().getTime();
  return data;
};

test("the users has a list of users and a timestamp", async () => {
  const users = await getUsers();
  expect(users.users).toMatchObject(JSON.parse(myservice.spy.getResponseBody() || ""));
  expect(users.timestamp).toBeGreaterThan(0);
});
