import { Body, Controller, Get, Put, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/strategy/jwt.strategy';
import { PlatformsDto, UserLocationDto, UsernameDto } from './dto/user.dto';
import { IRequestWithProfile } from './interfaces/controller.interface';
import { User } from './schemas/user.schema';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getProfile(@Req() req: IRequestWithProfile): User {
    return req.user.toObject();
  }

  @UseGuards(JwtAuthGuard)
  @Put('location')
  async addLocation(
    @Req() req: IRequestWithProfile,
    @Body() location: UserLocationDto,
  ) {
    return await this.userService.addLocation(req.user, location);
  }

  @UseGuards(JwtAuthGuard)
  @Put('username')
  async updateUsername(
    @Req() req: IRequestWithProfile,
    @Body() usernameDto: UsernameDto,
  ) {
    return await this.userService.updateUsername(req.user, usernameDto);
  }

  @UseGuards(JwtAuthGuard)
  @Put('platforms')
  async updatePlatforms(
    @Req() req: IRequestWithProfile,
    @Body() platformsDto: PlatformsDto,
  ) {
    return await this.userService.updatePlatforms(req.user, platformsDto);
  }
}
