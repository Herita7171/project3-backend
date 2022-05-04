const express = require("express");
const {createShop, updateShopWithoutImg, updateShopWithImg, removeShop} = require("../controllers/shop");
const { isAuth, isAdmin } = require("../middlewares/auth");
const { parseData } = require("../middlewares/helper");
const { uploadImage } = require("../middlewares/multer");
const { validateShop, validate } = require("../middlewares/validator");
const router = express.Router();

router.post(
    "/create",
    isAuth,
    isAdmin,
    uploadImage.single("shopImg"),
    parseData,
    validateShop,
    validate,
    createShop
);

router.patch(
  "/update-shop-without-img/:shopId",
  isAuth,
  isAdmin,
  //parseData,
  validateShop,
  validate,
  updateShopWithoutImg
);

router.patch(
  "/update-shop-with-img/:shopId",
  isAuth,
  isAdmin,
  uploadImage.single("shopImg"),
  parseData,
  validateShop,
  validate,
  updateShopWithImg
);

router.delete("/:shopId", isAuth, isAdmin, removeShop);

module.exports = router;