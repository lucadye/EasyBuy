const express = require('express');
const router = express.Router();

router.use(express.json());

router.use('/users', require('./routes/users.js'));

module.exports = router;
