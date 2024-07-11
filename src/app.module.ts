import { Module } from '@nestjs/common';
import { ImportModule } from './apiCollectionMgmt/import.module';

@Module({
  imports: [ImportModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
