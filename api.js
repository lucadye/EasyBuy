const express = require('express');
const router = express.Router();

router.use(express.json());

router.use('/users',         require('./routes/users.js'          ));
router.use('/auth',          require('./routes/auth.js'           ));
router.use('/products',      require('./routes/products.js'       ));
router.use('/images',        require('./routes/images.js'         ));
router.use('/product-lists', require('./routes/product-lists.js'  ));
router.use('/orders',        require('./routes/orders.js'         ));
router.use('/checkout',      require('./routes/checkout.js'       ));

module.exports = router;
