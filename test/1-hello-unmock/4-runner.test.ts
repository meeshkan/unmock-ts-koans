// the runner is a powerful way to catch bugs
// let's rewrite the reply so that it uses u.type, whose
// first argument generates required properties of an
// objet and whose second argument generates optional
// properties of an argument. so, our API is making
// `isAdmin` required and `age` optional.

// The runner may work for a few iterations, but eventually
// it will fail for at least two reasons due to bugs in the function.
// Can you see why? Can you propose a sensible
// fix to the function without changing the API?

import unmock, { u, runner, transform, Arr } from "unmock";
import axios from "axios";
import { IService } from "unmock-core/dist/service/interfaces";

const { responseBody } = transform;

unmock
  .nock("https://api.myservice.io", "foobar")
  .get("/users")
  .reply(
    200,
    u.array({
      isAdmin: u.boolean(),
      age: u.anyOf([u.integer({ minimum: 0 }), u.nul()])
    })
  );

interface User {
  age: number;
  isAdmin: boolean;
}

let foobar:  IService;
beforeAll(() => { foobar = unmock.on().services.foobar; } );
afterAll(() => unmock.off());

const splitUsers = async () => {
  const { data } = await axios("https://api.myservice.io/users");
  return {
    seniorAdmin: data.filter(
      (user: User) => user.age !== null && user.isAdmin && user.age >= 65
    ) as User[],
    juniorAdmin: data.filter(
      (user: User) => user.age !== null && user.isAdmin && user.age < 65
    ) as User[],
    unknownAgeAdmin: data.filter(
      (user: User) => user.isAdmin && !user.age
    ) as User[],
    notAdmin: data.filter((user: User) => !user.isAdmin) as User[]
  };
};

test(
  "only seniors are in seniorAdmin",
  runner(async () => {
    foobar.state(
      (req, o) => { const idx = Math.random() > 0.9 ? 0 : 1; return responseBody({ lens: [Arr]}).anyOfKeep([idx])(req, o); }
    )
    const split = await splitUsers();
    console.log(JSON.stringify(split));
    split.seniorAdmin.forEach(user => {
      expect(user.age).toBeGreaterThanOrEqual(65);
      expect(user.isAdmin).toBe(true);
    });
    split.juniorAdmin.forEach(user => {
      expect(user.age).toBeLessThan(65);
      expect(user.isAdmin).toBe(true);
    });
    split.unknownAgeAdmin.forEach(user => {
      expect(user.age).toBe(null);
      expect(user.isAdmin).toBe(true);
    });
  })
);
