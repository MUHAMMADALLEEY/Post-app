const mongoose=require('mongoose')
const postSchema=mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,ref:"User"},
    date:{
        type:Date,
        default:Date.now
    },
    content:String,
    likes:[{type:mongoose.Schema.Types.ObjectId,ref:"User"}],
    // comments:[{type:mongoose.Schema.Types.ObjectId,ref:"comment"}],
    // shares:[{type:mongoose.Schema.Types.ObjectId,ref:"post"}],
    // replies:[{type:mongoose.Schema.Types.ObjectId,ref:"reply"}],
    // retweets:[{type:mongoose.Schema.Types.ObjectId,ref:"post"}],
})

module.exports=mongoose.model('post',postSchema)
