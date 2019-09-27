// sometimes, we would like to initialize a service to a particular state.
// in unmock, we do this with the state function, and we use transformers
// like withCodes below to set mocks to an initial place,
// like returning a given status code or returning data with a particular
// shape (a particular array size, certain fields being required, etc)

// here, we use withCodes to rule out the error code and test the happy path. but oops...
// looks like there are still some non-error responses.
// we probably should have used withCodes to include only successful
// responses instead of withCodes. can you fix that?

import unmock, { u, runner, transform } from "unmock";
import axios from "axios";
import { IService } from "unmock-core/dist/service/interfaces";

const { withCodes, withoutCodes, times, after, responseBody } = transform;

unmock
  .nock("https://api.myservice.io", "myservice")
  .get("/users")
  .reply(200, { users: u.array({ id: u.number(), isAdmin: u.boolean() }) })
  .reply(401, { message: "Not authorized" })
  .reply(404, { message: "Not found" })
  .delete("/users/{id}")
  .reply(204)
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

const getAllUsers = async () => {
  try {
    const { data: { users } } = await axios("https://api.myservice.io/users");
    return users;
  } catch(e) {
    throw e;
  }
}

const deleteAllUsers = async () => {
  try {
    const users = await getAllUsers();
    await Promise.all(users.map((i: any) => axios.delete("https://api.myservice.io/users/"+i.id)));
  } catch (e) {
    return { admin: [], notAdmin: [], error: true };
  }
};

test(
  "when error is true, arrays are always empty",
  runner(async () => {
    myservice.state(withoutCodes([401,404]), after(1)(responseBody({ method: "get", path: "/users"}).const([])))
    const split = await deleteAllUsers();
    const users = await getAllUsers();
    expect(users.length).toBe(0);
  })
);
