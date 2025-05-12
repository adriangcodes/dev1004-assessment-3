import { Schema, model } from 'mongoose'

const userSchema = new Schema({
  walletId: {
    type: String,
    required: true,
    unique: true,
    minLength: 1,
    maxLength: 200
  },
  email: {
    type: String,
    required: true,
    unique: true,
    minLength: 3,
    maxLength: 200
  },
  password: {
    type: String,
    required: true,
    minLength: 8,
    maxLength: 100
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { timestamps: true })

const User = model('User', userSchema)

export default User

// import { model } from 'mongoose'

// const User = model('User', {
//     walletId: {
//         type: String,
//         required: true,
//         unique: true,
//         minLength: 1,
//         maxLength: 200
//     },
//     email: {
//         type: String,
//         required: true,
//         unique: true,
//         minLength: 3,
//         maxLength: 250
//     },
//     password: {
//         type: String,
//         required: true,
//         minLength: 8
//     },
//     isActive: {
//         type: Boolean,
//         default: true
//     },
//     isAdmin: {
//         type: Boolean,
//         default: false
//     },
//     createdAt: {
//         type: Date,
//         default: Date.now
//     }
// })

// export default User