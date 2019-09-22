// let's use the same function, but with indeterminate results
// we accomplish this using the `u` syntax in the reply method
// below.
// also, let's use the runner to test out different outcomes.
// this is called fuzz testing: under the hood, the runner will
// run your test 20 times

// but wait, something does not seem quite right in the reply bloc...
// we are generating an `id` field, but where did our `isAdmin`
// field go? can you see how to generate it?

import unmock, { u, runner } from "unmock";
import axios from "axios";

unmock
  .nock("https://api.myservice.io")
  .get("/users")
  .reply(200, u.array({ id: u.number(), isAdmin: u.boolean() }));

interface User {
  id: number;
  isAdmin: boolean;
}

beforeAll(() => unmock.on());
afterAll(() => unmock.off());

const splitUsers = async () => {
  const { data } = await axios("https://api.myservice.io/users");
  return {
    admin: data.filter((user: User) => user.isAdmin) as User[],
    notAdmin: data.filter((user: User) => !user.isAdmin) as User[]
  };
}

test("randomly generated users from our API are split into admins and nonAdmins", runner(async () => {
  const split = await splitUsers();
  split.admin.forEach(user => {
    expect(user.isAdmin).toBe(true);
  })
  split.notAdmin.forEach(user => {
    expect(user.isAdmin).toBe(false);
  })
}));
