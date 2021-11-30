require("dotenv").config();
const mysql = require('mysql2');
const inquirer = require('inquirer')


const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  port: process.env.PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
},
  console.log(`Connected to the database!`)
);

connection.connect(function (err) {
  if (err) throw err;
  beginInq();
});

function beginInq() {
  inquirer
    .prompt([
      {
        name: "choices",
        type: "list",
        message: "What action would you like to perform?",
        choices: [
          "View departments",
          "Add a department",
          "View employees",
          "Add an employee",
          "Update an employee",
          "View roles",
          "Add a role",
        ],
      },
    ])
    .then(function (answer) {
      if (answer.choices === "View departments") {
        displayDept();
      } else if (answer.choices === "Add a department") {
        addDept();
      } else if (answer.choices === "View employees") {
        viewEmp();
      } else if (answer.choices === "Add an employee") {
        addEmp();
      } else if (answer.choices === "Update an employee") {
        updateEmp();
      } else if (answer.choices === "View roles") {
        viewRoles();
      } else if (answer.choices === "Add a role") {
        addRole();
      } else {
        connection.end();
      }
    });
}


function displayDept() {

  connection.query("SELECT * FROM department", function (err, res) {
    if (err) throw err;
    console.table(res);
    console.log(
      "Departments loaded."
    );

    beginInq();
  });
}


function viewEmp() {

  connection.query("SELECT * from employee", function (err, res) {
    console.table(res);
    if (err) throw err;
    console.log(
      "Employees loaded."
    );

    beginInq();
  });
}

function viewRoles() {

  connection.query("SELECT * from employee_role", function (err, res) {
    console.table(res);
    if (err) throw err;
    console.log(
      "Roles loaded."
    );

    beginInq();
  });
}

// add department
function addDept() {
  inquirer
    .prompt([
      {
        name: "addDept",
        type: "input",
        message: "Insert department name.",
      },
    ])
    .then(function (res) {
      connection.query(
        "INSERT INTO department SET ?",
        {
          dept_name: res.addNewDept,
        },
        function (err) {
          if (err) throw err;

          displayCurrentDept();
        }
      );
    });
}


function addEmp() {

  inquirer
    .prompt([
      {
        name: "firstName",
        type: "input",
        message: "Enter the employee's first name."
      },
      {
        name: "lastName",
        type: "input",
        message: "Enter the employee's last name."
      },
      {
        name: "employeeId",
        type: "input",
        message: "Enter the employee's ID."
      },
    ])
    .then(function (res) {
      connection.query(
        "INSERT INTO employee SET ?",
        {
          first_name: res.firstName,
          last_name: res.lastName,
          role_id: res.employeeId,
        },
        function (err) {
          if (err) throw err;

          viewEmp();
        }
      );
    });
};


function addRole() {

  inquirer
    .prompt([
      {
        name: "newRole",
        type: "input",
        message: "Enter role name.",
      },
      {
        name: "roleSalary",
        type: "input",
        message: "Enter role's salary.",
      },
      {
        name: "deptId",
        type: "input",
        message: "Enter the deptartment's ID.",
      },
    ])
    .then(function (res) {
      connection.query(
        "INSERT INTO employee_role SET ?",
        {
          role_title: res.newRole,
          role_salary: res.roleSalary,
          dept_id: res.deptId,
        },
        function (err) {
          if (err) throw err;

          viewRoles();
        }
      );
    });
};


function updateEmp() {

  connection.query("SELECT * FROM employee", function (err, res) {
    if (err) throw err;

    inquirer
      .prompt([
        {
          name: "choice",
          type: "list",
          message: "Which employee would you like to update?",
          choices: function () {
            const choiceArray = [];
            for (let i = 0; i < res.length; i++) {
              choiceArray.push(res[i].first_name + " " + res[i].last_name);
            }
            return choiceArray;
          },
        },
        {
          name: "updateEmpRole",
          type: "input",
          message: "What is the updated role?",
        },
      ])
      .then(function (answer) {
        function getId() {
          for (let i = 0; i < res.length; i++) {
            const fullName = res[i].first_name + " " + res[i].last_name;
            if (answer.choice === fullName) {
              return res[i].id;
            }
          }
        }

        connection.query(
          "UPDATE employee SET ? WHERE ?",
          [
            {
              role_id: answer.updateEmpRole,
            },
            {
              id: getId(),
            },
          ],
          function (err, answer) {
            if (err) throw err;

            viewEmployees();
            beginInq();
          }
        );
      });
  });
};