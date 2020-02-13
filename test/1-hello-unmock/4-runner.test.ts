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

// let's use the same function, but with indeterminate results
// we accomplish this using the `u` syntax in the reply method
// below.

// but wait, something does not seem quite right in the reply bloc...
// we are generating an `id` field, but where did our `isAdmin`
// field go? can you see how to generate it?

import unmock, { u } from "unmock";
import jestRunner from "unmock-jest-runner";
import axios from "axios";
import _ from "lodash";

unmock
  .nock("https://api.myservice.io")
  .get("/users")
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

beforeAll(() => unmock.on());
afterAll(() => unmock.off());

const fetchUsersAndSplitIntoBiggiesAndBabies = async () => {
  const { data } = await axios("https://api.myservice.io/users");
  const partition = _.partition(data, (user: User) => user.age !== 0);
  return {
    biggies: partition[0] as User[],
    babies: partition[1] as User[]
  };
};

test(
  "randomly generated users from our API are split into biggies and babies",
  jestRunner(async () => {
    const split = await fetchUsersAndSplitIntoBiggiesAndBabies();
    split.biggies.forEach(user => {
      expect(user.age).toBeGreaterThan(0);
    });
    split.babies.forEach(user => {
      expect(user.age).toBe(0);
    });
  })
);

