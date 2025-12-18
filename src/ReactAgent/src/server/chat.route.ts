import { chatController } from './chat.controller';
import { Router } from 'express';

const router = Router();

// Route for chatting with LLM Model having tools integrated!!!
router.get("/chat", chatController);

export default router;