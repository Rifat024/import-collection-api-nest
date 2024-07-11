import * as AWS from 'aws-sdk';
import { SNS } from '@aws-sdk/client-sns';
import { replaceAll } from '../commonUtils';

import { getSecuredChnlVal, getSecuredChnlValOnly } from '../commonUtils';
import { encrypt } from '../crypto';

import { AppConfig } from '../../environment/appconfig';
import { region } from '../../constants';
import { log } from '../logger';

var sns = new SNS({ region: region });

export const getArnForTopic = async (obj, context) => {
  const awsAccountId = context.invokedFunctionArn.split(':')[4];

  return (
    'arn:aws:sns:' + process.env.AWS_REGION + ':' + awsAccountId + ':' + obj
  );
};

export const jOtp_deliver_otp = async (obj) => {
  // Create publish parameters
  var params = {
    Message: JSON.stringify(obj),
    TopicArn: AppConfig.SNS_JOTP_DELIVER_OTP,
  };

  let publishTextPromise = await sns.publish(params);
  console.log('jOtp_deliver_otp ===>', publishTextPromise);

  return;
};

export const jOtp_verified_chnl_Val = async (obj) => {
  let localObj = { ...obj };
  localObj.securedChnlVal = getSecuredChnlVal(localObj);
  delete localObj.channelValue;
  delete localObj.transactionId;
  // Create publish parameters
  var params = {
    Message: JSON.stringify(localObj),
    TopicArn: AppConfig.SNS_JOTP_VERIFIED_CHNL_VAL,
  };

  let publishTextPromise = await sns.publish(params);
  console.log('jotp_verified_chnl_Val ===>', publishTextPromise);

  return;
};

export const jOtp_otp_verify_req_rcvd = async (
  request,
  transactionId,
  action,
  otpVal,
  encrypOtpVal,
) => {
  let recordLocal = { ...request };
  let recordAsString = JSON.stringify(recordLocal);
  console.log(`otpVal=> ${otpVal}`);
  console.log(`encrypOtpVal=> ${encrypOtpVal}`);
  console.log(`recordAsString=> ${recordAsString}`);

  const replaceChnlValRecord = replaceAll(recordAsString, otpVal, encrypOtpVal);
  console.log(`replaceChnlValRecord=> ${replaceChnlValRecord}`);
  recordLocal = JSON.parse(replaceChnlValRecord);
  recordLocal.action = action;

  recordLocal.encrypOtpVal = encrypOtpVal;
  recordLocal.transactionId = transactionId;

  var params = {
    Message: JSON.stringify(recordLocal),
    TopicArn: AppConfig.SNS_JOTP_RECEIVED_VERIFY_REQUEST,
  };

  let publishTextPromise = await sns.publish(params);
  console.log('jOtp_otp_verify_req_rcvd ===>', publishTextPromise);

  return;
};

export const jOtp_otp_req_rcvd = async (
  record,
  channelVal,
  action,
  otpCampaignId,
  channel,
  transactionId,
) => {
  let recordLocal = { ...record };
  console.log(`jOtp_otp_req_rcvd==channelVal ===> ${channelVal}`);
  let securedChnlVal = getSecuredChnlValOnly(channelVal);
  let encryptedChnlVal = await encrypt(channelVal);
  console.log(`encryptedChnlVal ===> ${encryptedChnlVal.hash}`);
  recordLocal.internalChnlVal = encryptedChnlVal.hash;
  recordLocal.securedChnlVal = securedChnlVal;
  let recordAsString = JSON.stringify(recordLocal);
  console.log(`jOtp_lock_unlock_history....1 ${channelVal}`);
  console.log(`securedChnlVal....1 ${securedChnlVal}`);
  console.log(`recordAsString=> ${recordAsString}`);
  const replaceChnlValRecord = replaceAll(
    recordAsString,
    channelVal,
    securedChnlVal,
  );
  console.log(`replaceChnlValRecord=> ${replaceChnlValRecord}`);
  recordLocal = JSON.parse(replaceChnlValRecord);
  recordLocal.action = action;
  recordLocal.otpCampaignId = otpCampaignId;
  recordLocal.channel = channel;
  recordLocal.transactionId = transactionId;

  var params = {
    Message: JSON.stringify(recordLocal),
    TopicArn: AppConfig.SNS_JOTP_RECEIVED_REQUEST,
  };

  let publishTextPromise = await sns.publish(params);
  console.log('jOtp_otp_req_rcvd ===>', publishTextPromise);

  return;
};

// function replaceAll(string, search, replace) {
//   return string.split(search).join(replace);
// }

export const jOtp_lock_unlock_history = async (
  recordLocal,
  // ,
  // channelVal,
  // securedChnlVal,
  // action,
  // otpCampaignId
) => {
  // let recordLocal = { ...record };
  // if (recordLocal.internalChnlVal == null) {
  //   let encryptedChnlVal = await encrypt(channelVal);
  //   console.log(`encryptedChnlVal ===> ${encryptedChnlVal.hash}`);
  //   recordLocal._internalChnlVal = encryptedChnlVal.hash;
  // } else {
  //   recordLocal._internalChnlVal = recordLocal.internalChnlVal;
  // }

  // let recordAsString = JSON.stringify(recordLocal);
  // console.log(`jOtp_lock_unlock_history....1 ${channelVal}`);
  // console.log(`securedChnlVal....1 ${securedChnlVal}`);
  // console.log(`recordAsString=> ${recordAsString}`);
  // const replaceChnlValRecord = replaceAll(
  //   recordAsString,
  //   channelVal,
  //   securedChnlVal
  // );
  // console.log(`replaceChnlValRecord=> ${replaceChnlValRecord}`);
  // recordLocal = JSON.parse(replaceChnlValRecord);
  // recordLocal._action = action;
  // recordLocal._otpCampaignId = otpCampaignId;

  var params = {
    Message: JSON.stringify(recordLocal),
    TopicArn: AppConfig.SNS_JOTP_LOCK_UNLOCK_HISTORY,
  };
  console.log(
    'publishTextPromise SNS_JOTP_LOCK_UNLOCK_HISTORY  params ===>',
    params,
  );

  let publishTextPromise = await sns.publish(params);
  console.log(
    'publishTextPromise SNS_JOTP_LOCK_UNLOCK_HISTORY ===>',
    publishTextPromise,
  );

  return;
};

export const jOtp_store_journey = async (screenRoleMappings) => {
  var params = {
    Message: JSON.stringify(screenRoleMappings),
    TopicArn: AppConfig.SNS_JOTP_JOURNEY,
  };
  console.log('publishTextPromise SNS_JOTP_JOURNEY  params ===>', params);

  let publishTextPromise = await sns.publish(params);
  console.log('publishTextPromise SNS_JOTP_JOURNEY ===>', publishTextPromise);

  return;
};


export const snsCaller = async (recordLocal, snsName) => {
  log.debug(`SNS Name====>${snsName}`);
  var params = {
    Message: JSON.stringify(recordLocal),
    TopicArn: AppConfig[snsName],
  };
  log.debug(`SNS Param====>${JSON.stringify(params)}`);

  let publishTextPromise = await sns.publish(params);
  log.debug(`SNS Response====>${JSON.stringify(publishTextPromise)}`);
  return;
};
