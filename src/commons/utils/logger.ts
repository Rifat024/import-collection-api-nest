import path from 'path'
import pino from 'pino'

// const path = require('path');
// const pino = require('pino');
// const logger = pino({
//   prettyPrint: {
//     // Adds the filename property to the message
//     messageFormat: '{filename}: {msg}',

//     // need to ignore 'filename' otherwise it appears beneath each log
//     ignore: 'pid,hostname,filename', 
//   },
// }).child({ filename: path.basename(__filename) });




export const logger = pino({
  level: process.env.LOG_LEVEL || "debug",
  prettyPrint:
    process.env.NODE_ENV !== "production" ||
    process.env.LOG_PRETTY_PRINT === "true",
    // messageFormat: '{filename}: {msg}'
});


export let log = logger;


// export const parentLogger = pino({
//   name: 'Wrapper-service',
//   safe: true,
//   slowtime: true,
//   level: AppConfig.logLevel,
// });


// export let log = parentLogger;


// /**
//  * Sets the child logger so that the Lambda awsRequestId is attached to all the log statements.
//  *
//  * @param awsRequestId Every lambda invocation has a unique request id. This request id corresponds to that invocation.
//  */
// export function setAwsRequestIdForLogger( awsRequestId: string): void {
//   log = parentLogger.child({awsRequestId});
// }


