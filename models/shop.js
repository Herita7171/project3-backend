const mongoose = require("mongoose");

const shopSchema = mongoose.Schema({
    shopName: {
        type: String,
        trim: true,
        required: true,
    },
    shopAbout: {
        type: String,
        trim: true,
        required: true,
    },
    shopType: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    includes: [
        {
            brand: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
            availability: String,
        },
    ],
    shopImg: {
        type: Object,
        url: { type: String, required: true },
        public_id: { type: String, required: true },
        responsive: [URL],
        required: true,
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
}, { timestamps: true });

module.exports = mongoose.model("Shop", shopSchema);