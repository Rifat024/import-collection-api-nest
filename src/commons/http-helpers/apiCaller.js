import axois from "axios";
import { replaceAll } from "../utils/commonUtils";
import * as AWS from "aws-sdk";
import { apiResponse, apiError } from "../../commons/http-helpers/api-response";
import * as util from 'util'; // has no default export


export const post = async (headers, body, apiUrl) => {
  let response1 = {};

  try {
    console.log(`response from apiCaller2222222222222222 ${apiUrl}`);
    console.log(`response from headers23 ${util.inspect(headers)}`);
    console.log(`response from body ${JSON.stringify(body)}`);
    const responseFromAxois = await axois.post(apiUrl, body, {
      headers: headers,
    });

    console.log(
      `responseFromAxois ||||||||--------------=> ${JSON.stringify(
        responseFromAxois.data
      )}`
    );

    return responseFromAxois.data;
  } catch (error) {
    console.log("apiCaller Error ==>", error);
    let response1 = { body: error, statusCode: "500" };

    return apiError(500, response1);
  }
};

export const postWithFullResponse = async (headers, body, apiUrl) => {
  console.log('postWithFullResponse invoked ==>', apiUrl);

  try {
    let responseFromAxois = await axois.post(apiUrl, body, {headers: headers});
    console.log ('postWithFullResponse result ==>', responseFromAxois.data);
    
    return apiResponse(responseFromAxois.data);

  } catch (error) {
    console.log("postWithFullResponse Error ==>", error);
    let response = { body: error, statusCode: "500" };

    return apiError(500, response);
  }
};

export const getWithFullResponse = async(url, headers) => {
  console.log('getWithFullResponse invoked ==>', url);

  try {
    let responseFromAxois = await axois.get(url, {headers: headers});
    console.log ('getWithFullResponse result ==>', responseFromAxois.data);
    
    return apiResponse(responseFromAxois.data);

  } catch (error) {
    console.log("getWithFullResponse Error ==>", error);
    let response = { body: error, statusCode: "500" };

    return apiError(500, response);
  }
}

export const putWithFullResponse = async (headers, body, apiUrl) => {
  console.log('putWithFullResponse invoked ==>', apiUrl);

  try {
    let responseFromAxois = await axois.put(apiUrl, body, {headers: headers});
    console.log ('putWithFullResponse result ==>', responseFromAxois.data);
    
    return apiResponse(responseFromAxois.data);

  } catch (error) {
    console.log("putWithFullResponse Error ==>", error);
    let response = { body: error, statusCode: "500" };

    return apiError(500, response);
  }
};

export const deleteWithFullResponse = async(url, headers) => {
  console.log('deleteWithFullResponse invoked ==>', url);

  try {
    let responseFromAxois = await axois.delete(url, {headers: headers});
    console.log ('deleteWithFullResponse result ==>', responseFromAxois.data);
    
    return apiResponse(responseFromAxois.data);

  } catch (error) {
    console.log("deleteWithFullResponse Error ==>", error);
    let response = { body: error, statusCode: "500" };

    return apiError(500, response);
  }
}



export const storeToS3 =async (responseFromAxois)=> {

  const s3 = new AWS.S3({ apiVersion: "2006-03-01" });
    const bucketname = "jotpbkt";
    let blob = new Blob([responseFromAxois], {type: 'text/plain'});

    let filename = "abc.txt";
    var params = {
      Bucket: bucketname,
      Key: filename,
      Body: blob,
    };

    const s3Response = await s3.putObject(params).promise();

    //console.log(  `responseFromAxois only ||||||||---bbbbb-----------=> ${responseFromAxois.toString()}`);
    console.log(
      `responseFromAxois only ||||||||---s3Response-----------=> ${s3Response}`
    );

}