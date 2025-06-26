import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './users.schema';
import { Model } from 'mongoose';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>, // ✅ needs model provided
  ) { }

  async findUserByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }
  async findUserById(id: string) {
    return this.userModel.findById(id).exec();
  }
  async createUser(userData: Partial<User>): Promise<UserDocument> {
    const createdUser = new this.userModel(userData);
    return await createdUser.save();
  }
  async findUserByMobile(mobile: number) {
    return this.userModel.findOne({ mobile }).exec();
  }
}
