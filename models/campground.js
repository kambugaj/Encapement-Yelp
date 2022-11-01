const mongoose = require('mongoose');
const review = require('./review');
const Schema = mongoose.Schema;

const CampGroundSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
    reviews: [
        {
           type: Schema.Types.ObjectId,
           ref: 'Review'
        }
    ]
})

CampGroundSchema.post('findOneAndDelete', async function(doc){
    if(doc){
        await review.remove({
            _id: {
                $in: doc.reviews
            }
        })
    }
})



module.exports = mongoose.model('Campground', CampGroundSchema);

//const camp = new Campground({title: "superduper", price: 666});