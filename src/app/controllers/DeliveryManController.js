import * as Yup from 'yup';
import DeliveryMan from '../models/DeliveryMan';

class DeliveryManController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const deliveryMen = await DeliveryMan.findAll({
      limit: 10,
      offset: (page - 1) * 10,
      order: [['name', 'ASC']],
      attributes: ['id', 'name', 'email', 'avatar_id'],
    });

    return res.json(deliveryMen);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      avatar_id: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Falha na validação dos dados fornecidos!' });
    }

    const deliveryManExists = await DeliveryMan.findOne({
      where: { email: req.body.email },
    });

    if (deliveryManExists) {
      return res.status(400).json({ error: 'Este Entregador já existe!' });
    }

    const { filename } = req.file;
    req.body.avatar_id = filename;

    const { avatar_id, name, email } = await DeliveryMan.create(req.body);

    return res.json({
      avatar_id,
      name,
      email,
    });
  }

  async show(req, res) {
    const { id: deliveryManId } = req.params;

    if (!deliveryManId) {
      return res
        .status(400)
        .json({ error: 'Identificador do entregador não está preenchido!' });
    }

    const deliveryManExists = await DeliveryMan.findByPk(deliveryManId);

    if (!deliveryManExists) {
      return res
        .status(400)
        .json({ error: 'Este entregador não está cadastrado!' });
    }

    const { id, name, email, avatar_id } = deliveryManExists;

    return res.json({ id, name, email, avatar_id });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string()
        .email()
        .required(),
      avatar_id: Yup.string(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Falha na validação dos dados fornecidos!' });
    }

    const { id: deliveryManId } = req.params;

    if (!deliveryManId) {
      return res
        .status(400)
        .json({ error: 'Identificador do entregador não está preenchido!' });
    }

    const deliveryManExists = await DeliveryMan.findByPk(deliveryManId);

    if (!deliveryManExists) {
      return res.status(400).json({
        error: 'Este entregador não está cadastrado para ser atualizado!',
      });
    }
  }

  async delete(req, res) {
    const { id: deliveryManId } = req.params;

    if (!deliveryManId) {
      return res
        .status(400)
        .json({ error: 'Identificador do entregador não está preenchido!' });
    }

    const deliveryManExists = await DeliveryMan.findByPk(deliveryManId);

    if (!deliveryManExists) {
      return res.status(400).json({
        error: 'Este entregador não está cadastrado para ser deletado!',
      });
    }

    await deliveryManExists.destroy();

    return res.json({ success: true, message: 'Deletado com sucesso' });
  }
}

export default new DeliveryManController();
