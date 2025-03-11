const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Body parser
app.use(express.json());

const authRoutes = require('./Routes/auth.routes');
const availabilityRoutes = require('./Routes/availability.routes');
const appointmentRoutes = require('./Routes/appointment.routes');

app.use('/api/auth', authRoutes);
app.use('/api', availabilityRoutes);
app.use('/api/appointments', appointmentRoutes);

app.get('/',(req,res)=>{
    res.send("hello Arnab")
});

// Only start server if not in test mode
if (process.env.NODE_ENV !== 'test') {
    const port = process.env.PORT || 8080;
    connectDB().then(() => {
        app.listen(port, () => {
            console.log(`server running at ${port}`);
        });
    });
}

module.exports = app;