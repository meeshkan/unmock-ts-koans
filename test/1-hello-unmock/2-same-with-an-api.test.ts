// now, let's look at a function that fetches users from the API
// and performs the same operation.

// our real API does not exist yet, so we use unmock.
// but we have a problem - we forgot to turn unmock on! read how
// on https://www.unmock.io/docs/introduction
import unmock from "unmock";
import axios from "axios";

unmock
  .nock("https://api.circle-ci-rocks.io")
  .get("/users")
  .reply(200, [{ id: 1, isAdmin: true }, { id: 2, isAdmin: false }]);

interface User {
  id: number;
  isAdmin: boolean;
}

beforeAll(() => {
  unmock.on();
});
afterAll(() => {
  unmock.off();
});

const splitUsers = async () => {
  const { data } = await axios("https://api.circle-ci-rocks.io/users");
  return {
    admin: data.filter((user: User) => user.isAdmin) as User[],
    notAdmin: data.filter((user: User) => !user.isAdmin) as User[]
  };
};

test("users from our API are split into admins and nonAdmins", async () => {
  const split = await splitUsers();
  expect(split.admin).toEqual([{ id: 1, isAdmin: true }]);
  expect(split.notAdmin).toEqual([{ id: 2, isAdmin: false }]);
});
