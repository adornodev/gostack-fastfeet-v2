import * as Yup from 'yup';
import Queue from '../../lib/Queue';
import OrderWithdrawMail from '../jobs/OrderWithdrawMail';
import DeliveryMan from '../models/DeliveryMan';
import File from '../models/File';
import Order from '../models/Order';
import Recipient from '../models/Recipient';

class OrderController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const ordersOnDb = await Order.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      where: {
        canceled_at: null,
        end_date: null,
      },
      order: [['product', 'ASC']],
      attributes: ['id', 'product'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: ['id', 'name', 'city'],
        },
        {
          model: DeliveryMan,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(ordersOnDb);
  }

  async show(req, res) {
    const { id: orderId } = req.params;

    if (!orderId) {
      return res
        .status(400)
        .json({ error: 'Identificador do pedido não foi enviado!' });
    }

    const orderExists = await Order.findOne({
      where: {
        id: orderId,
      },
      include: [
        {
          model: DeliveryMan,
          as: 'deliveryman',
          attributes: ['name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'path', 'url'],
            },
          ],
        },
        {
          model: Recipient,
          as: 'recipient',
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'path', 'url'],
        },
      ],
    });

    if (!orderExists) {
      return res
        .status(400)
        .json({ error: 'Este pedido não está cadastrado!' });
    }

    return res.json(orderExists);
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number().positive(),
      deliveryman_id: Yup.number().positive(),
      signature_id: Yup.number().positive(),
      product: Yup.string()
        .ensure()
        .min(2),
      start_date: Yup.date(),
      end_date: Yup.date(),
      canceled_at: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Falha na validação dos dados fornecidos' });
    }

    const { id: orderId } = req.params;
    if (!orderId) {
      return res
        .status(400)
        .json({ error: 'O id do produto não foi fornecido' });
    }

    const orderOnDb = await Order.findByPk(orderId);
    if (!orderOnDb) {
      return res
        .status(400)
        .json({ error: 'O pedido não está cadastrado na base' });
    }

    const { recipient_id, deliveryman_id, signature_id, product } = req.body;

    if (recipient_id) {
      const recipient = await Recipient.findByPk(recipient_id);

      if (!recipient)
        return res.status(400).json({ error: 'Destinatário não existe' });
    }

    if (deliveryman_id) {
      const deliveryMan = await DeliveryMan.findByPk(deliveryman_id);

      if (!deliveryMan)
        return res.status(400).json({ error: 'Entregador não existe' });
    }

    if (signature_id) {
      const signature = await File.findByPk(signature_id);

      if (!signature)
        return res
          .status(400)
          .json({ error: 'A imagem da assinatura não existe' });
    }

    const { product: oldProduct } = orderOnDb;
    const newOrder = await orderOnDb.update(req.body);

    return res.json({
      success: true,
      message: `O produto "${oldProduct}" foi atualizado com sucesso para "${product}"`,
      data: { newOrder },
    });
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      recipient_id: Yup.number()
        .positive()
        .required(),
      deliveryman_id: Yup.number().positive(),
      signature_id: Yup.number().positive(),
      product: Yup.string()
        .ensure()
        .min(2)
        .required(),
      start_date: Yup.date(),
      end_date: Yup.date(),
    });

    if (!(await schema.isValid(req.body))) {
      return res
        .status(400)
        .json({ error: 'Falha na validação dos dados fornecidos' });
    }

    const { recipient_id, deliveryman_id, signature_id, product } = req.body;

    const recipient = await Recipient.findByPk(recipient_id);

    if (!recipient)
      return res.status(400).json({ error: 'Destinatário não existe' });

    let deliveryMan;

    if (deliveryman_id) {
      deliveryMan = await DeliveryMan.findByPk(deliveryman_id);

      if (!deliveryMan)
        return res.status(400).json({ error: 'Entregador não existe' });
    }

    if (signature_id) {
      const signature = await File.findByPk(signature_id);

      if (!signature)
        return res
          .status(400)
          .json({ error: 'A imagem da assinatura não existe' });
    }

    const { id: newOrderId, ...order } = await Order.create(req.body);

    if (deliveryman_id) {
      // Enviar uma notificação para o entregador ficar ciente do pedido disponível para retirada
      await Queue.add(OrderWithdrawMail.key, {
        orderWithdrawNotificationData: {
          recipient: recipient.dataValues,
          deliveryMan: deliveryMan.dataValues,
          order: order.dataValues,
        },
      });
    }

    return res.json({
      success: true,
      message: `O produto "${product}" foi cadastrado com sucesso`,
      data: { id: newOrderId, ...req.body },
    });
  }

  async delete(req, res) {
    const { id: orderId } = req.params;

    if (!orderId) {
      return res
        .status(400)
        .json({ error: 'O identificador do pedido deve ser fornecido!' });
    }

    const orderOnDb = await Order.findByPk(orderId);
    if (!orderOnDb) {
      return res.status(400).json({ error: 'O pedido não está cadastrado!' });
    }

    await orderOnDb.destroy();

    return res.json({ success: true, message: 'Pedido deletado com sucesso!' });
  }
}

export default new OrderController();
