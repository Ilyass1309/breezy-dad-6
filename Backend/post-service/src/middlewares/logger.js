const { format } = require('date-fns');
const {v4: uuid} = require('uuid');
const fs = require('fs');
const fsPromises = fs.promises;
const path = require('path');

const logEvents = async (message, logFileName) => {
    const dateTime = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const logItem = `${dateTime}\t${uuid()}\t${message}\n`;
    
    try {
        if (!fs.existsSync(path.join('/home', 'logs', 'post-service'))) {
            await fsPromises.mkdir(path.join('/home', 'logs', 'post-service'));
        }
        await fsPromises.appendFile(path.join('/home', 'logs', 'post-service', logFileName), logItem);
    } catch (err) {
        console.error(err);
    }
}

const logger = (req, res, next) => {
    logEvents(`${req.method}\t${req.headers.origin}\t${req.url}`, 'reqLog.txt');
    console.log(`${req.method} ${req.path}`);

    next();
}

module.exports = { logger, logEvents };