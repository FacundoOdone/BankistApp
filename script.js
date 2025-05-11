"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 450, -400, 3000, -650, -130, 70, 1300],
  interestRate: 1.2, // %
  pin: 1111,
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,
};

const account3 = {
  owner: "Steven Thomas Williams",
  movements: [200, -200, 340, -300, -20, 50, 400, -460],
  interestRate: 0.7,
  pin: 3333,
};

const account4 = {
  owner: "Sarah Smith",
  movements: [430, 1000, 700, 50, 90],
  interestRate: 1,
  pin: 4444,
};

const accounts = [account1, account2, account3, account4];

// Elements
const labelWelcome = document.querySelector(".welcome");
const labelDate = document.querySelector(".date");
const labelBalance = document.querySelector(".balance__value");
const labelSumIn = document.querySelector(".summary__value--in");
const labelSumOut = document.querySelector(".summary__value--out");
const labelSumInterest = document.querySelector(".summary__value--interest");
const labelTimer = document.querySelector(".timer");

const containerApp = document.querySelector(".app");
const containerMovements = document.querySelector(".movements");

const btnLogin = document.querySelector(".login__btn");
const btnTransfer = document.querySelector(".form__btn--transfer");
const btnLoan = document.querySelector(".form__btn--loan");
const btnClose = document.querySelector(".form__btn--close");
const btnSort = document.querySelector(".btn--sort");

const inputLoginUsername = document.querySelector(".login__input--user");
const inputLoginPin = document.querySelector(".login__input--pin");
const inputTransferTo = document.querySelector(".form__input--to");
const inputTransferAmount = document.querySelector(".form__input--amount");
const inputLoanAmount = document.querySelector(".form__input--loan-amount");
const inputCloseUsername = document.querySelector(".form__input--user");
const inputClosePin = document.querySelector(".form__input--pin");

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES

const currencies = new Map([
  ["USD", "United States dollar"],
  ["EUR", "Euro"],
  ["GBP", "Pound sterling"],
]);

const movements = [200, 450, -400, 3000, -650, -130, 70, 1300];
let logedUser;

const createUsernames = function (accounts) {
  accounts.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(" ")
      .map((name) => name[0])
      .join("");
  });
};
createUsernames(accounts);
/////////////////////////////////////////////////

function loginMethod(usr, pin) {
  let currentUser = accounts.find((acc) => acc.username == usr.toLowerCase());
  if (currentUser?.pin == pin) {
    logedUser = currentUser;
    labelWelcome.textContent = `Welcome back ${
      currentUser.owner.split(" ")[0]
    }`;
    displayMovements(currentUser.movements);
    labelBalance.textContent = calculateBalance(currentUser.movements);
    calcDisplaySummary(currentUser);
    containerApp.style.opacity = 100;
    inputLoginPin.value = inputLoginUsername.value = " ";
  }
}

btnTransfer.addEventListener("click", function (e) {
  e.preventDefault();
  let amount = Number(inputTransferAmount.value);
  transferMoney(inputTransferTo.value, amount);
});

function transferMoney(usr, amount) {
  let objetiveUser = accounts.find((acc) => acc.username == usr.toLowerCase());
  if (
    amount > 0 &&
    calculateBalance(logedUser.movements) - amount >= 0 &&
    objetiveUser?.username !== logedUser.username
  ) {
    logedUser.movements.push(Number(-amount));
    objetiveUser.movements.push(amount);
    console.log(objetiveUser, logedUser);
    refreshUi(logedUser);
  }
}

function refreshUi(account) {
  displayMovements(account.movements);
  labelBalance.textContent = calculateBalance(account.movements);
  calcDisplaySummary(account);
}

function displayMovements(movements, sort = false) {
  const movs = sort ? movements.slice().sort((a, b) => a - b) : movements;
  containerMovements.innerHTML = "";
  movs.forEach(function (mov, i) {
    const type = mov > 0 ? "deposit" : "withdrawal";
    const html = `
     <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__value">${mov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML("afterbegin", html);
  });
}

btnLogin.addEventListener("click", (e) => {
  e.preventDefault();
  loginMethod(inputLoginUsername.value, inputLoginPin.value);
});

const calculateBalance = function calculateBalance(movements) {
  return movements.reduce((acc, curr) => acc + curr, 0);
};

const calcDisplaySummary = function calcDisplaySummary(account) {
  let movements = account.movements;
  const inc = movements
    .filter((mov) => mov > 0)
    .reduce((acc, curr) => acc + curr, 0);
  const out = movements
    .filter((mov) => mov < 0)
    .reduce((acc, curr) => acc + curr, 0);
  const sumInt = movements
    .filter((mov) => mov > 0)
    .map((act) => (act * account.interestRate) / 100)
    .reduce((acc, curr) => acc + curr, 0);

  labelSumIn.textContent = `${inc}€`;
  labelSumOut.textContent = `${out}€`;
  labelSumInterest.textContent = `${sumInt}€`;
};

btnClose.addEventListener("click", function (e) {
  e.preventDefault();
  if (
    logedUser.username == inputCloseUsername.value &&
    logedUser.pin == Number(inputClosePin.value)
  ) {
    let index = accounts.findIndex(
      (acc) => acc.username === logedUser.username
    );
    accounts.splice(index, 1);
    console.log(index);
    containerApp.style.opacity = 0;
    console.log(accounts);
  }
});

btnLoan.addEventListener("click", function (e) {
  e.preventDefault();
  const amount = Number(inputLoanAmount.value);
  let aux = logedUser.movements.some((mov) => mov >= amount * 0.1);
  console.log(aux);
  if (aux) {
    logedUser.movements.push(amount);
    refreshUi(logedUser);
  }
});

let sorted = false;

btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(logedUser.movements, !sorted);
  sorted = !sorted;
});
