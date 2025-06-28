import OpenAI from 'openai';

class AIService {
    private openai: OpenAI;

    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new Error('OPENAI_API_KEY environment variable is not set');
        }
        this.openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async ask(question: string, context = 'You are an assistant helping users of a medical DNA testing service.'): Promise<string> {
        const res = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
                { role: 'system', content: context },
                { role: 'user', content: question },
            ] as any,
            temperature: 0.7,
        });

        return res.choices?.[0]?.message?.content ?? '';
    }
}

export const aiService = new AIService();