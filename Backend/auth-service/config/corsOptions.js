const allowedOrigins = require('./allowedOrigins')

const corsOptions = {
    origin: (origin, callback) => {
        console.log('[CORS] Origin reçu :', origin);
        if(allowedOrigins.indexOf(origin) !== -1 || !origin){
            console.log('[CORS] Origin autorisé');
            callback(null, true);
        }
        else{
            console.warn('[CORS] Origin refusé :', origin);
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
}

module.exports = corsOptions;