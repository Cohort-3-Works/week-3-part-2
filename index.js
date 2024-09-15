const express = require("express");
const bcrypt = require("bcrypt");
const { UserModel, TodoModel } = require("./db");
const { auth, JWT_SECRET } = require("./auth");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

mongoose.connect(
  "mongodb+srv://subhajit:nainasweetheart@cluster0.xl3y5.mongodb.net/"
);

const app = express();
app.use(express.json());

app.post("/signup", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;
  const name = req.body.name;

  //any function which is problematic and can throw an error which can crash the server
  //should be wrapped in try catch block

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    await UserModel.create({
      email: email,
      password: hashedPassword,
      name: name,
    });
  } catch (e) {
    res.status(400).json({
      message: "Email already exists",
    });
  }

  res.json({
    message: "You are signed up",
  });
});

// app.post("/signin", async function (req, res) {
//   const email = req.body.email;
//   const password = req.body.password;

//   const response = await UserModel.findOne({
//     email: email,
//     password: password,
//   });

//   if (response) {
//     const token = jwt.sign(
//       {
//         id: response._id.toString(),
//       },
//       JWT_SECRET
//     );

//     res.json({
//       token,
//     });
//   } else {
//     res.status(403).json({
//       message: "Incorrect creds",
//     });
//   }
// });

app.post("/signin", async function (req, res) {
  const email = req.body.email;
  const password = req.body.password;

  const user = await UserModel.findOne({
    email: email,
  });

  const passwordMatch = bcrypt.compare(password, user.password);
  if (user && passwordMatch) {
    const token = jwt.sign(
      {
        id: user._id.toString(),
      },
      JWT_SECRET
    );

    res.json({
      token,
    });
  } else {
    res.status(403).json({
      message: "Incorrect creds",
    });
  }
});

app.post("/todo", auth, async function (req, res) {
  const userId = req.userId;
  const title = req.body.title;
  const done = req.body.done;

  await TodoModel.create({
    userId,
    title,
    done,
  });

  res.json({
    message: "Todo created",
  });
});

app.get("/todos", auth, async function (req, res) {
  const userId = req.userId;

  const todos = await TodoModel.find({
    userId,
  });

  res.json({
    todos,
  });
});

app.listen(3000);
