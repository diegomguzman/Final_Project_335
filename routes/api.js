const express = require('express');
const router = express.Router();

router.get('/joke', async (req, res) => {
    try {
        const response = await fetch('https://official-joke-api.appspot.com/random_joke');
        const joke = await response.json();
        res.json(joke.data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch joke' });
    }
});

module.exports = router;
