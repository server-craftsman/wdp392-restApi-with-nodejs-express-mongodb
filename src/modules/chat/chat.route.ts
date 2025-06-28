// src/modules/chat/chat.route.ts
import { Router } from 'express';
import { PREFIX_API } from '../../core/constants/prefix.constant';
import ChatController from './chat.controller';

export default class ChatRoute {
    public path = `${PREFIX_API}/chat`;
    public router = Router();

    private chatController = new ChatController();

    constructor() {
        // health check
        this.router.get(`${this.path}`, (_req, res) => {
            res.json({ success: true, message: 'Chat service online' });
        });

        // list rooms
        this.router.get(`${this.path}/rooms`, this.chatController.listRooms.bind(this.chatController));

        // get messages of room
        this.router.get(`${this.path}/rooms/:roomId/messages`, this.chatController.getMessages.bind(this.chatController));
    }
}