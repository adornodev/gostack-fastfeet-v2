import Mail from '../../lib/Mail';

class OrderCancellationMail {
  get key() {
    return 'OrderCancellationMail';
  }

  async handle({ data }) {
    const { orderProblem } = data;
    console.log(orderProblem);

    await Mail.sendMail({
      to: `${orderProblem.deliveryMan.name} <${orderProblem.deliveryMan.email}>`,
      subject: `Entrega cancelada - ${orderProblem.order.order.product}`,
      template: 'order_cancellation',
      context: {
        deliveryMan: orderProblem.deliveryMan.name,
        recipient: orderProblem.recipient.name,
        product: orderProblem.order.order.product,
        description: orderProblem.order.description,
      },
    });
  }
}

export default new OrderCancellationMail();
