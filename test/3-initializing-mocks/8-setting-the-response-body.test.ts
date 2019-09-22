// it is often useful to test specific corner cases
// to do so, we could either redefine the spect using `unmock.nock`
// or use a state initializer. here, we test the corner case of empty
// arrays and we find a nasty bug! to do that, we'll use resposneBody
// there is not one way to fix the function `splitUsers`,
// but you will probably at least want to change the test
// to reflect what it actually does.

import unmock, { u, runner, transform } from "unmock";
import axios from "axios";
import { IService } from "unmock-core/dist/service/interfaces";

const { withCodes, responseBody } = transform;

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

const electAdmin = async () => {
  const users = await splitUsers();
  return users.admin[0];
};

test(
  "we will always be able to elect an admin",
  runner(async () => {
    myservice.state(
      withCodes(200),
      responseBody({ lens: ["users"] }).const([])
    );
    const admin = await electAdmin();
    expect(admin.isAdmin).toBe(true);
  })
);
