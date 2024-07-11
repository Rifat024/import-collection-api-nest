import { promisify } from "util";
import { log } from "./commons/utils/logger";
import { AppConfig } from "./utils/environment/appconfig";
import * as jwt from 'jsonwebtoken';


export const getTimeStampSecond = () => Date.now() / 1000;

const verifyAsync = promisify(jwt.verify);

export const authenticator = async (headers: any) => {

    try {
        log.debug(`authenticator HERE---> ${JSON.stringify(headers)}`);
        if (!headers?.accesstoken) {
            throw new Error('UNAUTHORIZED');
        }
        const decode: any = await verifyAccessToken(headers?.accesstoken);
        log.debug(`decode---> ${JSON.stringify(decode)}`);
        if (decode.status === 'FAIL') {
            throw new Error(decode.message);
        }
        log.debug('##############->', JSON.stringify(decode));
        if (decode.exp < getTimeStampSecond()) {
            throw new Error('Token is expired');
        }
        return { ...decode.data };
    } catch (error) {
        throw new Error(error.message || 'Invalid Token');
    }

};

export const verifyAccessToken = async (accessToken: any) => {
    try {
        log.debug(`accessToken---> ${JSON.stringify(accessToken)}`);
        const decode = await verifyAsync(
            accessToken.toString(),
            AppConfig.SECRET_KEY_ACCESS_TOKEN || '',
        );
        return { status: 'SUCCESS', data: decode };
    } catch (error) {
        log.debug(`error---> ${JSON.stringify(error)}`);
        return { status: 'FAIL', message: 'Invalid Token' };
    }
};