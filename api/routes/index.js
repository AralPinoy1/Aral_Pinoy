const express = require('express');
const jwt = require('jsonwebtoken')
const expressJwt = require('express-jwt')

const UserModel = require('../models/users');

const router = express.Router();

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/login', async function (req, res, next) {
  const {
    email,
    password
  } = req.body

  try {
    const user = await UserModel.findOne({
      email,
      roles: 'Volunteer'
    });
  
    if (user === null) {
      throw new Error('Invalid email address or password');
    }
  
    if (user.password !== password) {
      throw new Error('Invalid email address or password');
    }

    const token = jwt.sign({
      sub : user._id,
    }, 'secret', {
      algorithm : 'HS256',
      expiresIn : '4h'
    })
  
    res.send({
      user,
      token
    });
  } catch (error) {
    res.status(400);
    
    res.json({
      error: {
        message: error.message
      }
    });

    next();
  }
});

router.post(
  '/register', 
  async function(req, res, next) {
    const {
      email,
      password,
      contactNumber,
      firstName,
      middleName,
      lastName
    } = req.body;

    const user = new UserModel();

    user.email = email;
    user.password = password;
    user.contactNumber = contactNumber;
    user.firstName = firstName;
    user.middleName = middleName;
    user.lastName = lastName;
    user.roles = ['Volunteer'];

    try {
      await user.save();

      res.send(user);
    } catch (error) {
      res.json({
        error: {
          message: error.message
        }
      });

      next();
    }
  }
);

router.get(
  '/protected', 
  expressJwt({ secret: 'secret', algorithms: ['HS256'] }),
  function(req, res, next) {
    res.json({
      hello : 'world'
    });
  }
);

module.exports = router;
