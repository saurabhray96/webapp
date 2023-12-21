var express = require('express');
var router = express.Router();
const userModel= require('./users');
const postModel= require('./post');
const passport = require('passport');
const localStrategy = require ('passport-local');
const upload = require("./multer");
passport.use(new localStrategy(userModel.authenticate()));
/* GET home page. */

//create Account
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/loginAccount', function(req, res, next) {
  res.render('login');
});
//Register user 
router.post('/register', function(req, res, next) {
 const data =new userModel({
  username:req.body.username,
  email:req.body.email,
  contact:req.body.contact
 })
 userModel.register(data,req.body.password)
 .then(function(){
  passport.authenticate('local')(req,res,function(){
    res.redirect("/profile");
  })
 })
});
//create new post
router.post('/createpost',isLoggedIn, upload.single('file'),async function(req,res,next){
  if(!req.file){
    return res.status(400).send("no files were given");
  }
  const user =await userModel.findOne({username:req.session.passport.user});
  const post =await postModel.create({
    image:req.file.filename,
    imageText:req.body.filecaption,
    user:user._id
  });
  user.posts.push(post._id);
  await user.save();
  res.redirect('/profile');
});
//Profile page
router.get('/profile',isLoggedIn,async function(req, res, next) {
  let user= await userModel.findOne({username:req.session.passport.user})
  .populate('posts');
  res.render('profile',{user});
});
//public page
router.get('/publicPage',isLoggedIn,async function(req, res, next) {
  let publicPost= await postModel.find({})
  .populate('user');
   let loginuser = await userModel.findOne({username:req.session.passport.user});
   let alluser = await userModel.find();
   
   res.render('publicPage',{publicPost,loginuser,alluser});
});
//upload profile images
router.post('/fileupload',isLoggedIn,upload.single("image") ,async function(req, res, next) {
const user= await userModel.findOne({username:req.session.passport.user});
user.profileImage=req.file.filename;
await user.save();
res.redirect('/profile');
});

//logout account
router.get('/logout', function(req, res, next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});
router.get('/DApost',isLoggedIn,async function(req,res,next){
  const deleteallpost = await userModel.findOne({username:req.session.passport.user});
const deleted = await postModel.find({_id:deleteallpost.posts});
const userid = await postModel.findOneAndDelete({_id:deleted[0]._id});
console.log(userid);
  res.redirect('/profile');
});


router.post('/login',passport.authenticate('local',{
  failureRedirect:'/loginAccount',
  successRedirect:'/profile',
}), function(req,res,next){
});

function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect('/');
}
router.get('/allpost',async function (req,res,next) {
  const aalluser = await userModel.findOne({username:'a'}).populate('posts');
  res.send(aalluser);
  
});


module.exports = router;
