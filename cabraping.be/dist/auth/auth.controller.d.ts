import { Request } from 'express';
import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    signup(req: Request): {
        msg: string;
    };
    signin(): {
        msg: string;
    };
}
