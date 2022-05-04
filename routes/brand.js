const express = require('express');
const { createBrand, updateBrand, removeBrand, getBrands, getLatestBrand,
     searchBrands, getLatestSubmissions, getSingleBrand, getRelatedBrands} = require('../controllers/brand');
const { isAuth, isAdmin } = require("../middlewares/auth");
const { uploadImage } = require('../middlewares/multer');
const { brandValidator, validate } = require('../middlewares/validator');
const router = express.Router();

router.post(
    "/create",
    isAuth,
    isAdmin,
    uploadImage.single("logo"),
    brandValidator,
    validate,
    createBrand
);

router.post(
    "/update/:brandId",
    isAuth,
    isAdmin,
    uploadImage.single("logo"),
    brandValidator,
    validate,
    updateBrand
);

router.delete("/:brandId", isAuth, isAdmin, removeBrand);
router.get("/brands", isAuth, isAdmin, getBrands);
router.get("/search", isAuth, isAdmin, searchBrands);
router.get("/latest", isAuth, isAdmin, getLatestBrand);

// normal users
router.get("/latest-submissions", getLatestSubmissions);
router.get("/single/:brandId", getSingleBrand);
router.get("related/:brandId", getRelatedBrands);


module.exports = router;