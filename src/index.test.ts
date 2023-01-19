import EmployeeOrgApp, { Employee } from ".";

describe("EmployeeOrgApp", () => {
  let mockedEmployee: Employee;

  beforeEach(() => {
    mockedEmployee = {
      uniqueId: 1,
      name: "Mark Zuckerberg",
      subordinates: [
        {
          uniqueId: 2,
          name: "Sarah Donald:",
          subordinates: [
            {
              uniqueId: 3,
              name: "Cassandra Reynolds",
              subordinates: [
                {
                  uniqueId: 4,
                  name: "Mary Blue",
                  subordinates: [],
                },
                {
                  uniqueId: 5,
                  name: "Bob Saget",
                  subordinates: [
                    {
                      uniqueId: 9,
                      name: "Tina Teff:",
                      subordinates: [
                        {
                          uniqueId: 10,
                          name: "Will Tuner",
                          subordinates: [],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          uniqueId: 6,
          name: "Tyler Simpson:",
          subordinates: [
            {
              uniqueId: 7,
              name: "Harry Tobs",
              subordinates: [
                {
                  uniqueId: 8,
                  name: "Thomas Brown",
                  subordinates: [],
                },
              ],
            },
            {
              uniqueId: 12,
              name: "George Carrey",
              subordinates: [],
            },

            {
              uniqueId: 11,
              name: "Gray Styles",
              subordinates: [],
            },
          ],
        },
      ],
    };
  });

  it("should be able to instantiate the EmployeeOrgApp class", () => {
    const org = new EmployeeOrgApp(mockedEmployee);
    expect(org.ceo).toBe(mockedEmployee);
  });

  it("should get an employee by employeeID", () => {
    const org = new EmployeeOrgApp(mockedEmployee);
    expect(org.get(12)).toStrictEqual({
      uniqueId: 12,
      name: "George Carrey",
      subordinates: [],
    });
  });

  it("should throw error when employee does not exist", () => {
    const org = new EmployeeOrgApp(mockedEmployee);
    expect(() => org.move(25, 122)).toThrow("We cannot move employee");
  });

  it("should move employee to another a supervisor", () => {
    const org = new EmployeeOrgApp(mockedEmployee);
    org.move(5, 12);
    const supervisor = org.get(12);
    expect(supervisor!.subordinates.length).toBe(1);
    expect(supervisor!.subordinates).toStrictEqual([
      { uniqueId: 5, name: "Bob Saget", subordinates: [] },
    ]);

    // Expect Cassandra to not have bob but his subordinates
    const cassandra = org.get(3);
    expect(cassandra!.subordinates.length).toBe(2);
    expect(cassandra!.subordinates).toStrictEqual([
      {
        uniqueId: 4,
        name: "Mary Blue",
        subordinates: [],
      },
      {
        uniqueId: 9,
        name: "Tina Teff:",
        subordinates: [
          {
            uniqueId: 10,
            name: "Will Tuner",
            subordinates: [],
          },
        ],
      },
    ]);
  });

  it("should undo an action", () => {
    const actualMock = JSON.parse(JSON.stringify(mockedEmployee))
    const org = new EmployeeOrgApp(mockedEmployee);
    org.move(5, 12);
    org.undo()
    expect(org.ceo).toStrictEqual(actualMock)
  });

  it("should redo the last undone action", () => {
    const actualMock = JSON.parse(JSON.stringify(mockedEmployee))
    const org = new EmployeeOrgApp(mockedEmployee);
    org.move(5, 12);
    org.undo()
    org.redo()
    expect(org.ceo).toStrictEqual(actualMock)
  });
});
