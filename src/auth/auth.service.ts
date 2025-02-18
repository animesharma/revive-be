import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../user/schemas/user.schema';
import { IApiGoogleLoginResponse, JwtContent } from './interfaces/types';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // async loginPhone(phone: string, password: string) {}

  async signUpUser(user: User): Promise<UserDocument> {
    user.username = `user${new Date().getTime()}`;
    user.isNewUser = true;
    const userObj = await this.userModel.create(user);
    return userObj;
  }

  async loginGoogle(email: string): Promise<IApiGoogleLoginResponse> {
    let user: UserDocument = await this.userModel.findOne({ email }).exec();
    if (!user) {
      user = await this.signUpUser({ email });
    }
    const access_token = await this.generateAccessToken(user._id);
    const refresh_token = await this.generateAccessToken(user._id, true);
    const userResp: IApiGoogleLoginResponse = {
      ...user.toObject(),
      access_token,
      refresh_token,
    };
    return userResp;
  }

  async generateAccessToken(_id: string, is_refresh = false): Promise<string> {
    const payload: JwtContent = { user_id: _id };
    const expiresIn = is_refresh
      ? this.configService.get('REFRESH_TOKEN_DURATION')
      : this.configService.get('ACCESS_TOKEN_DURATION');
    return await this.jwtService.signAsync(payload, { expiresIn });
  }

  async refreshAuthToken(_id: string) {
    return {
      auth_token: await this.generateAccessToken(_id),
      refresh_token: await this.generateAccessToken(_id, true),
    };
  }
}
