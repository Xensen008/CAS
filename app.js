const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json());

const authRoutes = require('./Routes/auth.routes');
app.use('/api/auth', authRoutes);

const port = process.env.PORT || 8080

app.get('/',(req,res)=>{
    res.send("hello Arnab")
})

app.listen(port,()=>{
    console.log(`server running at ${port}`)
})