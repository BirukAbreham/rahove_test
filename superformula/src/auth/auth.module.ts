import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { DbModule } from 'src/db/db.module';
import { AuthController } from './controller/auth.controller';
import { UserRepository } from './repository/user.repository';
import { AuthService } from './service/auth.service';
import { JwtRefreshStrategy } from './strategy/jwt-refresh.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [DbModule, JwtModule.register({})],
  controllers: [AuthController],
  providers: [UserRepository, AuthService, JwtStrategy, JwtRefreshStrategy],
  exports: [],
})
export class AuthModule {}
