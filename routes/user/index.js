
var router =  require('express').Router();

const userRoutes = require('./user');
const localUserRoutes = require('./local');
const googleUserRoutes = require('./google');

router.use(userRoutes);
router.use(localUserRoutes);
router.use(googleUserRoutes);

module.exports= router;