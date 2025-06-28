import ChatMessageSchema from './chat.model';
import { IChatMessage } from './chat.interface';

class ChatService {
    async saveMessage(roomId: string, senderId: string, message: string): Promise<IChatMessage> {
        return ChatMessageSchema.create({ room_id: roomId, sender: senderId, message });
    }

    async getMessages(roomId: string, page = 1, limit = 20): Promise<IChatMessage[]> {
        const skip = (page - 1) * limit;
        return ChatMessageSchema.find({ room_id: roomId })
            .sort({ created_at: -1 })
            .skip(skip)
            .limit(limit)
            .populate('sender', 'name email avatar')
            .lean();
    }

    async listRooms(): Promise<string[]> {
        return ChatMessageSchema.distinct('room_id');
    }
}

export const chatService = new ChatService(); 