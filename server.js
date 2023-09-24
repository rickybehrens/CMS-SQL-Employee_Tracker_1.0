const express = require('express');
const mysql = require('mysql2');
const inquirer = require('inquirer');

const PORT = process.env.PORT || 3001;
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

const db = mysql.createConnection(
  {
    host: 'localhost',
    user: 'root',
    password: 'luckydog',
    database: 'acme_db'
  },
  console.log(`Connected to the acme_db database.`)
);

function init() {
  inquirer
    .prompt([
      {
        type: 'list',
        name: 'main', // Use 'main' here to match the variable name
        message: 'What would you like to do?',
        choices: [
          'View all departments',
          'View all roles',
          'View all employees',
          // 'View all employees by department',
          // 'View all employees by manager',
          'Add department',
          'Remove department',
          'Add role',
          'Remove role',
          'Add employee',
          'Remove employee',
          'Update employee role',
          // 'Update employee manager',
          // 'View total utilized budget by department',
          'Quit',
        ],
      },
    ])
    .then((data) => {
      switch (data.main) {
        case 'View all departments':
          viewAllDepartments();
          break;

        case 'View all roles':
          viewAllRoles()
          break;

        case 'View all employees':
          viewAllEmployees();
          break;

        case 'Add department':
          addDepartment()
          init();
          break;

          // case 'View all employees by department':  
          //   viewEmployeesByDepartment()
          //   break;

          init();
        case 'View all employees by manager':

          break;

          init();
        case 'Add employee':
          addNewEmployee();
          break;

        case 'Remove employee':
          removeEmployee()
          break;

        case 'Update employee role':
          updateEmployeeRole();
          break;

        case 'Update employee manager':
          break;

        case 'Add role':
          addRole()
          break;

        case 'Remove role':
          removeRole()
          break;

        case 'Remove department':
          removeDepartment()
          break;

        case 'View total utilized budget by department':

          init();
          break;

        case 'Quit':
          process.exit();
          break;
      };
    });
};

// Function call to initialize app
init();

// View All Departments
const viewAllDepartments = () => {
  db.query('SELECT * FROM department', function (err, response) {
    console.table(response);
  });
  init();
};

// View All Roles
const viewAllRoles = () => {
  const request = `SELECT role.id, role.title, department.name AS 'department' FROM role INNER JOIN department ON role.department_id = department.id`;
  db.query(request, (err, response) => {
    console.table(response);
    init();
  });
};

// View All Employees
const viewAllEmployees = () => {
  const request = `SELECT employee.id, employee.first_name, employee.last_name, role.title, department.name AS 'department', CONCAT(m.first_name, ' ', m.last_name) AS 'manager', role.salary FROM employee LEFT JOIN role ON employee.role_id = role.id LEFT JOIN department ON role.department_id = department.id LEFT JOIN employee m ON employee.manager_id = m.id ORDER BY employee.id ASC`;
  db.query(request, (error, response) => {
    console.table(response)
    init();
  });
};

// Add a New Department
const addDepartment = () => {
  inquirer
    .prompt([
      {
        name: 'newDepartment',
        type: 'input',
        message: 'What is the name of the new department?',
      }
    ])
    .then((answer) => {
      const request = `INSERT INTO department (department.name) VALUES (?)`;
      db.query(request, answer.newDepartment, (error, response) => {
        if (error) throw error;
        console.log('Department successfully created!');
        init();
      });
    });
};

// Add a New Role
const addRole = () => {
  const request = 'SELECT * FROM department'
  db.query(request, (error, response) => {
    if (error) throw error;
    let deptArray = [];
    response.forEach((department) => { deptArray.push(department.name); });
    inquirer
      .prompt([
        {
          name: 'departmentName',
          type: 'list',
          message: 'In which department is this new role located?',
          choices: deptArray
        }
      ])
      .then((answer) => {
        addRoleInfo(answer);
      });

    const addRoleInfo = (departmentData) => {
      inquirer
        .prompt([
          {
            name: 'newRole',
            type: 'input',
            message: 'What is the name of the new role?',
          },
          {
            name: 'salary',
            type: 'input',
            message: 'What is the salary for this new role?',
          }
        ])
        .then((answer) => {
          const createdRole = answer.newRole;
          const salary = answer.salary;
          let departmentId;

          response.forEach((department) => {
            if (departmentData.departmentName === department.name) { departmentId = department.id; }
          });

          insertRole(createdRole, salary, departmentId);
        });
    };

    const insertRole = (title, salary, departmentId) => {
      const request = `INSERT INTO role (title, salary, department_id) VALUES (?, ?, ?)`;
      const param = [title, salary, departmentId];

      db.query(request, param, (error) => {
        if (error) throw error;
        console.log('Role successfully created!');
        viewAllRoles();
      });
    };
  });
};

