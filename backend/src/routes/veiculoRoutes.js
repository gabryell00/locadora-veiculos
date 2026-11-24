const { Router } = require('express');
const veiculoController = require('../controllers/veiculoController');
const autenticar = require('../middlewares/autenticacao');

const router = Router();

router.use(autenticar);
router.get('/', veiculoController.listar);
router.post('/', veiculoController.cadastrar);

module.exports = router;
