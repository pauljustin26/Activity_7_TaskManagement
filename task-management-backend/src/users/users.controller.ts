import { Controller, Get, Post, Body, Patch, Param, Delete, UnauthorizedException } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() loginDto: any) {
    // 1. Find user by email
    const user = await this.usersService.findOneByEmail(loginDto.email); 
    
    // 2. Simple password check
    // Note: loginDto.password comes from frontend, user.password comes from DB
    if (user && user.password === loginDto.password) {
      // Convert Mongoose document to object to safely destructure
      const userObject = user.toObject ? user.toObject() : user;
      const { password, ...result } = userObject;
      return result; 
    }
    throw new UnauthorizedException('Invalid credentials');
  }

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}