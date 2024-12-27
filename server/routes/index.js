import { Router } from "express";
import { getBooksContract } from "../modules/contract.js";
import { validate } from "../middleware/schema/index.js";
import { getBooks } from "../modules/controller.js";
const router = Router();

router.get('/', (_, res) => res.send());
router.get('/books', validate('query', getBooksContract), getBooks);

export default router;