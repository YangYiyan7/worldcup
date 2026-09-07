import { Provide } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/typeorm';
import { User } from '../entity/User';
import { Repository } from 'typeorm';
import { CreateUserDTO, UpdateUserDTO } from '../dto/UserDTO';

@Provide()
export class UserService {
  @InjectEntityModel(User)
  userModel: Repository<User>;

  async findAll(): Promise<User[]> {
    return await this.userModel.find();
  }

  async findById(id: number): Promise<User | null> {
    return await this.userModel.findOneBy({ id });
  }

  async findByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOneBy({ email });
  }

  async create(createUserDTO: CreateUserDTO): Promise<User> {
    const existingUser = await this.findByEmail(createUserDTO.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const user = this.userModel.create(createUserDTO);
    return await this.userModel.save(user);
  }

  async update(id: number, updateUserDTO: UpdateUserDTO): Promise<User> {
    const user = await this.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    Object.assign(user, updateUserDTO);
    return await this.userModel.save(user);
  }

  async delete(id: number): Promise<void> {
    const user = await this.findById(id);
    if (!user) {
      throw new UserNotFoundError(id);
    }

    await this.userModel.remove(user);
  }

  async count(): Promise<number> {
    return await this.userModel.count();
  }
}

export class UserNotFoundError extends Error {
  constructor(userId: number) {
    super(`User with ID ${userId} not found`);
    this.name = 'UserNotFoundError';
  }
}
