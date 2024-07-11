import { Injectable, Param } from '@nestjs/common';
import { log } from '../commons/utils/logger';
import { v4 as uuidv4 } from "uuid";
import { AppConfig } from '../utils/environment/appconfig';
import { findItemCategoryNodes, findNode } from '../apiTestCore';
import { currentDateTime, expiryDate } from '../commons/constants';
import { addRecord, getRecord, updateRecord } from '../commons/utils/dbMgmt';
import * as moment from 'moment';
import apiCollection from '../models/apiCollection';
import apiRequest from '../models/apiRequest';
import { connectMongoDB } from '../commons/mongoDB/dbConnector';
import apiExample from '../models/apiExample';



@Injectable()
export class ImportService {

    private readonly DBT_APITOOL_COLLECTIONS: string;
    private readonly DBT_APITOOL_REQUESTS: string;
    private readonly DBT_APITOOL_REQUESTS_EXAMPLE: string;
    private readonly MONGO_URL: string;

    constructor() {
        this.DBT_APITOOL_COLLECTIONS = `${process.env.APP_PREFIX}-${process.env.env}-${process.env.DBT_APITOOL_COLLECTIONS}`;
        this.DBT_APITOOL_REQUESTS = `${process.env.APP_PREFIX}-${process.env.env}-${process.env.DBT_APITOOL_REQUESTS}`;
        this.DBT_APITOOL_REQUESTS_EXAMPLE = `${process.env.APP_PREFIX}-${process.env.env}-${process.env.DBT_APITOOL_REQUESTS_EXAMPLE}`;

        this.MONGO_URL = process.env.MONGO_DB;
        console.log(`url: ${JSON.stringify(this.MONGO_URL)}`);

        console.log('collection:', this.DBT_APITOOL_COLLECTIONS);
        console.log('request:', this.DBT_APITOOL_REQUESTS);
        console.log('example:', this.DBT_APITOOL_REQUESTS_EXAMPLE);
    }

