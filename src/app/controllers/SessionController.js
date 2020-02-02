import jwt from 'jsonwebtoken';
import authConfig from '../../config/auth';
import User from '../models/User';

class SessionController {
  async store(req, res) {
    const { email, password } = req.body;

    const userOnDb = await User.findOne({ where: { email } });
    if (!userOnDb) {
      return res.status(401).json({ error: 'Usuário não encontrado!' });
    }

    if (!(await userOnDb.checkPassword(password))) {
      return res.status(401).json({ error: 'A senha não está correta' });
    }

    const { id, name } = userOnDb;

    return res.json({
      user: { id, name, email },
      token: jwt.sign({ id }, authConfig.secret, {
        expiresIn: authConfig.expiresIn,
      }),
    });
  }
}

export default new SessionController();
