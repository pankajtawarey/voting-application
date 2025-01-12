const express = require('express');
const router = express.Router();
const User = require('../models/user')

const { jwtauthmiddleware, generatetoken } = require('../jwt');
const Candidate = require('../models/candidate');

const checkAdminRole = async (userId) => {
    try {
        const user = await User.findById(userId);
        return user.role === 'admin';
    } catch (err) {
        return false;
    }
}

router.post('/', jwtauthmiddleware, async (req, res) => {
    try {
        if (! await checkAdminRole(req.user.id))
            return res.status(403).json({ message: 'user has not admin role' });

        const data = req.body;  //aasuming the request body contains the candidate data

        //create a new user document using the mongoose model
        const newcandidate = new Candidate(data);

        //save the new candidate to the database
        const response = await newcandidate.save();
        console.log("data saved");

        res.status(200).json({ response: response });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' });
    }
})

// updation 
router.put('/:candidateID', jwtauthmiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ message: 'user has not admin role' });
        const candidateID = req.params.candidateID;
        const candidateupdatedata = req.body;
        const response = await Candidate.findByIdAndUpdate(candidateID, candidateupdatedata, {
            new: true,
            runValidators: true
        })
        if (!response) {
            return res.status(404).json({ error: 'candidate not found' })
        }
        console.log("candidate data updated")
        res.status(200).json(response);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' });
    }
})

router.delete('/:candidateID', jwtauthmiddleware, async (req, res) => {
    try {
        if (!checkAdminRole(req.user.id))
            return res.status(403).json({ message: 'user has not admin role' });

        const candidateID = req.params.candidateID;

        const response = await Candidate.findByIdAndDelete(candidateID);
        if (!response) {
            return res.status(404).json({ error: 'candidate not found' })
        }
        console.log("candidate deleted")
        res.status(200).json(response);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' });
    }
})

//let's start voting
router.post('/vote/:candidateID', jwtauthmiddleware, async (req, res) => {
    //no admin can vote
    //user can only vote once

    candidateID = req.params.candidateID;
    userId = req.user.id;

    try {
        //find the candidate documnet with the specified candidateid
        const candidate = await Candidate.findById(candidateID);
        if (!candidate) {
            return res.status(404).json({ message: 'candidate not found' });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'user not found' })
        }
        if (user.isVoted) {
            res.status(400).json({ message: 'you have already voted' })
        }
        if (user.role == 'admin') {
            res.status(403).json({ message: 'admin is not allowed' })
        }

        //update the candidate document to record the vote
        candidate.votes.push({ user: userId })
        candidate.voteCount++;
        await candidate.save();

        //update the user document
        user.isVoted = true
        await user.save();

        res.status(200).json({ message: 'vote recorded successfully' })

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'internal server error' })

    }
})

//vote count
router.get('/count', async (req, res) => {
    try {
        // Find all candidates and sort them by voteCount in descending order
        const candidate = await Candidate.find().sort({ voteCount: 'desc' });

        // Map the candidates to only return their name and voteCount
        const voteRecord = candidate.map((data) => {
            return {
                "party": data.party,
                "Count": data.voteCount
            }
        });

        return res.status(200).json(voteRecord);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Get List of all candidates with only name and party fields
router.get('/pankaj', async (req, res) => {
    try {
        // Find all candidates and select only the name and party fields, excluding _id
        const candidates = await Candidate.find({}, 'name party -_id');

        // Return the list of candidates
        res.status(200).json(candidates);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

module.exports = router;