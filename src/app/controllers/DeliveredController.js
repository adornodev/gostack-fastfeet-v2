import { parseISO } from 'date-fns';
import * as Yup from 'yup';
import DeliveryMan from '../models/DeliveryMan';
import File from '../models/File';
import Order from '../models/Order';

class DeliveredController {
  async update(req, res) {
    const schema = Yup.object().shape({
      end_date: Yup.string().required(),
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

    const { end_date } = req.body;

    if (orderOnDb.canceled_at)
      return res.status(400).json({
        error: 'O pedido já foi cancelado e não pode ser cadastrado a entrega',
      });

    if (!orderOnDb.start_date)
      return res
        .status(400)
        .json({ error: 'O pedido precisa ser retirado antes de entregá-lo' });

    if (orderOnDb.end_date)
      return res
        .status(400)
        .json({ error: 'O pedido já foi dado como entregue' });

    const { filename: path, originalname: name } = req.file;

    const deliveredDate = parseISO(end_date);

    let signatureUrl,
      signatureId = null;
    if (name && path) {
      const { url, id } = await File.create({ name, path });
      signatureUrl = url;
      signatureId = id;
    }
    const updatedOrder = await orderOnDb.update({
      end_date: deliveredDate,
      signature_id: signatureId,
    });

    return res.json({
      success: true,
      message: 'Solicitação de retirada com sucesso',
      data: { signature_url: signatureUrl, updatedOrder },
    });
  }
}

export default new DeliveredController();
