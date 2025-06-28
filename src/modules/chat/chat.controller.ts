import { Request, Response, NextFunction } from 'express';
import { chatService } from './chat.service';
import { formatResponse } from '../../core/utils';

export default class ChatController {
    async listRooms(_req: Request, res: Response, next: NextFunction) {
        try {
            const rooms = await chatService.listRooms();
            res.json(formatResponse(rooms));
        } catch (err) {
            next(err);
        }
    }

    async getMessages(req: Request, res: Response, next: NextFunction) {
        try {
            const { roomId } = req.params;
            const page = parseInt(req.query.page as string) || 1;
            const limit = parseInt(req.query.limit as string) || 20;
            const messages = await chatService.getMessages(roomId, page, limit);
            res.json(formatResponse(messages));
        } catch (err) {
            next(err);
        }
    }
} 