    async importCollection(recordObj: any): Promise<any> {
        try {
            recordObj.companyId = recordObj?.requestToken?.companyId;
            recordObj.userId = recordObj?.requestToken?.userId;
            let collectionObj: any = {
                companyId: recordObj?.companyId,
                children: [
                ],
                isFavorite: false,
                itemCatagory: AppConfig.ITEM_CATEGORY.COLLECTION,
                itemName: recordObj?.itemName ?? "New Collection",
                userId: recordObj.userId,
                workspaceId: recordObj?.workspaceId,
                itemId: uuidv4(),
                expiryDate: expiryDate()
            }
            recordObj.itemId = collectionObj?.itemId;
            recordObj.collectionId = collectionObj?.itemId;
            recordObj.workspaceId = collectionObj?.workspaceId;
            // log.debug(`getApiCollection Response with new ParentId -> ${JSON.stringify(recordObj)}`);
            let folderData = findItemCategoryNodes(AppConfig.ITEM_CATEGORY.FOLDER, recordObj);
            // log.debug(`folderData From Collection -> ${JSON.stringify(folderData.length)}`);
            let requestData = findItemCategoryNodes(AppConfig.ITEM_CATEGORY.REQUEST, recordObj);
            // log.debug(`requestData From Collection -> ${JSON.stringify(requestData.length)}`);
            let exampleData = findItemCategoryNodes(AppConfig.ITEM_CATEGORY.EXAMPLE, recordObj);
            // log.debug(`exampleData From Collection -> ${JSON.stringify(exampleData.length)}`);

            log.debug(`Folder Total length-->${folderData.length}`);
            if (folderData.length !== 0) {
                for (const folder of folderData) {
                    // let folderObj = {
                    //     itemId: folder.itemId,
                    //     parentId: folder?.parentId,
                    //     itemName: folder?.itemName,
                    //     workspaceId: recordObj?.workspaceId,
                    //     collectionId: recordObj?.collectionId,
                    //     companyId: recordObj.companyId
                    // };
                    // log.debug(`addApiFolder Request -> ${JSON.stringify(folderObj)}`);
                    let rootItem = collectionObj;
                    let found = findNode(folder.parentId, rootItem);
                    // log.debug(`Find Node Response -> ${JSON.stringify(found)}`);
                    if (found) {
                        let new_item = {
                            itemId: folder?.itemId,
                            expiryDate: expiryDate(),
                            lastUpdatedDate: currentDateTime(),
                            itemCatagory: AppConfig.ITEM_CATEGORY.FOLDER,
                            itemName: folder.itemName,
                            children: []
                        };
                        found.children.push(new_item);
                    }
                }
            }
            log.debug(`Request Total length-->${requestData.length}`);
            if (requestData.length !== 0) {
                for (const request of requestData) {
                    // let requestObj = {
                    //     itemId: request.itemId,
                    //     parentId: request?.parentId,
                    //     itemName: request?.itemName,
                    //     workspaceId: recordObj?.workspaceId,
                    //     collectionId: recordObj?.collectionId,
                    //     companyId: recordObj.companyId
                    // };
                    // log.debug(`addApiFolder Request -> ${JSON.stringify(requestObj)}`);
                    let rootItem = collectionObj;
                    let found = findNode(request.parentId, rootItem);
                    // log.debug(`Find Node Response -> ${JSON.stringify(found)}`);
                    if (found) {
                        let new_item = {
                            itemId: request?.itemId,
                            expiryDate: expiryDate(),
                            lastUpdatedDate: currentDateTime(),
                            itemCatagory: AppConfig.ITEM_CATEGORY.REQUEST,
                            reqMethod: request?.requestData?.reqMethod ?? 'GET',
                            itemName: request.itemName,
                            children: []
                        };
                        found.children.push(new_item);
                    }
                }
                let requestResponse = await this.addBatchApiRequestCore(requestData, collectionObj);
                log.debug(`Batch Write Response -> ${JSON.stringify(requestResponse)}`);
            }

            log.debug(`Example Total length-->${exampleData.length}`);
            if (exampleData.length !== 0) {
                for (const example of exampleData) {
                    let exampleObj = {
                        itemId: example.itemId,
                        parentId: example?.parentId,
                        itemName: example?.itemName,
                        workspaceId: recordObj?.workspaceId,
                        collectionId: recordObj?.collectionId,
                        companyId: recordObj.companyId
                    };
                    log.debug(`addApiFolder Request -> ${JSON.stringify(exampleObj)}`);
                    let rootItem = collectionObj;
                    let found = findNode(example.parentId, rootItem);
                    log.debug(`Find Node Response -> ${JSON.stringify(found)}`);
                    if (found) {
                        let new_item = {
                            itemId: exampleObj?.itemId,
                            expiryDate: expiryDate(),
                            lastUpdatedDate: currentDateTime(),
                            itemCatagory: AppConfig.ITEM_CATEGORY.EXAMPLE,
                            itemName: exampleObj.itemName,
                            children: []
                        };
                        found.children.push(new_item);
                    }
                }
                let exampleResponse = await this.addBatchApiExampleCore(exampleData, collectionObj);
                log.debug(`Batch Write Response -> ${JSON.stringify(exampleResponse)}`);
            }
            log.debug(`collectionObj -> ${JSON.stringify(collectionObj)}`);
            let addResponse = await apiCollection.insertMany(collectionObj);
            log.debug(`addApiCollection Response -> ${JSON.stringify(addResponse)}`);
            const params = {
                $and: [
                    { itemId: collectionObj?.itemId }
                ]
            }
            let getResponse = await apiCollection.findOne(params);
            log.debug(`Final Collection Response -> ${JSON.stringify(getResponse)}`);
            // let addCollection = await this.addCollectionCore(collectionObj);
            // log.debug(`addApiCollection Response -> ${JSON.stringify(addCollection)}`);
            // if (addCollection.type === AppConfig.API_RESPONSE.FAILED) {
            //     return addCollection.payload;
            // }
            // let finalResponse = await this.getCollectionCore(collectionObj);
            // log.debug(`Final Collection Response -> ${JSON.stringify(finalResponse)}`);
            // if (finalResponse.type === AppConfig.API_RESPONSE.FAILED) {
            //     return finalResponse.payload;
            // }
            return getResponse;
            // return requestResponse;
        } catch (error) {
            log.debug(`import Error -> ${JSON.stringify(error)}`);
            return error;
        }
    }

