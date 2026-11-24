const { Router } = require('express');
const locacaoController = require('../controllers/locacaoController');
const autenticar = require('../middlewares/autenticacao');

const router = Router();

router.use(autenticar);
router.get('/', locacaoController.listar);
router.post('/', locacaoController.registrar);
router.patch('/:id/finalizar', locacaoController.finalizar);

module.exports = router;
