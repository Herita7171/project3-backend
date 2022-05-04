const {check, validationResult} = require('express-validator');
const { isValidObjectId } = require("mongoose");

exports.userCheck = [
    check("name").trim().not().isEmpty().withMessage("The name is missing."),
    check("email").normalizeEmail().isEmail().withMessage("The email is invalid."),
    check("password").trim().not().isEmpty().withMessage("The password is missing.")
];

exports.signInValidator = [
    check("email").normalizeEmail().isEmail().withMessage("The email is invalid."),
    check("password").trim().not().isEmpty().withMessage("The password is missing.")
];

exports.brandValidator = [
    check("name").trim().not().isEmpty().withMessage("The brand name is missing."),
    check("about").trim().not().isEmpty().withMessage("The about field is required."),
    check("type").trim().not().isEmpty().withMessage("The type field is required.")
];

exports.validateShop = [
  check("shopName").trim().not().isEmpty().withMessage("The shop name is missing."),
  check("shopAbout").trim().not().isEmpty().withMessage("The about is important."),
  check("shopType").trim().not().isEmpty().withMessage("The shop type is missing."),
  check("city").trim().not().isEmpty().withMessage("The city is missing."),
  check("address").trim().not().isEmpty().withMessage("The address is missing."),
  check("includes").isArray().withMessage("Includes must be an array of objects!")
    .custom((includes) => {
      for (let c of includes) {
        if (!isValidObjectId(c.brand)) {
          throw Error("Invalid brand id inside includes!");
        }
        if (!c.availability?.trim()) throw Error("Availability is missing.");
        return true;
      }
    }),
  // check("poster").custom((_, { req }) => {
  //   if (!req.file) throw Error("Poster file is missing!");

  //   return true;
  // }),
];

exports.validateRatings = check(
  "rating",
  "Rating must be a number between 0 and 5."
).isFloat({ min: 0, max: 5 });

exports.validate = (req, res, next) => {
    const error = validationResult(req).array();
    if (error.length) {
        return res.json({error: error[0].msg});
    }
    next();
}