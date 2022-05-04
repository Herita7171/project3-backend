const mongoose = require('mongoose');

const brandSchema = mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true,
    },
    about: {
        type: String,
        trim: true,
        required: true,
    },
    type: {
        type: String,
        trim: true,
        required: true,
    },
    logo: {
        type: Object,
        url: String,
        publid_id: String
    },
    reviews: [{ type: mongoose.Schema.Types.ObjectId, ref: "Review" }],
}, {timestamps: true});

brandSchema.index({name: "text"});

module.exports = mongoose.model("Brand", brandSchema);