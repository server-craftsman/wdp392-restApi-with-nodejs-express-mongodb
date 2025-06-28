import { Document, Types } from 'mongoose';

export interface IChatMessage extends Document {
    room_id: string;
    sender: Types.ObjectId;
    message: string;
    created_at: Date;
} 