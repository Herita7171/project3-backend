const cloudinary = require("../cloud");

exports.sendError = (res, error, statusCode = 401) => {
    res.status(statusCode).json({error});
};

exports.uploadImageToCloud = async (file) => {
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
      file,
    );
  
    return { url, public_id };
}

exports.formatBrand = (brand) => {
    const { _id, name, about, type, logo } = brand;
    return {
      id: _id,
      name,
      about,
      type,
      logo: logo?.url,
    };
};

exports.handleNotFound = (req, res) => {
    this.sendError(res, "Not found", 404);
}

exports.avgRatingPipeline = (brandId) => {
  return ([
    {
        $lookup: {
            from: "Review",
            localField: "rating",
            foreignField: '_id',
            as: "avgRating"
        }
    },
    {
        $match: {parentBrand: brandId}
    },
    {
        $group: {
            _id: null,
            ratingAvg: {
                $avg: "$rating"
            },
            reviewCount: {
                $sum: 1
            }
        }
    }
  ]);
}

exports.topBrandsPipeline = () => {
    return [
      {
        $lookup: {
          from: "Brand",
          localField: "reviews",
          foreignField: "_id",
          as: "top",
        },
      },
      {
        $match: {
          reviews: { $exists: true },
        },
      },
      {
        $project: {
          title: 1,
          poster: "$logo.url",
          reviewCount: { $size: "$reviews" },
        },
      },
      {
        $sort: {
          reviewCount: -1,
        },
      },
      {
        $limit: 5,
      },
    ];
  };

  exports.relatedBrandAggregation = (brandId) => {
    return [
      {
        $lookup: {
          from: "Brand",
          localField: "",
          foreignField: "_id",
          as: "relatedBrands",
        },
      },
      {
        $match: {
          _id: { $ne: brandId },
        },
      },
      {
        $project: {
          title: 1,
          poster: "$poster.url",
        },
      },
      {
        $limit: 5,
      },
    ];
  };

  exports.getAverageRatings = async (brandId) => {
    const [aggregatedResponse] = await Review.aggregate(
      this.averageRatingPipeline(brandId)
    );
    const reviews = {};
  
    if (aggregatedResponse) {
      const { ratingAvg, reviewCount } = aggregatedResponse;
      reviews.ratingAvg = parseFloat(ratingAvg).toFixed(1);
      reviews.reviewCount = reviewCount;
    }
  
    return reviews;
  };