"use strict";

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

// Data
const account1 = {
  owner: "Jonas Schmedtmann",
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    "2019-11-18T21:31:17.178Z",
    "2019-12-23T07:42:02.383Z",
    "2020-01-28T09:15:04.904Z",
    "2020-04-01T10:17:24.185Z",
    "2020-05-08T14:11:59.604Z",
    "2020-05-27T17:01:17.194Z",
    "2020-07-11T23:36:17.929Z",
    "2020-07-12T10:51:36.790Z",
  ],
  currency: "EUR",
  locale: "pt-PT", // de-DE
};

const account2 = {
  owner: "Jessica Davis",
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    "2019-11-01T13:15:33.035Z",
    "2019-11-30T09:48:16.867Z",
    "2019-12-25T06:04:23.907Z",
    "2020-01-25T14:18:46.235Z",
    "2020-02-05T16:33:06.386Z",
    "2020-04-10T14:43:26.374Z",
    "2020-06-25T18:49:59.371Z",
    "2020-07-26T12:01:20.894Z",
  ],
  currency: "USD",
  locale: "en-US",
};

const accounts = [account1, account2];

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
let logedUser, timer;

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

const startLogOutTimer = () => {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(Math.trunc(time % 60)).padStart(2, 0);
    labelTimer.textContent = `${min}:${sec}`;
    if (time == 0) {
      clearInterval(timer);
      labelWelcome.textContent = "Log in to get started";
      containerApp.style.opacity = 0;
    }
    time--;
  };
  let time = 300;

  tick();
  timer = setInterval(tick, 1000);
  return timer;
};

function loginMethod(usr, pin) {
  let currentUser = accounts.find((acc) => acc.username == usr.toLowerCase());
  if (currentUser?.pin == pin) {
    logedUser = currentUser;
    labelWelcome.textContent = `Welcome back ${
      currentUser.owner.split(" ")[0]
    }`;
    refreshUi(currentUser);
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
    objetiveUser.movementsDates.push(new Date().toISOString());
    logedUser.movementsDates.push(new Date().toISOString());
    refreshUi(logedUser);
  }
}

function refreshUi(account) {
  if (timer) clearInterval(timer);
  timer = startLogOutTimer();
  displayMovements(account);
  labelBalance.textContent = Intl.NumberFormat(account.locale, {
    currency: account.currency,
    style: "currency",
  }).format(calculateBalance(account.movements));
  calcDisplaySummary(account);
  let date = Intl.DateTimeFormat(account.locale, {
    year: "numeric",
    month: "2-digit",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
  }).format(new Date());
  labelDate.textContent = date;
}

function displayMovements(acc, sort = false) {
  containerMovements.innerHTML = "";

  const combinedMovsDates = acc.movements.map((mov, i) => ({
    movements: mov,
    movementDate: acc.movementsDates.at(i),
  }));

  if (sort) combinedMovsDates.sort((a, b) => a.movements - b.movements);

  combinedMovsDates.forEach(function (obj, i) {
    const { movements, movementDate } = obj;
    const type = movements > 0 ? "deposit" : "withdrawal";
    const formatedMovement = Intl.NumberFormat(acc.locale, {
      currency: acc.currency,
      style: "currency",
    }).format(movements);

    let date = Intl.DateTimeFormat(acc.locale).format(new Date(movementDate));

    const html = `
     <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${date}</div>
        <div class="movements__value">${formatedMovement}</div>
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
  let inc = movements
    .filter((mov) => mov > 0)
    .reduce((acc, curr) => acc + curr, 0);
  let out = movements
    .filter((mov) => mov < 0)
    .reduce((acc, curr) => acc + curr, 0);
  let sumInt = movements
    .filter((mov) => mov > 0)
    .map((act) => (act * account.interestRate) / 100)
    .reduce((acc, curr) => acc + curr, 0);

  inc = new Intl.NumberFormat(account.locale, {
    currency: account.currency,
    style: "currency",
  }).format(inc);
  out = new Intl.NumberFormat(account.locale, {
    currency: account.currency,
    style: "currency",
  }).format(out);
  sumInt = new Intl.NumberFormat(account.locale, {
    currency: account.currency,
    style: "currency",
  }).format(sumInt);

  labelSumIn.textContent = `${inc}`;
  labelSumOut.textContent = `${out}`;
  labelSumInterest.textContent = `${sumInt}`;
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
    logedUser.movementsDates.push(new Date().toISOString());
    refreshUi(logedUser);
  }
});

let sorted = false;

btnSort.addEventListener("click", function (e) {
  e.preventDefault();
  displayMovements(logedUser, !sorted);
  sorted = !sorted;
});

const setClock = function setClock() {};
