import { Router } from "express";
import { handleWebSearch, handleWebScrape } from "@controllers/web_access.controller";

const router = Router();

router.get("/search", handleWebSearch);
router.get("/scrape", handleWebScrape);

export default router;
