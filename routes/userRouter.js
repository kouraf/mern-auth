const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const auth = require("../middleware/auth");


// register endpoint

router.post('/signup', async (req, res) => {
    try {

        const { email, password, passwordCheck, name } = req.body;
        var displayName = name;

        // validation

        //email validation
        if (!email)
            return res.status(400).json({ error: "Email field is missing." });
        const emailExist = await User.findOne({ email });
        if (emailExist)
            return res.status(400).json({ error: "An account with this email already exists." });

        // password validation
        if (!password)
            return res.status(400).json({ error: "Password field is missing." });
        if (!passwordCheck)
            return res.status(400).json({ error: "Confirmation password field is missing." });
        if (password.length < 5)
            return res.status(400).json({ error: "Your password needs to be at least 5 characters long." });
        if (password !== passwordCheck)
            return res.status(400).json({ error: "Your password and confirmation password do not match." });

        // name validation
        if (!name)
            displayName = email;


        // Hashing the password

        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hash(password, salt);

        // Creating a new user

        const newUser = new User({
            email,
            password: hashedPassword,
            name: displayName
        });
        const savedUser = await newUser.save();
        res.json(savedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// login endpoint

router.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        //validation

        // email validation

        if (!email)
            return res.status(400).json({ error: "Email field is missing." });

        // password validation

        if (!password)
            return res.status(400).json({ error: "Password field is missing." });
        if (password.length < 5)
            return res.status(400).json({ error: "Your password needs to be at least 5 characters long." });

        // check if the user exists

        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ error: "Invalid credentials." });

        //check is the password is correct

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ error: "Invalid credentials." });

        // send the jwt (login the user)

        const token = jwt.sign({ id: user._id }, process.env.JWT_KEY);
        res.json({
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name
            }
        })
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// delete a user endpoint

router.delete("/delete", auth, async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.user);
        res.json(deletedUser);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

// check if the token is valid

router.post("/tokenIsValid", async (req, res) => {
    try {
        const token = req.header("x-auth-token");
        if (!token)
            return res.json(false);

        const verifiedToken = jwt.verify(token, process.env.JWT_KEY);
        if (!verifiedToken)
            return res.json(false);

        const user = await User.findById(verifiedToken.id);
        if (!user)
            return res.json(false);

        res.json(true);

    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})




module.exports = router;