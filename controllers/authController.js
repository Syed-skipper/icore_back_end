const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const AuthUser = require('../models/userCredential');

exports.register = async (req, res) => {
    const { email, password } = req.body;
    
    try {
        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required" });
        }

        const existingUser = await AuthUser.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: "AuthUser already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new AuthUser({ email, password: hashedPassword });
        await newUser.save();
        return res.status(201).json({ message: "AuthUser registered successfully" });
    } catch (err) {
        return res.status(500).json({ message: "Error registering user", error: err.message });
    }
};


exports.login = async (req, res) => {
    console.log(req.body)
    const { email, password } = req.body;
    try {
        const user = await AuthUser.findOne({ email });
        console.log(user)
        if (!user) return res.status(400).json({ message: 'AuthUser not found' });
        
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ user_id: user.user_id, email: user.email }, process.env.SECRET_KEY, { expiresIn: '10d' });
        res.json({ token });
    } catch (err) {
        console.log('errrr',err)
        res.status(500).json({ message: 'Error logging in', error: err });
    }
};
