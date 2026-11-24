const { Router } = require('express');
const authController = require('../controllers/authController');
const autenticar = require('../middlewares/autenticacao');

const router = Router();

router.post('/cadastro', authController.cadastrar);
router.post('/login', authController.login);
router.get('/perfil', autenticar, authController.perfil);

module.exports = router;
