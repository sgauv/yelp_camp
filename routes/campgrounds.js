var express = require('express');
var router = express.Router();
var Campground = require('../models/campground');
var middleware = require('../middleware');
var geocoder = require('geocoder');

//INDEX - show all campgrounds
router.get('/',function(req,res){
    Campground.find({},function(err, allCampgrounds){
        if(err){
            console.log(err);
        }else{
            res.render('campgrounds/index',{campgrounds: allCampgrounds, page: 'campgrounds'});
        }
    });
});
//CREATE route
router.post('/', middleware.isLoggedIn,function(req,res){
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    geocoder.geocode(req.body.location, function(err,data){
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newCampground = {name: name, price: price, image: image, description: desc, author:author, location: location, lat: lat, lng: lng};

        Campground.create(newCampground,function(err,newlyCreated){
            if(err){
                console.log(err);
            }else{
                console.log(newlyCreated);
                res.redirect('/campgrounds');
            }
        });
    });
});
//NEW route
router.get('/new', middleware.isLoggedIn, function(req,res){
    res.render('campgrounds/new'); 
});
//SHOW route
router.get('/:id',function(req,res){
    Campground.findById(req.params.id).populate('comments').exec(function(err,foundCampground){
       if(err){
           console.log(err);
       } else {
           console.log(foundCampground);
           res.render('campgrounds/show',{campground: foundCampground});
       }
    });
});
//EDIT CAMPGROUND ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req,res){
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground}); 
    });    
});
//UPDATE CAMPGROUND ROUTE
router.put('/:id', middleware.checkCampgroundOwnership, function(req,res){
   geocoder.geocode(req.body.location,function(err,data){
        var lat = data.results[0].geometry.location.lat;
        var lng = data.results[0].geometry.location.lng;
        var location = data.results[0].formatted_address;
        var newData = {name: req.body.name, image: req.body.image, price: req.body.price, description: req.body.description, location: location, lat: lat, lng: lng};
        Campground.findByIdAndUpdate(req.params.id,req.body.campground, function(err,updatedCampground){
            if(err){
                req.flash('error', err.message);
                res.redirect('back');
            } else {
                req.flash('success','Sucessfully Updated!');
                res.redirect('/campgrounds/'+req.params.id);
            }
        });
   });
});
//DESTROY CAMPGROUND ROUTE
router.delete('/:id', middleware.checkCampgroundOwnership, function(req,res){
   Campground.findByIdAndRemove(req.params.id, function(err){
       if(err){
           res.redirect('/campgrounds');
       } else {
           res.redirect('/campgrounds');
       }
   }); 
});

module.exports = router;
