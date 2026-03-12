import { Controller, Post, Body, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { Public } from '../decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @Post('register')
    async register(@Body() registerDto: any) {
        return this.authService.register(registerDto);
    }

    @Public()
    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: any) {
        const user = await this.authService.validateUser(loginDto.email, loginDto.password);
        if (!user) {
            return { message: 'Invalid credentials' }; // Or throw UnauthorizedException
        }
        return this.authService.login(user);
    }
}
