import { Module } from '@nestjs/common';
import { ImportService } from './import.service';
import { ImportController } from './import.controller';


@Module({
  imports: [],
  controllers: [ImportController],
  providers: [ImportService],
})
export class ImportModule {}