    async addCollectionCore(recordObj: any): Promise<any> {
        let required = ["companyId", "workspaceId"];
        try {
            let addResponse = await addRecord(
                recordObj,
                required,
                this.DBT_APITOOL_COLLECTIONS
            );
            return {
                type: AppConfig.API_RESPONSE.SUCCESS,
                payload: addResponse
            };
        } catch (error) {
            log.debug(`addApiCollection Error -> ${JSON.stringify(error)}`);
            return {
                type: AppConfig.API_RESPONSE.FAILED,
                payload: error
            }
        }
    };

    async getCollectionCore(recordObj: any): Promise<any> {
        try {
            let requiredFields = ["companyId", "itemId"];
            const params = {
                TableName: this.DBT_APITOOL_COLLECTIONS,
                IndexName: 'LSI_itemId',
                KeyConditionExpression: "companyId = :companyId and itemId = :itemId",
                FilterExpression: "expiryDate = :expiryDate",
                ExpressionAttributeValues: {
                    ':itemId': recordObj.itemId,
                    ':expiryDate': expiryDate(),
                    ':companyId': recordObj.companyId
                }

            };
            let response: any = await getRecord(recordObj, requiredFields, params);
            log.debug(`getApiCollection Response -> ${JSON.stringify(response)}`);
            return {
                type: AppConfig.API_RESPONSE.SUCCESS,
                payload: response?.body?.Items[0] ?? {}
            };
        } catch (error) {
            log.debug(`getApiCollection Error -> ${JSON.stringify(error)}`);
            return {
                type: AppConfig.API_RESPONSE.FAILED,
                payload: error
            }
        }
    };

    async addFolderCore(recordObj: any) {
        try {
            let collectionObj = {
                companyId: recordObj.companyId,
                itemId: recordObj.collectionId
            }

            let getResponse = await this.getCollectionCore(collectionObj);
            log.debug(`getApiCollection Response -> ${JSON.stringify(getResponse)}`);
            if (getResponse?.type === AppConfig.API_RESPONSE.FAILED) {
                return getResponse.payload;
            }
            let rootItem = getResponse?.payload;
            let found = findNode(recordObj.parentId, rootItem);
            log.debug(`Find Node Response -> ${JSON.stringify(found)}`);
            if (found) {
                let new_item = {
                    itemId: recordObj?.itemId,
                    expiryDate: expiryDate(),
                    lastUpdatedDate: currentDateTime(),
                    itemCatagory: AppConfig.ITEM_CATEGORY.FOLDER,
                    itemName: recordObj.itemName,
                    children: []
                };

                found.children.push(new_item);
                log.debug(`Folder Request -> ${JSON.stringify(found)}`);
                let updateResponse = await this.updateFolder(recordObj.companyId, getResponse?.payload?.creationDate, rootItem);
                log.debug(`Folder Create Response -> ${JSON.stringify(updateResponse)}`);
                return {
                    type: AppConfig.API_RESPONSE.SUCCESS,
                    payload: updateResponse.payload?.body?.Attributes
                };
            } else {
                return {
                    type: AppConfig.API_RESPONSE.FAILED,
                    payload: { message: 'Root items not found' }
                }
            }
        } catch (error) {
            log.debug(`createApiFolder Error -> ${JSON.stringify(error)}`);
            return {
                type: AppConfig.API_RESPONSE.FAILED,
                payload: error
            }
        }
    }

    async updateFolder(companyId: any, creationDate: any, recordObj: any) {
        try {
            const requiredFields = ["companyId", "creationDate"];
            const pkFieldNm = "companyId";
            const skFieldNm = "creationDate";

            let keyObj = {
                companyId: companyId,
                creationDate: creationDate,
            };

            let response = await updateRecord(
                recordObj,
                requiredFields,
                pkFieldNm,
                skFieldNm,
                this.DBT_APITOOL_COLLECTIONS,
                keyObj
            );
            console.log(response, "updateResponse")
            return {
                type: AppConfig.API_RESPONSE.SUCCESS,
                payload: response
            };
        } catch (error) {
            log.debug(`addApiCollection Error -> ${JSON.stringify(error)}`);
            return {
                type: AppConfig.API_RESPONSE.FAILED,
                payload: error
            }
        }
    }

