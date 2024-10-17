//imports
import express from 'express';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import gradeRoutes from './routes/gradeRoutes.mjs';

//setups
const app = express();
dotenv.config();
let PORT = process.env.PORT || 3001;

//middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json({extended: true}));
//routes
app.use('/grades',gradeRoutes);

//listener
app.listen(PORT,()=>{
    console.log(`Server running on port: ${PORT}`)
})