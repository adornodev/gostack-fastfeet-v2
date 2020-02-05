import * as Yup from 'yup';
import DeliveryMan from '../models/DeliveryMan';
import Order from '../models/Order';

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
      avatar_id: Yup.number().positive(),
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

    const ordersByDeliveryId = await Order.findAll({
      where: {
        deliveryman_id: deliveryManId,
        canceled_at: null,
        end_date: null,
      },
    });

    return res.json(ordersByDeliveryId);
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

    await deliveryManExists.update(req.body);

    return res.json({
      success: true,
      message: 'Entregador atualizado com sucesso',
    });
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
