const { isValidObjectId } = require("mongoose");
const Brand = require("../models/brand");
const Review = require("../models/review");
const { sendError } = require("../utils/helper");

exports.addReview = async (req, res) => {
  const { brandId } = req.params;
  const { content, rating } = req.body;
  const userId = req.user._id;

  console.log(brandId)
  console.log(content, rating)

  if (!isValidObjectId(brandId)) return sendError(res, "Invalid Brand.");

  const brand = await Brand.findOne({ _id: brandId });
  if (!brand) return sendError(res, "Brand not found.", 404);

  const isAlreadyReviewed = await Review.findOne({
    author: userId,
    parentBrand: brand._id,
  });

  if (isAlreadyReviewed)
    return sendError(res, "Invalid request, review is already made.");

  // create and update review.
  const newReview = new Review({
    author: userId,
    parentBrand: brand._id,
    content,
    rating,
  });

  // update review for brand.
  brand.reviews.push(newReview._id);
  await brand.save();

  // save new review
  await newReview.save();

  res.json({ message: "The review has been added." });
};

exports.updateReview = async (req, res) => {
  const { reviewId } = req.params;
  const { content, rating } = req.body;
  const userId = req.user._id;

  if (!isValidObjectId(reviewId)) return sendError(res, "Invalid Review ID!");

  const review = await Review.findOne({ author: userId, _id: reviewId });
  if (!review) return sendError(res, "Review not found!", 404);

  review.content = content;
  review.rating = rating;

  await review.save();

  res.json({ message: "Your review has been updated." });
};

exports.removeReview = async (req, res) => {
  const { reviewId } = req.params;
  const userId = req.user._id;

  if (!isValidObjectId(reviewId)) return sendError(res, "Invalid review ID!");

  const review = await Review.findOne({ author: userId, _id: reviewId });
  if (!review) return sendError(res, "Invalid request, review not found!");

  const brand = await Brand.findById(review.parentBrand).select("reviews");
  brand.reviews = brand.reviews.filter((rId) => rId.toString() !== reviewId);

  await Review.findByIdAndDelete(reviewId);

  await brand.save();

  res.json({ message: "Review has been removed." });
};

exports.getReviewsByBrand = async (req, res) => {
  const { brandId } = req.params;

  if (!isValidObjectId(brandId)) return sendError(res, "Invalid brand ID!");

  const brand = await Brand.findById(brandId)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
        select: "name",
      },
    })
    .select("reviews title");

  const reviews = brand.reviews.map((r) => {
    const { author, content, rating, _id: reviewID } = r;
    const { name, _id: authorId } = author;

    return {
      id: reviewID,
      author: {
        id: authorId,
        name,
      },
      content,
      rating,
    };
  });

  res.json({ brand: { name: brand.name, reviews } });
};

