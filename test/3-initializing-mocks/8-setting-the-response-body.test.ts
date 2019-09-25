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
  .reply(200, { users: { id: u.number(), isAdmin: u.boolean() } });


unmock
  .nock("https://api.storage.io", "storage")
  .get("/")
  .reply(200, { foosers: { id: u.number(), isAdmin: u.boolean() } });


interface User {
  id: number;
  isAdmin: boolean;
}

let myservice: IService;
let storage: IService;
beforeAll(() => {
  const services = unmock.on().services;
  myservice = services.myservice;
  storage = services.storage;
});
afterAll(() => {
  unmock.off();
});

const getUsersAndFoosers = async () => {
 
    const users = await axios("https://api.myservice.io/users");
    const foosers = await axios("https://api.storage.io");
    return {
      users: users.data,
      foosers: foosers.data,
    }
  };

test(
  "we will always be able to elect an admin",
  runner(async () => {
    myservice.state(
      responseBody({ lens: ["id"] }).const(45)
    );
    const uf = await getUsersAndFoosers();
    expect(uf.users.id).toBe(uf.foosers.id);
  })
);
