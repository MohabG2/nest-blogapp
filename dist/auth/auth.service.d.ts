import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
export declare class AuthService {
    private readonly usersService;
    private readonly jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    register(createUserDto: CreateUserDto): Promise<{
        user: import("../users/entities/user.entity").User;
        access_token: string;
    }>;
    login(loginDto: LoginDto): Promise<{
        user: import("../users/entities/user.entity").User;
        access_token: string;
    }>;
    private signToken;
}
