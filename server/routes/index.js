const { Router } = require('express');
const { getBooksContract } = require('../modules/contract.js');
const { validate } = require('../middleware/schema/index.js');
const { getBooks } = require('../modules/controller.js');
const router = Router();

router.get('/', (_, res) => res.send());
router.get('/books', validate('query', getBooksContract), getBooks);

module.exports = router;