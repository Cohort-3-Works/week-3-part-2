const express = require("express");
const bcrypt = require("bcrypt");
const { UserModel, TodoModel } = require("./db");
const { auth, JWT_SECRET } = require("./auth");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const { z } = require("zod");

mongoose.connect(
  "mongodb+srv://subhajit:nainasweetheart@cluster0.xl3y5.mongodb.net/"
);

const app = express();
app.use(express.json());

app.post("/signup", async function (req, res) {
  const { email, password, name } = req.body;

  // Step 1: Describe the schema in a Zod object
  const requiredBody = z.object({
    email: z.string().email().min(3).max(100),
    password: z.string().min(3).max(30),
    name: z.string().min(3).max(100),
  });

  // Step 2: Validate the request body
  const parsedDataWithSuccess = requiredBody.safeParse(req.body);

  // Step 3: If the validation fails, throw an error
  if (!parsedDataWithSuccess.success) {
    return res.status(400).json({
      message: "Incorrect format",
    });
  }

  // Wrapping in a try-catch block
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);

    await UserModel.create({
      email: email,
      password: hashedPassword,
      name: name,
    });

    // Send success response if user creation succeeds
    res.json({
      message: "You are signed up",
    });
  } catch (e) {
    // Handle error, e.g., if email already exists
    return res.status(400).json({
      message: "Email already exists",
    });
  }
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
