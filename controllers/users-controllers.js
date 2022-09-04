const { validationResult } = require("express-validator");
const HttpError = require("../models/http-error");
const User = require("../models/user");

const DUMMY_USERS = [
  {
    id: "u1",
    name: "Max Schwarz",
    email: "test@test.com",
    password: "testers",
  },
];

const getUsers = async (req, res, next) => {
  let users;
  try{
    users = await User.find({}, '-password');
  }
  catch(err){
    const error = new HttpError('Fetching users failed, please try again later.', 500);
    return next(error);
  }
  res.json({users: users.map(user => user.toObject({getters: true}))});

};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(HttpError("Invalid inputs passed, please check your data.", 422)); 
  }

  const { name, email, password, places} = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Signing up failed, please try again later.",
      500
    );
    return next(error);
  }

  if (existingUser) {
    const error = new HttpError(
      "User exists already, please login instead.",
      422
    );
    return next(error);
  }

  const createdUser = new User({
    name,
    email,
    image:
      "https://media.istockphoto.com/photos/new-york-city-skyline-picture-id486334510?b=1&k=20&m=486334510&s=170667a&w=0&h=QN8zZ6h4u8blAxXQlc1L1Nb3WGtN82_dXcbiDnfylPI=",
    password,
    places
  });

  try {
    await createdUser.save();
  } catch (err) {
    const error = new HttpError("Signing up failed, please try again.", 500);
    return next(error);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let existingUser;

  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    const error = new HttpError(
      "Loggin in failed, please try again later.",
      500
    );
    return next(error);
  }

  if(!existingUser || existingUser.password !== password){
    const error = new HttpError(
      'Invalid credentials, could not log you in.', 401
    );
    return next(error);
  }

  res.json({ message: "Logged in!" });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
