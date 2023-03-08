const express = require("express");
require('dotenv').config();
const cors = require('cors');
const app = express();
const { default: mongoose } = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require('./models/User');
const Appointment = require('./models/Appointment');
const jsonWebToken = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

const PORT = 4000 || process.env.PORT;

const bcryptSalt = bcrypt.genSaltSync(10);
const jsonWebTokenSecret = 'wsgdhbbdsjnhjhn5463jjsjd2';

mongoose.connect(process.env.MONGO_URL);
const connection = mongoose.connection;
connection.once("open", () => {
    console.log("MongoDB Connected.");
});


const corsOptions ={
    origin: 'https://tattoo-shop-r5no.onrender.com/',
    credentials:true,            
    access-control-allow-credentials: *,
    optionSuccessStatus:200
}
app.use(cors(corsOptions));


app.get('/test', (req, res) => {
    res.json('test okay');
})

app.post('/register', async (req, res) => {
    const {name, email, password} = req.body;
        try {
        const UserData = await User.create({
            name,
            email,
            password:bcrypt.hashSync(password, bcryptSalt)
        });
        res.json(UserData);
    } catch (e) {
        res.status(422).json();
    }
})


app.get('/account/appointments', async (req, res) => {
    try {
    // Get the user ID from the authentication system
    const token = req.cookies.token;
    const decodedToken = jsonWebToken.verify(token, 'wsgdhbbdsjnhjhn5463jjsjd2'); // Replace 'secret' with your secret key1
    // Get the user ID from the decoded token
    const userId = decodedToken.userId;

    // Query the appointment database for appointments associated with the user ID
    const appointments = await Appointment.find({ user_id: userId });

    // Return the filtered appointment data
    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});


app.post('/account/appointments/new', async (req, res) => {
    const {name, email, nid, time, startDate, user_id} = req.body;
        try {
        const AppointmentData = await Appointment.create({
            user_id: user_id,
            name: name,
            email: email,
            nid: nid,
            time: time,
            date: startDate
        });
        res.json(AppointmentData);
    } catch (e) {
        res.status(422).json();
    }
})


app.post('/login', async (req, res) => {
    const {email, password} = req.body;
    const userData = await User.findOne({email});
    if (userData) {
        const checkPass = bcrypt.compareSync(password, userData.password);
        if (checkPass) {
            jsonWebToken.sign({name: userData.name, userId: userData._id, email: userData.email}, jsonWebTokenSecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token).json(userData);
            });
            
        } else {
            res.status(422).json('password not okay');
        }
    } else {
        res.status(422).json("Not found.");
    ;}
}) 


app.get('/profile', (req, res) => {
    const {token} = req.cookies;
    if (token) {
        jsonWebToken.verify(token, jsonWebTokenSecret, {}, (err, user) => {
            if (err) throw err;
            res.json(user)
        })
    }
})


app.post('/logout', (req, res) => {
    res.cookie('token', '').json(true);
})


app.listen(PORT, () => console.log(`app listening at http://localhost:${PORT}`));
