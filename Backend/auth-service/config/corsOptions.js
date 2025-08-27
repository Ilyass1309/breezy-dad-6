const allowedOrigins = require('./allowedOrigins')

const corsOptions = {
    origin: (origin, callback) => {
    // log removed
        if(allowedOrigins.indexOf(origin) !== -1 || !origin){
            // log removed
            callback(null, true);
        }
        else{
            // log removed
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions;