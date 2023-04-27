import cors from 'cors';
import express from 'express';
import * as dotenv from 'dotenv'

import connectDB from './config/db.js'
import AppError from "./utilis/appError.js";
import userRoutes from "./routes/userRoutes.js";
import helpRoutes from "./routes/helpRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import imageRouter from "./routes/imageRouter.js";
import messageRoutes from "./routes/messageRoutes.js";
import messageStatRoutes from "./routes/messageStatRoutes.js";
import userFollowerRoutes from "./routes/userFollowerRoutes.js";
import {globalErrorHandler} from "./controllers/errorController.js";

// ------------------------------
// Init Express App
// ------------------------------
dotenv.config();  // Load ENV
connectDB().then() // connect DB
const app = express();
app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({extended: true})); // For parsing application/x-www-form-urlencoded
app.use(cors());

// ------------------------------
// routes
// ------------------------------
app.get('/', (req, res) => {
    res.send(`Basecamp Server v0.0.1 is Running...`);
});

app.use('/users', userRoutes)
app.use('/user-followers', userFollowerRoutes)
app.use('/messages', messageRoutes)
app.use('/message-stats', messageStatRoutes)
app.use('/helps', helpRoutes)
app.use('/groups', groupRoutes)
app.use('/images', imageRouter)

// To deal all request whose URL is not specified in the server
app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

// ------------------------------
// Listen at port 8080
// ------------------------------
const port = parseInt(process.env.PORT) || 8080;
app.listen(port, () => {
    console.log(`Basecamp API listening on port ${port}`);
});