    async importFolderRequestAndExample(recordObj: any) {
        try {
            log.debug(`sns Request Body -> ${JSON.stringify(recordObj)}`);
            if (recordObj.itemCategory === AppConfig.ITEM_CATEGORY.FOLDER) {
                for (const folder of recordObj.payload) {
                    let folderObj = {
                        itemId: folder.itemId,
                        parentId: folder?.parentId,
                        itemName: folder?.itemName,
                        workspaceId: recordObj?.workspaceId,
                        collectionId: recordObj?.collectionId,
                        companyId: recordObj.companyId
                    };
                    log.debug(`addApiFolder Request -> ${JSON.stringify(folderObj)}`);
                    let folderResponse = await this.addFolderCore(folderObj);
                    log.debug(`addApiFolder Response -> ${JSON.stringify(folderResponse)}`);
                }
            }
            if (recordObj.itemCategory === AppConfig.ITEM_CATEGORY.REQUEST) {
                for (const request of recordObj.payload) {
                    let requestObj = {
                        itemId: request.itemId,
                        parentId: request?.parentId,
                        itemName: request?.itemName,
                        workspaceId: recordObj?.workspaceId,
                        collectionId: recordObj?.collectionId,
                        reqApiUrl: request?.reqApiUrl,
                        requestData: request?.requestData,
                        departmentId: request?.departmentId ?? 'NULL',
                        companyId: recordObj.companyId
                    };
                    log.debug(`addApiRequest Body -> ${JSON.stringify(requestObj)}`);
                    let requestResponse = await this.addApiRequestCore(requestObj);
                    log.debug(`addApiRequest Response -> ${JSON.stringify(requestResponse)}`);
                }
            }
            if (recordObj.itemCategory === AppConfig.ITEM_CATEGORY.EXAMPLE) {
                for (const example of recordObj.payload) {
                    let exampleObj = {
                        itemId: example.itemId,
                        parentId: example?.parentId,
                        itemName: example?.itemName,
                        workspaceId: recordObj?.workspaceId,
                        collectionId: recordObj?.collectionId,
                        reqApiUrl: example?.reqApiUrl,
                        requestData: example?.requestData,
                        departmentId: example?.departmentId ?? 'NULL',
                        responseData: example?.responseData ?? {},
                        companyId: recordObj.companyId
                    };
                    let exampleResponse = await this.addApiExampleCore(exampleObj);
                    log.debug(`addApiExample Response -> ${JSON.stringify(exampleResponse)}`);
                }
            }
            let collectionObj: any = {
                companyId: recordObj.companyId,
                itemId: recordObj.collectionId
            }

            let getCollection = await this.getCollectionCore(collectionObj);
            log.debug(`getApiCollection Response -> ${JSON.stringify(getCollection)}`);
            if (recordObj.allDone) {
                if (recordObj.itemCategory === AppConfig.ITEM_CATEGORY.REQUEST || recordObj.itemCategory === AppConfig.ITEM_CATEGORY.EXAMPLE) {
                    collectionObj.creationDate = getCollection?.payload?.creationDate;
                    log.debug(`update collection Request body -> ${JSON.stringify(collectionObj)}`);
                    let updateResponse = await this.updateCollectionCore(collectionObj);
                    log.debug(`updateApiCollection Response -> ${JSON.stringify(updateResponse)}`);
                }
            }
            return {
                type: AppConfig.API_RESPONSE.SUCCESS,
                payload: getCollection.payload,
            }
        } catch (error) {
            log.debug(`importApiCollection Error -> ${JSON.stringify(error)}`);
            return {
                type: AppConfig.API_RESPONSE.FAILED,
                payload: error
            };
        }
    };

    async updateCollectionCore(recordObj: any) {
        try {
            let requiredFields = ["companyId", "creationDate"];
            const pkFieldNm = "companyId";
            const skFieldNm = "creationDate";
            let keyObj = {
                companyId: recordObj.companyId,
                creationDate: recordObj.creationDate,
            };
            log.debug(`updateCollection keyObj -> ${JSON.stringify(keyObj)}`);
            let updateResponse = await updateRecord(
                recordObj,
                requiredFields,
                pkFieldNm,
                skFieldNm,
                this.DBT_APITOOL_COLLECTIONS,
                keyObj
            );
            log.debug(`updateCollection Response -> ${JSON.stringify(updateResponse)}`);
            return {
                type: AppConfig.API_RESPONSE.SUCCESS,
                payload: updateResponse
            }
        } catch (error) {
            log.debug(`updateCollection Error Response -> ${JSON.stringify(error)}`);
            return {
                type: AppConfig.API_RESPONSE.FAILED,
                payload: error
            }
        }

    };

