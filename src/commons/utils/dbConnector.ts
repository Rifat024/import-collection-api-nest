
import { AppConfig } from '../../utils/environment/appconfig';
import { log } from './logger';

import * as AWS from 'aws-sdk';




export const getDbClient = () => {
    const dbClient = new AWS.DynamoDB.DocumentClient();
    log.debug(`AppConfig.environment=>${AppConfig.environment}`);
    // if (AppConfig.environment === 'dev' || AppConfig.environment === 'test') {
        // AWS.config.update({
        //     region: "us-east-1",endpoint: "http://localhost:8000"
        //   });


        AWS.config.update({
            accessKeyId: AppConfig.AWS_ACCESS_KEY_ID,
            secretAccessKey: AppConfig.AWS_SECRET_ACCESS_KEY,
            region: AppConfig.REGION
        });
    // }
    // console.log(`Docclient Response ${JSON.stringify(dbClient)}`);
    return dbClient;

};


export const getSNSClient = () => {
    const snsClient = new AWS.SNS();
    log.debug(`AppConfig.environment=>${AppConfig.environment}`);
    if (AppConfig.environment === 'dev' || AppConfig.environment === 'test') {
        AWS.config.update({
            region: "us-east-1"
        });
    }
    const sns = new AWS.SNS({ apiVersion: '2010-03-31', region: 'us-east-1' });

    return sns;

};