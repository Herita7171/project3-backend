const { sendError } = require("../utils/helper");
const cloudinary = require("../cloud");
const Shop = require("../models/shop");
const { isValidObjectId } = require("mongoose");

exports.createShop = async (req, res) => {
    const { file, body } = req;
  
    const {
        shopName,
        shopAbout,
        shopType,
        city,
        address,
        includes,
    } = body;
  
    const newShop = new Shop({
        shopName,
        shopAbout,
        shopType,
        city,
        address,
        includes,
    });
  
    // upload shop img
    const {
      secure_url: url,
      public_id,
      responsive_breakpoints,
    } = await cloudinary.uploader.upload(file.path, {
      transformation: {
        width: 1280,
        height: 720,
      },
      responsive_breakpoints: {
        create_derived: true,
        max_width: 640,
        max_images: 3,
      },
    });
  
    const finalShopImg = { url, public_id, responsive: [] };
  
    const { breakpoints } = responsive_breakpoints[0];
    if (breakpoints.length) {
      for (let imgObj of breakpoints) {
        const { secure_url } = imgObj;
        finalShopImg.responsive.push(secure_url);
      }
    }
  
    newShop.shopImg = finalShopImg;
  
    await newShop.save();
  
    res.status(201).json({
      id: newShop._id,
      shopName,
    });
};

exports.updateShopWithoutImg = async (req, res) => {
  const {shopId} = req.params;
  if (!isValidObjectId(shopId)) return sendError(res, "The shop ID is invalid.");
  const shop = await Shop.findById(shopId);
  if (!shop) {
    return sendError(res, "The shop was not found.", 404);
  }
  const {
    shopName,
    shopAbout,
    shopType,
    city,
    address,
    includes,
  } = req.body;
  shop.shopName = shopName;
  shop.shopAbout = shopAbout;
  shop.shopType = shopType;
  shop.city = city;
  shop.address = address;
  shop.includes = includes;
  await shop.save();
  res.json({message: "The shop has been updated.", shop});
};

exports.updateShopWithImg = async (req, res) => {
  const {shopId} = req.params;
  if (!isValidObjectId(shopId)) return sendError(res, "The shop ID is invalid.");
  if (!req.file) {
    return sendError(res, "The shop image is missing.");
  }
  const shop = await Shop.findById(shopId);
  if (!shop) {
    return sendError(res, "The shop was not found.", 404);
  }
  const {
    shopName,
    shopAbout,
    shopType,
    city,
    address,
    includes,
  } = req.body;
  shop.shopName = shopName;
  shop.shopAbout = shopAbout;
  shop.shopType = shopType;
  shop.city = city;
  shop.address = address;
  shop.includes = includes;
  // update shop img
  // remove shop img if any
  const shopImgId = shop.shopImg?.public_id;
  if (shopImgId) {
    const {result} = await cloudinary.uploader.destroy(shopImgId);
    if (result !== "ok") {
      return sendError(res, "Could not update this shop image.");
    }
  }
  // upload shop image
  if (file) {
    const {
      secure_url: url,
      public_id,
      responsive_breakpoints,
    } = await cloudinary.uploader.upload(req.file.path, {
      transformation: {
        width: 1280,
        height: 720,
      },
      responsive_breakpoints: {
        create_derived: true,
        max_width: 640,
        max_images: 3,
      },
    });
    const finalShopImg = { url, public_id, responsive: [] };
    const { breakpoints } = responsive_breakpoints[0];
    if (breakpoints.length) {
      for (let imgObj of breakpoints) {
        const { secure_url } = imgObj;
        finalShopImg.responsive.push(secure_url);
      }
    }
    shop.shopImg = finalShopImg;
  }
  await shop.save();
  res.status(201).json({
    id: shop._id,
    shopName,
  })
};

exports.removeShop = async (req, res) => {
  const {shopId} = req.params;
  if (!isValidObjectId(shopId)) return sendError(res, "The shop ID is invalid.");
  const shop = await Shop.findById(shopId);
  if (!shop) {
    return sendError(res, "The shop was not found.", 404);
  }
  // check if need to remove shop img
  const shopImgId = shop.shopImg?.public_id;
  if (shopImgId) {
    const {result} = await cloudinary.uploader.destroy(shopImgId);
    if (result !== "ok") {
      return sendError(res, "Could not remove the shop image.");
    }
  }
  await Shop.findByIdAndDelete(shopId);
  res.json({message: "The shop has been deleted."});
};