    async addApiExampleCore(recordObj: any) {
        try {
            let collectionObj = {
                companyId: recordObj.companyId,
                itemId: recordObj?.collectionId
            }
            let new_item: any = {};
            let getResponse = await this.getCollectionCore(collectionObj);
            log.debug(`getApiCollection Response -> ${JSON.stringify(getResponse)}`);
            if (getResponse?.type === AppConfig.API_RESPONSE.FAILED) {
                return getResponse.payload;
            }
            let rootItem = getResponse?.payload;
            let found = findNode(recordObj.parentId, rootItem);
            log.debug(`Find Node Response -> ${JSON.stringify(found)}`);
            if (found) {
                new_item.itemId = recordObj?.itemId;
                new_item.expiryDate = expiryDate();
                new_item.lastUpdatedDate = currentDateTime();
                new_item.itemCatagory = AppConfig.ITEM_CATEGORY.EXAMPLE;
                new_item.itemName = found.itemName;
                new_item.children = [];
                found.children.push(new_item);
                log.debug(`Folder Request -> ${JSON.stringify(found)}`);
                let updateResponse = await this.updateFolder(recordObj.companyId, getResponse?.payload?.creationDate, rootItem);
                log.debug(`Folder Create Response -> ${JSON.stringify(updateResponse)}`);
                if (updateResponse.type === AppConfig.API_RESPONSE.FAILED) {
                    return updateResponse.payload;
                }
                delete new_item.children;
                let createObj = {
                    companyId: recordObj.companyId,
                    collectionId: recordObj.collectionId,
                    parentId: recordObj?.parentId,
                    workspaceId: recordObj?.workspaceId,
                    ...new_item,
                    reqApiUrl: recordObj?.reqApiUrl,
                    requestData: {
                        ...recordObj?.requestData,
                        reqApiUrl: recordObj?.reqApiUrl
                    }
                };
                log.debug(`Request Create Body -> ${JSON.stringify(createObj)}`);
                let creatResponse = await this.addExampleCore(createObj);
                log.debug(`Request Create Response -> ${JSON.stringify(creatResponse)}`);
                if (creatResponse.type === AppConfig.API_RESPONSE.FAILED) {
                    return creatResponse.payload;
                }
                return creatResponse;
            } else {
                return {
                    type: AppConfig.API_RESPONSE.FAILED,
                    payload: { message: 'Root items not found' }
                }
            }
        } catch (error) {
            log.debug(`createApiRequest Error -> ${JSON.stringify(error)}`);
            return {
                type: AppConfig.API_RESPONSE.FAILED,
                payload: error
            }
        }
    };

    async addExampleCore(recordObj: any) {
        try {
            log.debug(`addApiRequest Request -> ${JSON.stringify(recordObj)}`);
            let getRequest = await this.getExampleCore({ companyId: recordObj.companyId, itemId: recordObj.parentId });
            log.debug(`addApiRequest Request -> ${JSON.stringify(getRequest)}`);
            recordObj.requestData = getRequest?.payload?.requestData;
            let requiredFields = ['companyId', 'itemId']
            let addResponse: any = await addRecord(
                recordObj,
                requiredFields,
                this.DBT_APITOOL_REQUESTS_EXAMPLE
            );
            log.debug(`addApiRequest Response -> ${JSON.stringify(addResponse)}`);
            if (addResponse.statusCode == '200') {
                let getResponse = await this.getExampleCore(recordObj);
                log.debug(`getRequest Response -> ${JSON.stringify(getResponse)}`);
                return getResponse;
            } else {
                return {
                    type: AppConfig.API_RESPONSE.FAILED,
                    payload: addResponse
                }
            }
        } catch (error) {
            log.debug(`addApiRequest Error -> ${JSON.stringify(error)}`);
            return {
                type: AppConfig.API_RESPONSE.FAILED,
                payload: error
            }
        }
    };

