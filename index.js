const express = require('express');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const path = require('path');
const methodOverride = require('method-override');
const Campground = require('./models/campground');
const Review = require('./models/review');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Joi = require('joi');
const campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
})

const app = express();


app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended: true}))
app.use(methodOverride('_method'));



app.get('/', (req,res)=>{
    //res.send('HELLO FROM OTHER SIDE')
    res.render('home')
})

app.get('/home', (req,res)=>{
    //res.send('HELLO FROM OTHER SIDE')
    res.render('home')
})

app.get('/campgrounds', catchAsync(async (req,res)=>{
    //res.send('HELLO FROM OTHER SIDE')
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}))

app.get('/campgrounds/new', (req,res)=>{
    res.render('campgrounds/new');
})

app.get('/campgrounds/dupa', (req,res)=>{
    //const campground = await Campground.findById(req.params.id)
    //res.render('campgrounds/edit', {campground})
    console.log("jeeestem w edicie");
    res.render('home');
})


app.get('/campgrounds/:id/edit', catchAsync(async (req,res)=>{
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
    //console.log("jeeestem w edicie")
    //await res.render('home')
}))

app.get('/campgrounds/:id', catchAsync(async (req,res, next)=>{
    try{
    //res.send('HELLO FROM OTHER SIDE')
    //const campground = await Campground.find({title: 'Elk Creek'})
    const campground = await Campground.findById(req.params.id).populate('reviews')
    res.render('campgrounds/show', {campground})
    }catch (e) {
    next(e)
    }
}))

app.post('/campgrounds', catchAsync(async (req,res,next)=>{
    const campgroundSchema = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required(),
        }).required()
    })
    const result = campgroundSchema.validate(req.body);
    console.log(result.error)
    if(result.error) {
        throw new ExpressError(result.error.details, 400)
    }

    const campground = new Campground(req.body.campground);
    await console.log(campground);
    await campground.save();
    res.redirect('/campgrounds')

}))

app.put('/campgrounds/:id', catchAsync(async (req, res) =>{
  const campground = await Campground.findByIdAndUpdate(req.params.id, {...req.body.campground})
  res.redirect(`${campground._id}`)
} ))

app.delete('/campgrounds/:id', catchAsync(async (req, res) =>{
    await Campground.findByIdAndDelete(req.params.id);
    res.redirect('/campgrounds')
  } ))

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync(async (req, res) =>{
    const {id, reviewId} = req.params;
    const delReview = await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
    //const campground = await Campground.findById(req.params.id);
    //const review = new Review(req.body.review);
    //res.send(review);
    
    //await Campground.findByIdAndDelete(req.params.id);
    //res.redirect('/campgrounds')
  } ))

app.post('/campgrounds/:id/reviews', catchAsync(async (req, res) =>{


    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    await campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
    //res.send("YOU MADEITT")
  } ))

app.all('*', (req,res,next) => {
    next(new ExpressError('Kruca fuks, nie ma strony', 404));
}
)

app.use((err,req,res,next) => {
    const {statusCode = 500, message = 'kruca fuks, cos nie dziala'} = err;
    res.status(statusCode).render('error')
    //res.send('Oh boy something went wrong')
})


app.listen(3000, ()=> {
    console.log('Serving on port 3000')
})