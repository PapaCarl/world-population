const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const keys = require('../config/keys');
const errorHandler = require('../utils/errorHandler');

module.exports.login = async (req, res) => {
    const candidate = await User.findOne({email: req.body.email});
    if(candidate) {
        const passwordResult = bcrypt.compareSync(req.body.password, candidate.password);
        if (passwordResult) {
            const token = jwt.sign({
                email: candidate.email,
                userId: candidate._id
            }, keys.jwt, {expiresIn: 60 * 60});
            res.status(200).json({
                token: `Bearer ${token}`
            })
        } else {
            res.status(401).json({
                message: "password isn't correct, try again"
            })
        }
    } else {
      res.status(404).json({
          message: "user with this email isn't founded"
      })
    }

};

module.exports.register = async (req, res) => {
    const candidate = await User.findOne({email: req.body.email});
    if(candidate) {
        res.status(409).json({
            message: 'This email is used'
        })
    } else {
        const salt = bcrypt.genSaltSync(10);
        const password = req.body.password;
        const user = new User({
            email: req.body.email,
            password: bcrypt.hashSync(password, salt)
        });
        try {
            await user.save().then(()=>{console.log('save Ok!')});
            res.status(201).json({
                message: 'ok'
            })
        } catch (e) {
            errorHandler(res, e)
        }

    }
}