    async getExampleCore(recordObj: any) {
        try {
            let requiredFields = ["companyId", "itemId"];
            const params = {
                TableName: this.DBT_APITOOL_REQUESTS_EXAMPLE,
                IndexName: 'LSI_itemId',
                KeyConditionExpression: "companyId = :companyId and itemId = :itemId",
                FilterExpression: "expiryDate = :expiryDate",
                ExpressionAttributeValues: {
                    ':itemId': recordObj.itemId,
                    ':expiryDate': expiryDate(),
                    ':companyId': recordObj.companyId
                }
            };
            let response: any = await getRecord(recordObj, requiredFields, params);
            log.debug(`getApiRequest Response -> ${JSON.stringify(response)}`);
            return {
                type: AppConfig.API_RESPONSE.SUCCESS,
                payload: response?.body?.Items[0] ?? {}
            };
        } catch (error) {
            log.debug(`getApiRequest Error -> ${JSON.stringify(error)}`);
            return {
                type: AppConfig.API_RESPONSE.FAILED,
                payload: error
            }
        }
    };

    async addApiRequestCore(recordObj: any) {
        try {
            let collectionObj = {
                companyId: recordObj.companyId,
                itemId: recordObj?.collectionId
            }
            let new_item: any = {};
            let getResponse = await this.getCollectionCore(collectionObj);
            log.debug(`getApiCollection Response -> ${JSON.stringify(getResponse)}`);
            if (getResponse?.type === AppConfig.API_RESPONSE.FAILED) {
                return getResponse.payload;
            }
            let rootItem = getResponse?.payload;
            let found = findNode(recordObj.parentId, rootItem);
            log.debug(`Find Node Response -> ${JSON.stringify(found)}`);
            if (found) {
                new_item.itemId = recordObj?.itemId;
                new_item.expiryDate = expiryDate();
                new_item.lastUpdatedDate = currentDateTime();
                new_item.itemCatagory = AppConfig.ITEM_CATEGORY.REQUEST;
                new_item.itemName = recordObj.itemName;
                new_item.reqMethod = recordObj?.requestData?.reqMethod ?? 'GET';
                new_item.children = [];
                found.children.push(new_item);
                log.debug(`Folder Request -> ${JSON.stringify(found)}`);
                let updateResponse = await this.updateFolder(recordObj.companyId, getResponse?.payload?.creationDate, rootItem);
                log.debug(`Folder Create Response -> ${JSON.stringify(updateResponse)}`);
                if (updateResponse.type === AppConfig.API_RESPONSE.FAILED) {
                    return updateResponse.payload;
                }
                delete new_item.children;
                let createObj = {
                    companyId: recordObj.companyId,
                    collectionId: recordObj.collectionId,
                    parentId: recordObj?.parentId,
                    workspaceId: recordObj?.workspaceId,
                    ...new_item,
                    reqApiUrl: recordObj?.reqApiUrl,
                    requestData: {
                        ...recordObj?.requestData,
                        reqApiUrl: recordObj?.reqApiUrl
                    }
                };
                log.debug(`Request Create Body -> ${JSON.stringify(createObj)}`);
                let creatResponse = await this.addRequestCore(createObj);
                log.debug(`Request Create Response -> ${JSON.stringify(creatResponse)}`);
                if (creatResponse.type === AppConfig.API_RESPONSE.FAILED) {
                    return creatResponse.payload;
                }
                return creatResponse;
            } else {
                return {
                    type: AppConfig.API_RESPONSE.FAILED,
                    payload: { message: 'Root items not found' }
                }
            }
        } catch (error) {
            log.debug(`createApiRequest Error -> ${JSON.stringify(error)}`);
            return {
                type: AppConfig.API_RESPONSE.FAILED,
                payload: error
            }
        }
    };

