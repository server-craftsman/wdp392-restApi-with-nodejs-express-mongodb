import { NextFunction, Request, Response } from 'express';
import { API_PATH } from '../../core/constants';
import { HttpStatus } from '../../core/enums';
import { formatResponse } from '../../core/utils';
import { IUser } from '../user';
import { TokenData } from './auth.interface';
import AuthService from './auth.service';
import LoginDto from './dtos/login.dto';
import LoginGoogleDto from './dtos/loginGoogle.dto';

export default class AuthController {
    private authService = new AuthService();

    public login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const model: LoginDto | LoginGoogleDto = req.body;
            const isGoogle = req.route.path === API_PATH.AUTH_GOOGLE ? true : false;
            const tokenData: TokenData = await this.authService.login(model, isGoogle);
            res.status(HttpStatus.Success).json(formatResponse<TokenData>(tokenData));
        } catch (error) {
            next(error);
        }
    };

    public verifiedToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.authService.verifiedTokenUser(req.body.token);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };

    public resendToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.authService.resendTokenUser(req.body.email);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };

    public getCurrentLoginUser = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const user: IUser = await this.authService.getCurrentLoginUser(req.user.id);
            res.status(HttpStatus.Success).json(formatResponse<IUser>(user));
        } catch (error) {
            next(error);
        }
    };

    public forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.authService.forgotPassword(req.body.email);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };

    public logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            await this.authService.logout(req.user.id);
            res.status(HttpStatus.Success).json(formatResponse<null>(null));
        } catch (error) {
            next(error);
        }
    };
}
