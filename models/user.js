const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
//define the person schema
const userschema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    email: {
        type: String
    },
    mobile: {
        type: String
    },
    address: {
        type: String,
        required: true
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unqiue: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted: {
        type: Boolean,
        default: false
    }
})

userschema.pre('save', async function (next) {
    const person = this;
    if (!person.isModified('password')) return next();
    try {  // hash password generate
        const salt = await bcrypt.genSalt(10);

        //hash password
        const hashpassword = await bcrypt.hash(person.password, salt);
        person.password = hashpassword
        next();
    } catch (err) {
        return next(err);
    }
})
userschema.methods.comparePassword = async function (candidatePassword) {
    try {
        const ismatch = await bcrypt.compare(candidatePassword, this.password)
        return ismatch;
    } catch (err) {
        throw err;
    }
}

const User = mongoose.model('User', userschema);
module.exports = User;