    async addBatchApiRequestCore(recordObj: any, collectionObj: any) {
        try {
            await connectMongoDB(this.MONGO_URL);
            let startIndex = 0;
            let endIndex = 30;
            let isAllPosted = false;
            let batchResponse = [];
            while (!isAllPosted) {
                let addRequests = [];
                const partial = recordObj.slice(startIndex, endIndex);
                log.debug(` and length-->${partial.length}`);
                if (partial.length !== 0) {
                    const sanitizedData = partial.filter((el) => el);
                    log.debug(`Slice sanitize and length-->${sanitizedData.length}`);
                    for (const variable of sanitizedData) {
                        const index = sanitizedData.indexOf(variable);
                        let requestObj = {
                            ...variable,
                            expiryDate: expiryDate(),
                            collectionId: collectionObj?.itemId,
                            workspaceId: collectionObj?.workspaceId,
                            companyId: collectionObj.companyId,
                            userId: collectionObj?.userId
                        };
                        addRequests.push(requestObj);
                    }
                    log.debug(`List Of Request--->${JSON.stringify(addRequests)}`);
                    let requestResponse = await apiRequest.insertMany(addRequests);
                    log.debug(`Batch Request Response--->${JSON.stringify(requestResponse)}`);
                    batchResponse.push(requestResponse);
                    startIndex = endIndex;
                    endIndex += 30;
                } else {
                    isAllPosted = true;
                }
            }
            log.debug(`Batch Response-> ${JSON.stringify(batchResponse)}`);
            let params = {
                $and: [
                    { collectionId: collectionObj?.itemId }
                ]
            }
            let getResponse = await apiRequest.find(params);
            log.debug(`Batch Response-> ${JSON.stringify(getResponse)}`);

            // log.debug(`Batch ResponseLIST-> ${JSON.stringify(response)}`);
            return {
                type: AppConfig.API_RESPONSE.SUCCESS,
                payload: getResponse
            }
        } catch (error) {
            log.debug(`Add Batch Variable Error Response -> ${JSON.stringify(error)}`);
            return {
                type: AppConfig.API_RESPONSE.FAILED,
                payload: error
            }
        }
    };

    async addBatchApiExampleCore(recordObj: any, collectionObj: any) {
        try {
            await connectMongoDB(this.MONGO_URL);
            let startIndex = 0;
            let endIndex = 30;
            let isAllPosted = false;
            let batchResponse = [];
            while (!isAllPosted) {
                let addRequests = [];
                const partial = recordObj.slice(startIndex, endIndex);
                log.debug(` and length-->${partial.length}`);
                if (partial.length !== 0) {
                    const sanitizedData = partial.filter((el) => el);
                    log.debug(`Slice sanitize and length-->${sanitizedData.length}`);
                    for (const variable of sanitizedData) {
                        const index = sanitizedData.indexOf(variable);
                        let requestObj = {
                            ...variable,
                            expiryDate: expiryDate(),
                            collectionId: collectionObj?.itemId,
                            workspaceId: collectionObj?.workspaceId,
                            companyId: collectionObj.companyId,
                            userId: collectionObj?.userId
                        };
                        addRequests.push(requestObj);
                    }
                    log.debug(`List Of Request--->${JSON.stringify(addRequests)}`);
                    let requestResponse = await apiExample.insertMany(addRequests);
                    log.debug(`Batch Request Response--->${JSON.stringify(requestResponse)}`);
                    batchResponse.push(requestResponse);
                    startIndex = endIndex;
                    endIndex += 30;
                } else {
                    isAllPosted = true;
                }
            }
            log.debug(`Batch Response-> ${JSON.stringify(batchResponse)}`);
            let params = {
                $and: [
                    { collectionId: collectionObj?.itemId }
                ]
            }
            let getResponse = await apiExample.find(params);
            log.debug(`Batch Response-> ${JSON.stringify(getResponse)}`);

            // log.debug(`Batch ResponseLIST-> ${JSON.stringify(response)}`);
            return {
                type: AppConfig.API_RESPONSE.SUCCESS,
                payload: getResponse
            }
        } catch (error) {
            log.debug(`Add Batch Variable Error Response -> ${JSON.stringify(error)}`);
            return {
                type: AppConfig.API_RESPONSE.FAILED,
                payload: error
            }
        }
    };


