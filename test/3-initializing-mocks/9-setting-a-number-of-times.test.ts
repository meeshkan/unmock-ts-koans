// it is often useful to test multiple interactions with an API
// if you know, for example, that it will only serve a particular
// response twice and may throw after that, use times.
// in this test, the title is correct, but the implementation of times
// uses the wrong number. can you change it to the right one?

import unmock, { u, transform } from "unmock";
import runner from "unmock-jest-runner";
import axios from "axios";
import { IService } from "unmock-core/dist/service/interfaces";

const { withCodes, times } = transform;

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
  "an error cannot be produced after one successful outcome",
  runner(async () => {
    myservice.state(times(1)(withCodes(200)));
    const split0 = await splitUsers();
    expect(split0.error).toBe(false);
    const split1 = await splitUsers();
    expect(split1.error).toBe(false);
  })
);