// Add New Employee
const addNewEmployee = () => {
  inquirer
    .prompt([
      {
        type: "input",
        name: "firstName",
        message: "What's the new employee's first name?",
      },
      {
        type: "input",
        name: "lastName",
        message: "What's the new employee's last name?",
      },
      {
        type: "list",
        name: "department",
        message: "What department will the new employee work?",
        choices: [
          "Sales and Marketing",
          "IT",
          "Legal",
          "Accounting",
          "Purchasing",
          "HR",
          "Production",
        ],
      },
      {
        type: "list",
        name: "roleId",
        message: "What's the new employee's role?",
        choices: [
          1,
          2,
          3,
          4,
          5,
          6,
          7,
          8,
          9,
          10,
          11,
          12,
          13,
          14,
          15,
          16,
          17,
          18,
          19,
          20,
          21,
          22,
          23,
        ],
      },
      {
        type: "list",
        name: "managerId",
        message: "Who's the new employee's manager?",
        choices: [
          2,
          5,
          8,
          11,
          14,
          16,
          18,
          22,
          23,
        ],
      },
    ])
    .then((employeeData) => {
      console.log(employeeData.firstName)
      // Create a SQL query to insert the new employee
      const query = `
        INSERT INTO employee (first_name, last_name, role_id, manager_id)
        VALUES (?, ?, ?, ?)
      `;

      // Execute the query with the provided employee data
      db.query(
        query,
        [
          employeeData.firstName,
          employeeData.lastName,
          employeeData.roleId,
          employeeData.managerId || null, // Use null if manager_id is not provided
        ],
        (err, results) => {
          if (err) {
            console.error('Error adding employee:', err);
          } else {
            console.log('Employee added successfully!');
          }
          // Close the database connection
        }
      );
      init();
    });
};

// Update Employee's Role
const updateEmployeeRole = () => {
  const request = `SELECT employee.id, employee.first_name, employee.last_name, role.id AS "role_id"
                  FROM employee, role, department WHERE department.id = role.department_id AND role.id = employee.role_id`;
  db.query(request, (error, response) => {
    if (error) throw error;
    let employeeNamesArray = [];
    response.forEach((employee) => { employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`); });

    const request = 'SELECT role.id, role.title FROM role';
    db.query(request, (error, response) => {
      if (error) throw error;
      let rolesArray = [];
      response.forEach((role) => { rolesArray.push(role.title); });

      inquirer
        .prompt([
          {
            name: 'chosenEmployee',
            type: 'list',
            message: 'Which employee has a new role?',
            choices: employeeNamesArray
          },
          {
            name: 'chosenRole',
            type: 'list',
            message: 'What is their new role?',
            choices: rolesArray
          }
        ])
        .then((answer) => {
          let newTitleId, employeeId;

          response.forEach((role) => {
            if (answer.chosenRole === role.title) {
              newTitleId = role.id;
            }
          });

          response.forEach((employee) => {
            if (
              answer.chosenEmployee ===
              `${employee.first_name} ${employee.last_name}`
            ) {
              employeeId = employee.id;
            }
          });

          const requests = `UPDATE employee SET employee.role_id = ? WHERE employee.id = ?`;
          db.query(
            request,
            [newTitleId, employeeId],
            (error) => {
              if (error) throw error;
              console.log('Employee Role Updated');
              init();
            }
          );
        });
    });
  });
};

// Remove Department
const removeDepartment = () => {
  const request = 'SELECT department.id, department.name FROM department';
  db.query(request, (error, response) => {
    if (error) throw error;
    let departmentNamesArray = [];
    response.forEach((department) => { departmentNamesArray.push(department.name); });

    inquirer
      .prompt([
        {
          name: 'chosenDept',
          type: 'list',
          message: 'Which department would you like to remove?',
          choices: departmentNamesArray
        }
      ])
      .then((answer) => {
        let departmentId;

        response.forEach((department) => {
          if (answer.chosenDept === department.name) {
            departmentId = department.id;
          }
        });

        const request = 'DELETE FROM department WHERE department.id = ?';
        db.query(request, [departmentId], (error) => {
          if (error) throw error;
          console.log('Department Successfully Removed');
          viewAllDepartments();
          init();
        });
      });
  });
};

// Remove Role
const removeRole = () => {
  const request = 'SELECT role.id, role.title FROM role';

  db.query(request, (error, response) => {
    if (error) throw error;
    let roleNamesArray = [];
    response.forEach((role) => {roleNamesArray.push(role.title);});

    inquirer
      .prompt([
        {
          name: 'chosenRole',
          type: 'list',
          message: 'Which role would you like to remove?',
          choices: roleNamesArray
        }
      ])
      .then((answer) => {
        let roleId;

        response.forEach((role) => {
          if (answer.chosenRole === role.title) {
            roleId = role.id;
          }
        });

        const request =   `DELETE FROM role WHERE role.id = ?`;
        db.query(request, [roleId], (error) => {
          if (error) throw error;
          console.log('Role Successfully Removed');
          viewAllRoles();
          init();
        });
      });
  });
};

// Remove Employee
const removeEmployee = () => {
  const request = 'SELECT employee.id, employee.first_name, employee.last_name FROM employee';

  db.query(request, (error, response) => {
    if (error) throw error;
    let employeeNamesArray = [];
    response.forEach((employee) => {employeeNamesArray.push(`${employee.first_name} ${employee.last_name}`);});

    inquirer
      .prompt([
        {
          name: 'chosenEmployee',
          type: 'list',
          message: 'Which employee would you like to remove?',
          choices: employeeNamesArray
        }
      ])
      .then((answer) => {
        let employeeId;

        response.forEach((employee) => {
          if (
            answer.chosenEmployee ===
            `${employee.first_name} ${employee.last_name}`
          ) {
            employeeId = employee.id;
          }
        });

        const request = 'DELETE FROM employee WHERE employee.id = ?';
        db.query(request, [employeeId], (error) => {
          if (error) throw error;
          console.log('Employee Successfully Removed');
          viewAllEmployees();
          init();
        });
      });
  });
};

// Default response for any other request (Not Found)
app.use((req, res) => {
  res.status(404).end();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