    async addRequestCore(recordObj: any, isRequest = true) {
        try {
            log.debug(`addApiRequest Request -> ${JSON.stringify(recordObj)}`);
            let requiredFields = ['companyId', 'itemId']
            let addResponse: any = await addRecord(
                recordObj,
                requiredFields,
                isRequest ? this.DBT_APITOOL_REQUESTS : this.DBT_APITOOL_REQUESTS_EXAMPLE
            );
            log.debug(`addApiRequest Response -> ${JSON.stringify(addResponse)}`);
            if (addResponse.statusCode == '200') {
                let getResponse = await this.getRequestCore(recordObj);
                log.debug(`getRequest Response -> ${JSON.stringify(getResponse)}`);
                return getResponse;
            } else {
                return {
                    type: AppConfig.API_RESPONSE.FAILED,
                    payload: addResponse
                }
            }
        } catch (error) {
            log.debug(`addApiRequest Error -> ${JSON.stringify(error)}`);
            return {
                type: AppConfig.API_RESPONSE.FAILED,
                payload: error
            }
        }
    };


    async getRequestCore(recordObj: any) {
        try {
            let requiredFields = ["companyId", "itemId"];
            const params = {
                TableName: this.DBT_APITOOL_REQUESTS,
                IndexName: 'LSI_itemId',
                KeyConditionExpression: "companyId = :companyId and itemId = :itemId",
                FilterExpression: "expiryDate = :expiryDate",
                ExpressionAttributeValues: {
                    ':itemId': recordObj.itemId,
                    ':expiryDate': expiryDate(),
                    ':companyId': recordObj.companyId
                }
            };
            let response: any = await getRecord(recordObj, requiredFields, params);
            log.debug(`getApiRequest Response -> ${JSON.stringify(response)}`);
            response
            return {
                type: AppConfig.API_RESPONSE.SUCCESS,
                payload: response?.body?.Items[0] ?? {}
            };
        } catch (error) {
            log.debug(`getApiRequest Error -> ${JSON.stringify(error)}`);
            return {
                type: AppConfig.API_RESPONSE.FAILED,
                payload: error
            }
        }
    };

    async getRequestByCollectionCore(recordObj: any) {
        try {
            let requiredFields = ["companyId", "collectionId"];
            const params = {
                TableName: this.DBT_APITOOL_REQUESTS,
                IndexName: 'LSI_collectionId',
                KeyConditionExpression: "companyId = :companyId and collectionId = :collectionId",
                FilterExpression: "expiryDate = :expiryDate",
                ExpressionAttributeValues: {
                    ':collectionId': recordObj.itemId,
                    ':expiryDate': expiryDate(),
                    ':companyId': recordObj.companyId
                }
            };
            let response: any = await getRecord(recordObj, requiredFields, params);
            log.debug(`getApiRequest Response -> ${JSON.stringify(response)}`);
            return {
                type: AppConfig.API_RESPONSE.SUCCESS,
                payload: response?.body?.Items ?? {}
            };
        } catch (error) {
            log.debug(`getApiRequest Error -> ${JSON.stringify(error)}`);
            return {
                type: AppConfig.API_RESPONSE.FAILED,
                payload: error
            }
        }
    };

    async getExampleByCollectionCore(recordObj: any) {
        try {
            let requiredFields = ["companyId", "collectionId"];
            const params = {
                TableName: this.DBT_APITOOL_REQUESTS_EXAMPLE,
                IndexName: 'LSI_collectionId',
                KeyConditionExpression: "companyId = :companyId and collectionId = :collectionId",
                FilterExpression: "expiryDate = :expiryDate",
                ExpressionAttributeValues: {
                    ':collectionId': recordObj.itemId,
                    ':expiryDate': expiryDate(),
                    ':companyId': recordObj.companyId
                }
            };
            let response: any = await getRecord(recordObj, requiredFields, params);
            log.debug(`getApiRequest Response -> ${JSON.stringify(response)}`);
            return {
                type: AppConfig.API_RESPONSE.SUCCESS,
                payload: response?.body?.Items ?? {}
            };
        } catch (error) {
            log.debug(`getApiRequest Error -> ${JSON.stringify(error)}`);
            return {
                type: AppConfig.API_RESPONSE.FAILED,
                payload: error
            }
        }
    };

    async getListOfCurrentDates(maxIterations: number): Promise<string[]> {
        const timeArray = [];

        for (let counter = 0; counter < maxIterations; counter++) {
            const currentTime = moment().milliseconds(counter).format('YYYY-MM-DDTHH:mm:ss:SSS');
            console.log(currentTime, 'currentDate');
            timeArray.push(currentTime);
        }

        console.dir(timeArray, { maxArrayLength: null });
        return timeArray;
    }

}
