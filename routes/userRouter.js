const router = require("express").Router();

router.get('/test',(req,res) => {
    res.send("hello from test");
})

module.exports = router;