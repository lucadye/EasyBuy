const express = require('express');
const router = express.Router();

router.use(express.json());

router.use('/users',    require('./routes/users.js'   ));
router.use('/auth',     require('./routes/auth.js'    ));
router.use('/products', require('./routes/products.js'));
router.use('/images',   require('./routes/images.js'  ));

module.exports = router;
