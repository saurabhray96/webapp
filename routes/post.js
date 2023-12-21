const mongoose = require('mongoose');
const postSchema = new mongoose.Schema({
    imageText:{
        type:String,
        require:true,
    },
    image:{
        type:String
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'user'
    },
    dateAndTime:{
        type:Date,
        default:Date.now,
    },
    
});
module.exports=mongoose.model('Post',postSchema);