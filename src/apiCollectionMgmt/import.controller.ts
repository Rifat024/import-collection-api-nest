import { Body, Controller, Get, Headers, Post, Query, Req, Res } from '@nestjs/common';
import { ImportService } from './import.service';
import { log } from '../commons/utils/logger';
import { authenticator } from '../middlewares';



@Controller('/collection-mgmt')
export class ImportController {
    constructor(private readonly importService: ImportService) { }

    @Post('/api-collection/import')
    async importCollection(
        @Body()
        requestBody: any,
        @Res() response: any,
        @Headers() headers: any,
    ) {
        let requestToken = await authenticator(headers);
        console.log(`requestToken===>${requestToken}`);
        // requestBody=await authenticator();
        requestBody.requestToken = { ...requestToken };
        log.debug(`requestBody===>${requestBody}`);
        const result = await this.importService.importCollection(requestBody);
        return response.status(200).json(result);
    }
}
