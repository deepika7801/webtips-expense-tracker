const express = require("express");
const app = express();
const fs = require("fs");
const bodyParser = require("body-parser");
let currentUser;
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(__dirname));
// render main page.
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.post("/loginPage", (req, res) => {
  var data = JSON.parse(fs.readFileSync("./user.json"));
  if (req.body.username in data) {
    if (req.body.password == data[req.body.username]) {
      let currentName = req.body.username;
      currentUser = currentName;
      res.status(200).json({ data: "success" });
      res.end();
    } else {
      res.status(404).json({ error: "invalid password" });
    }
  } else {
    res.status(404).json({ error: "not found" });
    res.end();
  }
});
app.post("/signup", (req, res) => {
  var data = JSON.parse(fs.readFileSync("./user.json"));
  if (!(req.body.username in data)) {
    data[req.body.username] = req.body.password;
    var mailData = JSON.stringify(data);
    fs.writeFile("./user.json", mailData, () => {});
    var userTransactions = { wallet: 0, transactions: [] };
    userTransactions = JSON.stringify(userTransactions);
    fs.writeFile(
      `./user/${req.body.username}.json`,
      userTransactions,
      () => {}
    );
    let currentName = req.body.username;
    currentUser = currentName;
    res.status(200).json({ walletAmount: userTransactions.wallet });
    res.end();
  } else {
    res.status(404).json({ error: "already exists" });
    res.end();
  }
});
app.post("/addTransaction", (req, res) => {
  var data = JSON.parse(fs.readFileSync(`./user/${currentUser}.json`));
  let category = req.body.category;
  let date = req.body.date;
  let amount = req.body.amount;
  let typeOfExpense = req.body.expense;
  console.log(category);
  if (category.length != 0 && date.length != 0 && amount.length != 0) {
    console.log(data.transactions);
    data.transactions.push({
      category: category,
      date: date,
      amount: amount,
      typeOfExpense: typeOfExpense,
    });
    let wallet = data.wallet;
    let currentvalue = parseInt(data.wallet) - parseInt(amount);
    data.wallet = currentvalue;
    data = JSON.stringify(data);
    fs.writeFileSync(`./user/${currentUser}.json`, data, () => {});
    res.status(200).json({ walletAmount: wallet, currentvalue: currentvalue });
  }
});
app.get("/getDetails", (req, res) => {
  // console.log(`USer:${currentUser}`);
  let data = JSON.parse(fs.readFileSync(`./user/${currentUser}.json`));
  res.json(data);
});
app.post("/addAmount", (req, res) => {
  var data = JSON.parse(fs.readFileSync(`./user/${currentUser}.json`));
  let budget = req.body.budget;
  let wallet = data.wallet;
  let currentWalletValue = parseInt(data.wallet) + parseInt(budget);
  data.wallet = currentWalletValue;
  data = JSON.stringify(data);
  fs.writeFileSync(`./user/${currentUser}.json`, data, () => {});
  res
    .status(200)
    .json({ previousValue: wallet, currentWalletValue: currentWalletValue });
});
//listen to port number 8000.

app.listen(3000);
