const mongoose = require('mongoose');
const {Schema} = mongoose;

const appointmentSchema = new Schema ({
    owner: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    user_id: { type: String, required: true },
    name: String,
    email: String,
    nid: String,
    //samplePhotos: [String],
    time: String,
    date: String
    //description: String,  
});

const AppointmentModel = mongoose.model('Appointment', appointmentSchema);

module.exports = AppointmentModel;