import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { MongooseModule } from '@nestjs/mongoose';
import logger from './common/utils/logger';
import config from './config/config';

@Module({
  imports: [
    MongooseModule.forRoot(config.mongodbUrl),
    AuthModule,

  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Add logging middleware
    consumer
      .apply((req, res, next) => {
        logger.debug(`[AppModule] Route requested: ${req.method} ${req.url}`);
        next();
      })
      .forRoutes('*');
  }
}


