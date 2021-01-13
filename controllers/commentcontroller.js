const express = require('express');
const router = express.Router();
const Comment = require('../models/comment');
const validateSession = require('../middleware/ValidateSession');

router.get('/practice', (req, res) => res.send('Hey!! This is a practice route'));

//CREATE COMMENTS & RATING
router.post('/create', validateSession, async (req, res) => {
    try {
        const {username, date, entry, rating} = req.body;
        let newComment = await Comment.create({username, date, entry, rating, owner: req.user.id, submissionId: req.submission.id});
        res.status(200).json({
            comment: newComment,
            message: 'Comment created!'
        })
    } catch (error) {
        res.status(500).json({
            message: 'Failed to add comment!'
        })
    }
});

// GET ALL ENTRIES (http://localhost:4000/submission/)
router.get('/', (req, res) => {
    Comment.findAll ()
    .then(comments => res.status(200).json(comments))
    .catch(err => res.status(500).json({ error: err}))
});

//GET COMMENTS BY USER (http://localhost:4000/submission/mine (plus the token id))
router.get("/mine", validateSession, (req, res) => {
    let userid = req.user.id
    Comment.findAll ({
        where: { owner: userid, submission: userid }
    })
        .then(comments => res.status(200).json(comments))
        .catch(err => res.status(500).json({ error: err }))
});


//COMMENTS UPDATE (http://localhost:4000/update/2 (put entry number to update!))
router.put('/update/:entryId', validateSession, function (req, res) {
    const updateCommentEntry = {
        userName: req.body.comment.userName,
        date: req.body.comment.date,
        entry: req.body.comment.entry,
        rating: req.body.comment.rating
    };

    const query = { where: { id: req.params.entryId, owner: req.user.id, submission: req.body.id }};

    Comment.update(updateCommentEntry, query)
        .then(() => res.status(200).json({message: 'Comment has been updated!'}))
        .catch((error) => res.status(500).json({ error: error.message || serverErrorMsg  }));
});

//COMMENT DELETE (http://localhost:4000/delete/9 (put entry number to delete!))

router.delete('/delete/:id', validateSession, function (req, res) {
    const query = { where: {id: req.params.id, owner: req.user.id }};

    Comment.destroy(query)
        .then(() => res.status(200).json({ message: 'Comment has been Removed'}))
        .catch((err) => res.status(500).json ({ error: err }));
});

module.exports = router;