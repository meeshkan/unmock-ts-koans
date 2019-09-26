// sometimes, we would like to initialize a service to a particular state.
// in unmock, we do this with the state function, and we use transformers
// like withoutCodes below to set mocks to an initial place,
// like returning a given status code or returning data with a particular
// shape (a particular array size, certain fields being required, etc)

// here, we use withoutCodes to rule out the error code and test the happy path. but oops...
// looks like there are still some non-error responses.
// we probably should have used withCodes to include only successful
// responses instead of withoutCodes. can you fix that?

import unmock, { u, runner, transform } from "unmock";
import axios from "axios";
import { IService } from "unmock-core/dist/service/interfaces";

const { withoutCodes } = transform;

unmock
  .nock("https://api.myservice.io", "myservice")
  .get("/users")
  .reply(200, { users: u.array({ id: u.number(), isAdmin: u.boolean() }) })
  .reply(401, { message: "Not authorized" })
  .reply(404, { message: "Not found" });

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

const splitUsers = async () => {
  try {
    const { data } = await axios("https://api.myservice.io/users");
    return {
      admin: data.users.filter((user: User) => user.isAdmin) as User[],
      notAdmin: data.users.filter((user: User) => !user.isAdmin) as User[],
      error: false
    };
  } catch (e) {
    return { admin: [], notAdmin: [], error: true };
  }
};

test(
  "when error is true, arrays are always empty",
  runner(async () => {
    const split = await splitUsers();
    if (split.error) {
      expect(split.admin.length).toBe(0);
      expect(split.notAdmin.length).toBe(0);
    }
  })
);

test(
  "200 will never yield error",
  runner(async () => {
    myservice.state(withoutCodes([401, 404]));
    const split = await splitUsers();
    expect(split.error).toBe(false);
  })
);
