import * as Yup from 'yup';
import Queue from '../../lib/Queue';
import OrderCancellationMail from '../jobs/OrderCancellationMail';
import DeliveryMan from '../models/DeliveryMan';
import File from '../models/File';
import Order from '../models/Order';
import OrderProblem from '../models/OrderProblem';
import Recipient from '../models/Recipient';

class OrderProblemController {
  async index(req, res) {
    const { page = 1 } = req.query;
    const orderProblemsOnDb = await OrderProblem.findAll({
      limit: 20,
      offset: (page - 1) * 20,
      order: [
        ['created_at', 'DESC'],
        ['updated_at', 'DESC'],
      ],
      attributes: ['id', 'order_id', 'description'],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: [
            'id',
            'product',
            'canceled_at',
            'start_date',
            'end_date',
          ],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: [
                ['id', 'recipient_id'],
                'name',
                'street',
                'street_number',
                ['street_data', 'complement'],
                'zipcode',
                'city',
              ],
            },
            {
              model: DeliveryMan,
              as: 'deliveryman',
              attributes: ['id', 'name', 'email'],
              include: [
                {
                  model: File,
                  as: 'avatar',
                  attributes: ['id', 'name', 'path', 'url'],
                },
              ],
            },
            {
              model: File,
              as: 'signature',
              attributes: ['id', 'name', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(orderProblemsOnDb);
  }

  async show(req, res) {
    const { order_id } = req.params;

    if (!order_id) {
      return res
        .status(400)
        .json({ error: 'O id da entrega deve ser enviado' });
    }

    const orderProblemsOnDb = await OrderProblem.findAll({
      where: {
        order_id,
      },
      order: [
        ['created_at', 'ASC'],
        ['updated_at', 'DESC'],
      ],
      attributes: ['id', 'order_id', 'description'],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: [
            'id',
            'product',
            'canceled_at',
            'start_date',
            'end_date',
          ],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: [
                'id',
                'name',
                'street',
                ['street_data', 'complement'],
                'street_number',
                'zipcode',
                'city',
              ],
            },
            {
              model: DeliveryMan,
              as: 'deliveryman',
              attributes: ['id', 'name', 'email'],
              include: [
                {
                  model: File,
                  as: 'avatar',
                  attributes: ['id', 'name', 'path', 'url'],
                },
              ],
            },
            {
              model: File,
              as: 'signature',
              attributes: ['id', 'name', 'path', 'url'],
            },
          ],
        },
      ],
    });

    return res.json(orderProblemsOnDb);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      description: Yup.string()
        .required()
        .min(2),
    });

    if (!(await schema.isValid(req.body)))
      return res
        .status(400)
        .json({ error: 'Falha na validação dos dados fornecidos' });

    const { order_id } = req.params;
    const { description } = req.body;

    const orderOnDb = await Order.findByPk(order_id, {
      attributes: ['id', 'product', 'canceled_at', 'start_date', 'end_date'],
      include: [
        {
          model: Recipient,
          as: 'recipient',
          attributes: [
            'id',
            'name',
            'street',
            'street_number',
            ['street_data', 'complement'],
            'zipcode',
            'city',
          ],
        },
        {
          model: DeliveryMan,
          as: 'deliveryman',
          attributes: ['id', 'name', 'email'],
          include: [
            {
              model: File,
              as: 'avatar',
              attributes: ['id', 'name', 'path', 'url'],
            },
          ],
        },
        {
          model: File,
          as: 'signature',
          attributes: ['id', 'name', 'path', 'url'],
        },
      ],
    });

    if (!orderOnDb)
      return res.status(400).json({ error: 'Pedido não encontrado' });

    const { id } = await OrderProblem.create({ order_id, description });

    return res.json({
      order_problem: {
        id,
        orderOnDb,
        description,
      },
    });
  }

  async update(req, res) {
    const { id: order_problem_id } = req.params;

    if (!order_problem_id) {
      return res.status(400).json({
        error: 'O identificador do problema do pedido deve ser enviado',
      });
    }

    const orderProblemOnDb = await OrderProblem.findByPk(order_problem_id, {
      attributes: ['id', 'order_id', 'description'],
      include: [
        {
          model: Order,
          as: 'order',
          attributes: [
            'id',
            'product',
            'canceled_at',
            'start_date',
            'end_date',
          ],
          include: [
            {
              model: Recipient,
              as: 'recipient',
              attributes: [
                'id',
                'name',
                'street',
                ['street_data', 'complement'],
                'street_number',
                'zipcode',
                'city',
              ],
            },
            {
              model: DeliveryMan,
              as: 'deliveryman',
              attributes: ['id', 'name', 'email'],
              include: [
                {
                  model: File,
                  as: 'avatar',
                  attributes: ['id', 'name', 'path', 'url'],
                },
              ],
            },
            {
              model: File,
              as: 'signature',
              attributes: ['id', 'name', 'path', 'url'],
            },
          ],
        },
      ],
    });

    if (!orderProblemOnDb)
      return res.status(400).json({
        error: 'Não foi encontrado o problema do pedido na base de dados',
      });

    const { order_id } = orderProblemOnDb;

    const orderOnDb = await Order.findByPk(order_id);

    if (!orderOnDb)
      return res.status(400).json({ error: 'Pedido não encontrado' });

    orderOnDb.canceled_at = Date.now();

    await orderOnDb.save();

    await Queue.add(OrderCancellationMail.key, {
      orderProblem: {
        recipient: orderProblemOnDb.order.recipient.dataValues,
        deliveryMan: orderProblemOnDb.order.deliveryman.dataValues,
        order: orderProblemOnDb.dataValues,
      },
    });

    return res.json({
      success: true,
      message: `Registrado com sucesso o cancelamento da entrega do produto "${orderProblemOnDb.order.product}" foi cadastrado com sucesso`,
      data: orderProblemOnDb,
    });
  }
}

export default new OrderProblemController();
