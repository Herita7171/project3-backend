const Brand = require('../models/brand');
const Review = require('../models/review');
const {sendError, uploadImageToCloud, formatBrand,
   avgRatingPipeline, topBrandsPipeline, relatedBrandAggregation, getAverageRatings} = require("../utils/helper");
const { isValidObjectId } = require("mongoose");
const cloudinary = require('../cloud');


exports.createBrand = async (req, res) => {
    const {name, about, type} = req.body;
    const {file} = req;

    const newBrand = new Brand({name, about, type});
    if (file) {
        const {url, public_id} = await uploadImageToCloud(file.path);
        newBrand.logo = {
            url,
            public_id
        };
    }
    await newBrand.save();
    res.status(201).json({brand: formatBrand(newBrand)});
}

exports.updateBrand = async (req, res) => {
    const { name, about, type } = req.body;
    const { file } = req;
    const { brandId } = req.params;
  
    if (!isValidObjectId(brandId)) return sendError(res, "The request is invalid.");
  
    const brand = await Brand.findById(brandId);
    if (!brand) return sendError(res, "Invalid request, record not found!");
  
    const public_id = brand.logo?.public_id;
  
    // remove old image if there was one!
    if (public_id && file) {
      const { result } = await cloudinary.uploader.destroy(public_id);
      if (result !== "ok") {
        return sendError(res, "Could not remove the image from cloud.");
      }
    }
  
    // upload new avatar if there is one!
    if (file) {
      const { url, public_id } = await uploadImageToCloud(file.path);
      brand.logo = { url, public_id };
    }
  
    brand.name = name;
    brand.about = about;
    brand.type = type;
  
    await brand.save();
  
    res.status(201).json(formatBrand(brand));
};

exports.removeBrand = async (req, res) => {
    const { brandId } = req.params;

    if (!isValidObjectId(brandId)) {
        return sendError(res, "The request is invalid.");
    }
    const brand = await Brand.findById(brandId);
    if (!brand) {
        return sendError(res, "The record was not found.");
    }
    const public_id = brand.logo?.public_id;
    if (public_id) {
        const { result } = await cloudinary.uploader.destroy(public_id);
        if (result !== "ok") {
            return sendError(res, "Could not remove brand from database.");
        }
    }
    await Brand.findByIdAndDelete(brandId);
    res.json({message: "This brand has been removed."});
}


exports.searchBrand = async (req, res) => {
    const {query} = req;
    const result = await Brand.find({$text: {$search: `"${query.name}"`}});
    const brands = result.map(brand => formatBrand(brand));
    res.json({results: brands});
}

exports.getLatestBrand = async (req, res) => {
    const result = await Brand.find().sort({createdAt: "-1"}).limit(5);
    const brands = result.map(brand => formatBrand(brand));
    res.json(brands);
}

exports.getSingleBrand = async (req, res) => {
    const {id} = req.params;
    if (!isValidObjectId(id)) {
        return sendError(res, "The request is invalid.");
    }
    const brand = await Brand.findById(id);
    if (!brand) {
        return sendError(res, "The brand was not found.", 404);
    }
    res.json(formatBrand(brand));
}

exports.getBrands = async (req, res) => {
    const { pageNo = 0, limit = 10 } = req.query;
  
    const brands = await Brand.find({})
      .sort({ createdAt: -1 })
      .skip(parseInt(pageNo) * parseInt(limit))
      .limit(parseInt(limit));
  
    const results = brands.map((brand) => ({
      id: brand._id,
      name: brand.title,
      logo: brand.logo?.url,
      type: brand.type,
    }));
  
    res.json({ brands: results });
};

exports.searchBrands = async (req, res) => {
    const { name } = req.query;
  
    if (!name.trim()) return sendError(res, "Invalid request!");
  
    const brands = await Brand.find({ name: { $regex: name, $options: "i" } });
    res.json({
      results: brands.map((m) => {
        return {
          id: m._id,
          name: m.name,
          about: m.about,
          logo: m.logo?.url,
          type: m.type,
        };
      }),
    });
};

exports.getLatestSubmissions = async (req, res) => {
    const {limit = 5} = req.query;

    const results = await Brand.find().sort("-createdAt").limit(parseInt(limit));
    const brands = results.map(m => {
        return {
            id: m._id,
            name: m.name,
            about: m.about,
            logo: m.logo?.url,
            type: m.type
        }
    });
    res.json({brands});
}

exports.getSingleBrand = async (req, res) => {
    const {brandId} = req.params;
    if (!isValidObjectId(brandId)) {
        return sendError(res, "The brand ID is invalid.");
    }
    const brand = await Brand.findById(brandId);
    //const reviews = [];
    const {_id: id, name, about, type, logo} = brand;
    res.json({brand: {
        id, name,
        about,
        type,
        logo: logo?.url,
        //reviews: {...reviews},
    }});
}  

exports.getTopBrands = async (req, res) => {
    const { limit = 5 } = req.query;
  
    const results = await Brand.find()
      .sort("-createdAt")
      .limit(parseInt(limit));
  
    const brands = results.map((m) => {
      return {
        id: m._id,
        name: m.name,
        about: m.about,
        logo: m.logo?.url,
      };
    });
    res.json({ brands });
};

exports.getRelatedBrands = async (req, res) => {
  const { brandId } = req.params;
  if (!isValidObjectId(brandId)) return sendError(res, "Invalid brand id!");

  const brand = await Brand.findById(brandId);

  const brands = await Brand.aggregate(
    relatedBrandAggregation(brand._id)
  );

  const mapBrands = async (m) => {
    const reviews = await getAverageRatings(m._id);

    return {
      id: m._id,
      name: m.name,
      logo: m.logo,
      reviews: { ...reviews },
    };
  };

  const relatedBrands = await Promise.all(brands.map(mapBrands));

  res.json({ brands: relatedBrands });
};