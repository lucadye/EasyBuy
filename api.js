const express = require('express');
const router = express.Router();

router.use(express.json());

router.use('/users', require('./routes/users.js'));
router.use('/auth',  require('./routes/auth.js' ));

module.exports = router;
