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

import unmock, { u, runner } from "unmock";
import axios from "axios";

unmock
  .nock("https://api.myservice.io")
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

beforeAll(() => unmock.on());
afterAll(() => unmock.off());

const splitUsers = async () => {
  const { data } = await axios("https://api.myservice.io/users");
  return {
    seniorAdmin: data.filter(
      (user: User) => user.isAdmin && user.age >= 65
    ) as User[],
    juniorAdmin: data.filter(
      (user: User) => user.isAdmin && user.age < 65
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
    const split = await splitUsers();
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
