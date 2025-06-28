import mongoose, { Schema } from 'mongoose';
import { COLLECTION_NAME } from '../../core/constants/collection.constant';
import { IChatMessage } from './chat.interface';

const ChatMessageSchemaEntity: Schema<IChatMessage> = new Schema({
    room_id: { type: String, required: true, index: true },
    sender: { type: Schema.Types.ObjectId, ref: COLLECTION_NAME.USER, required: true },
    message: { type: String, required: true },
    created_at: { type: Date, default: Date.now }
});

const ChatMessageSchema = mongoose.model<IChatMessage & mongoose.Document>(
    COLLECTION_NAME.CHAT_MESSAGE,
    ChatMessageSchemaEntity
);

export default ChatMessageSchema; 