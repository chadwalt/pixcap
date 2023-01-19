export interface Employee {
  uniqueId: number;
  name: string;
  subordinates: Employee[];
}

interface IEmployeeOrgApp {
  ceo: Employee;
  move(employeeID: number, supervisorID: number): void;
  undo(): void;
  redo(): void;
  get(employeeID: number): Employee | null;
}

interface Actions {
  action: string;
  payload: {
    employeeID: number;
    supervisorID: number;
    meta: unknown;
  };
}

const findObjectById = (obj: Employee, employeeID: number): Employee | null => {
  if (obj.uniqueId === employeeID) {
    return obj;
  }

  for (let sub of obj.subordinates) {
    let found = findObjectById(sub, employeeID);

    if (found) {
      return found;
    }
  }

  return null;
};

const findParentObjectById = (
  employees: Employee[],
  id: number,
  parent: Employee | null
): Employee | null => {
  for (let employee of employees) {
    if (employee.uniqueId === id) {
      return parent;
    }
    let found = findParentObjectById(employee.subordinates, id, employee);

    if (found) return found;
  }

  return null;
};

class EmployeeOrgApp implements IEmployeeOrgApp {
  ceo: Employee;
  private actions: Actions[] = [];
  private snapshots: string[] = [];
  private currentStep: number = 0;

  constructor(employee: Employee) {
    this.ceo = employee;
    this.snapshots.push(JSON.stringify(this.ceo));
  }

  move(employeeID: number, supervisorID: number): void {
    const employee = this.get(employeeID);
    const supervisor = this.get(supervisorID);

    if (!employee && !supervisor) {
      throw new Error("We cannot move employee");
    }

    const previousSupervisor = findParentObjectById(
      this.ceo.subordinates,
      employeeID,
      null
    );

    // // Add the move event to the actions array
    // this.actions.push({
    //   action: "move",
    //   payload: {
    //     employeeID,
    //     supervisorID,
    //     meta: {
    //       employee,
    //       parentId: previousSupervisor!.uniqueId
    //     },
    //   },
    // });

    // Remove the employee from the parent supervisor
    previousSupervisor!.subordinates = previousSupervisor!.subordinates.filter(
      (sub) => sub.uniqueId !== employeeID
    );
    previousSupervisor!.subordinates = [
      ...previousSupervisor!.subordinates,
      ...employee!.subordinates,
    ];

    // We need to assign the subordinates to the parent employee
    employee!.subordinates = [];
    supervisor!.subordinates = [...supervisor!.subordinates, employee!];

    // Store the new tree structure as a snapshot
    this.currentStep++;
    this.snapshots.push(JSON.stringify(this.ceo));
  }

  undo(): void {
    // We use brute force, store the entire structure as a snapshot of strings
    if (this.currentStep === 0) return;

    this.ceo = JSON.parse(this.snapshots[this.currentStep - 1]);
    this.currentStep--;
  }

  redo(): void {
    // We use brute force, store the entire structure as a snapshot of strings
    if (this.currentStep === 0 || this.currentStep == this.snapshots.length - 1)
      return;

    this.ceo = JSON.parse(this.snapshots[this.currentStep + 1]);
    this.currentStep++;
  }

  get(employeeID: number): Employee | null {
    if (this.ceo.subordinates.length === 0) return this.ceo;

    return findObjectById(this.ceo, employeeID);
  }
}

export default EmployeeOrgApp;
