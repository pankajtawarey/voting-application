const express = require('express');
const router = express.Router();
const User = require('./../models/user');

const { jwtauthmiddleware, generatetoken } = require('./../jwt');


router.post('/signup', async (req, res) => {
    try {
        const data = req.body;  //aasuming the request body contains the user data

        //create a new user document using the mongoose model
        const newuser = new User(data);

        //save the new user to the database
        const response = await newuser.save();
        console.log("data saved");

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));

        const token = generatetoken(response.id)
        console.log('token is', token);

        res.status(200).json({ response: response, token: token });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' });
    }
})

//login route
router.post('/login', async (req, res) => {
    try {
        // extact aadharCardNumber and password from request body
        const { aadharCardNumber, password } = req.body;
        //find the user by aadharCardNumber
        const user = await User.findOne({ aadharCardNumber: aadharCardNumber });
        // if user does not exit or password dose not match,return error
        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'invalid aadharCardNumber and password' });

        }
        //generate token
        const payload = {
            id: user.id
        }
        const token = generatetoken(payload)

        //return token as response
        res.json({ token })

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'internal server error' });
    }
})
//profile route

router.get('/profile', jwtauthmiddleware, async (req, res) => {
    try {
        const userdata = req.user;

        const userid = userdata.id;
        const user = await User.findById(userid);
        res.status(200).json({ user })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'internal server error' });
    }
})

// updation 
router.put('/profile/password', jwtauthmiddleware, async (req, res) => {
    try {
        const userid = req.user; // extract the id from the token
        const { currentPassword, newPassword } = req.body//extract currect and new password from the request body

        //find the user by userid
        const user = await User.findById(userid);

        // if  password dose not match,return error
        if (!(await user.comparePassword(currentPassword))) {
            return res.status(401).json({ error: 'invalid aadharCardNumber and password' });


        }

        //update the user's password
        user.password = newPassword;
        await user.save();

        console.log("password updated")
        res.status(200).json({ message: "password updated" });
    } catch (err) {
        res.send(err);
        res.status(500).json({ error: 'internal server error' });
    }
})

module.exports = router;