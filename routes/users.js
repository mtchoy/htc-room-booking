var express = require('express');
var router = express.Router();

// const checkToken = require('../middlewares/checkToken');
const { connectToDB, ObjectId } = require('../utils/db');

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send('respond with a resource');
});

// User login
router.post('/login', async function (req, res, next) {
  const token = req.body.credential;

  const { OAuth2Client } = require('google-auth-library');
  const client = new OAuth2Client(CLIENT_ID);

  async function verify() {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: CLIENT_ID,  // Specify the CLIENT_ID of the app that accesses the backend
      // Or, if multiple clients access the backend:
      //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3]
    });
    const payload = ticket.getPayload();
    // const userid = payload['sub'];
    // If request specified a G Suite domain:
    // const domain = payload['hd'];

    // Check if user exists in database
    const db = await connectToDB();
    try {
      const result = await db.collection('user').findOne({ email: payload.email })
        || { email: payload.email, role: "member" };

      // generate token
      const token = jwt.sign({ email: result.email, role: result.role }, process.env.TOKEN_SECRET);
      res.header('auth-token', token).status(200).json({ message: 'User logged in successfully' });

    } catch (err) {
      res.status(400).json({ message: err.message }); // 400 Bad Request
    }
  }

  verify().catch(console.error);

});

module.exports = router;
