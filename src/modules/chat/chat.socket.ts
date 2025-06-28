// @ts-ignore – type declarations optional
import { Server, Socket } from 'socket.io';
import { aiService } from './ai.service';
import { chatService } from './chat.service';
import jwt from 'jsonwebtoken';
import { DataStoredInToken } from '../auth';

export default function registerChatSocket(io: Server) {
    // Namespace for chat
    const chat = io.of('/chat');

    // Auth middleware for namespace
    chat.use((socket, next) => {
        const token = (socket.handshake.auth as any)?.token || (socket.handshake.headers['authorization'] as string);
        if (!token) return next(new Error('Unauthorized'));
        const raw = token.startsWith('Bearer ') ? token.split(' ')[1] : token;
        try {
            const payload = jwt.verify(raw, process.env.JWT_TOKEN_SECRET ?? '') as DataStoredInToken;
            socket.data.userId = payload.id;
            next();
        } catch (err) {
            next(err as Error);
        }
    });

    chat.on('connection', (socket: Socket) => {
        console.log('Chat client connected', socket.id);

        // Join room event
        socket.on('join', (roomId: string) => {
            socket.join(roomId);
            socket.to(roomId).emit('system', `User ${socket.id} joined room ${roomId}`);
        });

        // Handle incoming message
        socket.on('message', async (payload: { roomId: string; message: string }) => {
            const { roomId, message } = payload;
            const sender = socket.data.userId as string;
            const msg = { sender, message, createdAt: new Date() };
            // Broadcast to room
            chat.to(roomId).emit('message', msg);
            // persist to DB
            void chatService.saveMessage(roomId, sender, message);

            // Auto-reply using AI service
            try {
                const reply = await aiService.ask(message);
                const botMsg = {
                    sender: 'bot',
                    message: reply,
                    createdAt: new Date()
                };
                // emit under 'answer' channel
                chat.to(roomId).emit('answer', botMsg);
                // also emit under 'message' so all clients get a unified stream
                chat.to(roomId).emit('message', botMsg);
            } catch (err) {
                console.error('AI service error', err);
            }
        });

        socket.on('disconnect', () => {
            console.log('Chat client disconnected', socket.id);
        });
    });
} 