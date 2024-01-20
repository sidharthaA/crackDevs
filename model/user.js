// const mongoose = require("mongoose");

// const UserSchema = new mongoose.Schema({
//     user_id: {
//         type: mongoose.Schema.Types.ObjectId,
//         default: mongoose.Types.ObjectId,
//         required: true,
//     },
//     first_name: {
//         type: String,
//         required: true,
//     },
//     last_name: {
//         type: String,
//         required: true,
//     },
//     email: {
//         type: String,
//         required: true,
//     },
//     password: {
//         type: String,
//         required: true,
//     },
// });

// module.exports = mongoose.model("User", UserSchema);

const mongoose = require('mongoose');

const userCounterSchema = new mongoose.Schema({
  _id: { 
    type: String, 
    required: true 
},
  seq: { 
    type: Number, 
    default: 1 
},
});

const UserCounter = mongoose.model('UserCounter', userCounterSchema);

const userSchema = new mongoose.Schema({
    user_id: { 
        type: Number, 
        unique: true 
    },
    first_name: { 
        type: String,
        required: true 
    },
    last_name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true  
    },
    password: { 
        type: String, 
        required: true 
    },
});

userSchema.pre('save', async function (next) {
    const doc = this;
  
    // Check if user_id is provided, if not, generate and set it
    if (!doc.user_id) {
      try {
        const counter = await UserCounter.findByIdAndUpdate(
          { _id: 'userId' },
          { $inc: { seq: 1 } },
          { new: true, upsert: true }
        );
  
        doc.user_id = counter.seq;
      } catch (error) {
        return next(error);
      }
    }
  
    next();
  });
  

const User = mongoose.model('User', userSchema);

module.exports = User;
