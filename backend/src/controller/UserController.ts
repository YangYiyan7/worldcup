import { Controller, Get, Post, Put, Del, Body, Param, Query } from '@midwayjs/decorator';
import { UserService } from '../service/UserService';
import { CreateUserDTO, UpdateUserDTO } from '../dto/UserDTO';
import { ApiTags, ApiOperation, ApiResponse } from '@midwayjs/swagger';

@ApiTags('Users')
@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/')
  @ApiOperation({ summary: 'Get all users' })
  @ApiResponse({ status: 200, description: 'Return all users' })
  async getUsers() {
    const users = await this.userService.findAll();
    return {
      success: true,
      data: users,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('/:id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'Return user by ID' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async getUserById(@Param('id') id: number) {
    const user = await this.userService.findById(id);
    return {
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('/')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input' })
  async createUser(@Body() createUserDTO: CreateUserDTO) {
    const user = await this.userService.create(createUserDTO);
    return {
      success: true,
      data: user,
      message: 'User created successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Put('/:id')
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async updateUser(@Param('id') id: number, @Body() updateUserDTO: UpdateUserDTO) {
    const user = await this.userService.update(id, updateUserDTO);
    return {
      success: true,
      data: user,
      message: 'User updated successfully',
      timestamp: new Date().toISOString(),
    };
  }

  @Del('/:id')
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async deleteUser(@Param('id') id: number) {
    await this.userService.delete(id);
    return {
      success: true,
      message: 'User deleted successfully',
      timestamp: new Date().toISOString(),
    };
  }
}
