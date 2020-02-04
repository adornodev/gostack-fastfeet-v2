import { endOfDay, getHours, parseISO, startOfDay } from 'date-fns';
import { Op } from 'sequelize';
import * as Yup from 'yup';
import DeliveryMan from '../models/DeliveryMan';
import Order from '../models/Order';

class WithdrawController {
  async update(req, res) {
    const MAX_ORDERS_ON_ONE_DAY = 5;

    const schema = Yup.object().shape({
      start_date: Yup.string().required(),
    });

    if (!(await schema.isValid(req.body)))
      return res
        .status(400)
        .json({ error: 'Falha na validação dos dados fornecidos' });

    const { order_id: orderId, deliveryMan_id } = req.params;

    if (!orderId || !deliveryMan_id) {
      return res.status(400).json({
        error:
          'O identificador do entregador e do pedido devem ser fornecidos juntos',
      });
    }

    const deliveryManOnDb = await DeliveryMan.findByPk(deliveryMan_id);

    if (!deliveryManOnDb)
      return res
        .status(400)
        .json({ error: 'Entregador não está registrado na base' });

    const orderOnDb = await Order.findByPk(orderId);

    if (!orderOnDb)
      return res.status(400).json({ error: 'Encomenda não encontrada' });

    const { start_date } = req.body;

    if (orderOnDb.canceled_at)
      return res
        .status(400)
        .json({ error: 'O pedido já foi cancelado e não pode ser retirado' });

    if (orderOnDb.end_date)
      return res.status(400).json({ error: 'O pedido já foi entregue' });

    if (orderOnDb.start_date)
      return res.status(400).json({ error: 'O pedido já foi retirado' });

    const withdrawDate = parseISO(start_date);

    const withdrawHour = getHours(withdrawDate);

    if (withdrawHour < 8 || withdrawHour > 18)
      return res.status(400).json({
        error: 'A data de retirada deve estar no intervalo de 08:00 e 18:00',
      });

    const ordersOnDb = await Order.findAll({
      where: {
        deliveryman_id: deliveryMan_id,
        canceled_at: null,
        end_date: null,
        start_date: {
          [Op.between]: [startOfDay(withdrawDate), endOfDay(withdrawDate)],
        },
      },
    });

    if (ordersOnDb.length >= MAX_ORDERS_ON_ONE_DAY)
      return res.status(400).json({
        error: `O entregador já realizou a retirada limite de ${MAX_ORDERS_ON_ONE_DAY} pedidos em um único dia.`,
      });

    const updatedOrder = await orderOnDb.update({
      start_date,
      deliveryman_id: deliveryMan_id,
    });

    return res.json({
      success: true,
      message: 'Solicitação de retirada com sucesso',
      data: updatedOrder,
    });
  }
}

export default new WithdrawController();
