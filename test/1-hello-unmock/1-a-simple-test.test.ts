// let's look at a simple spec for a function
// that splits arrays of users into an object containing
// admins and nonAdmins

// the test is failing. can you edit the function to make it pass?

interface User {
  id: number;
  isAdmin: boolean;
}

const splitUsers = (users: User[]) => ({
  admin: users.filter(user => user.isAdmin),
  notAdmin: users.filter(user => user.isAdmin)
});

test("users are split into admins and nonAdmins", () => {
  const split = splitUsers([
    { id: 1, isAdmin: true },
    { id: 2, isAdmin: false }
  ]);
  expect(split.admin).toEqual([{ id: 1, isAdmin: true }]);
  expect(split.notAdmin).toEqual([{ id: 2, isAdmin: false }]);
});
