import Mail from '../../lib/Mail';

class OrderWithdrawMail {
  get key() {
    return 'OrderWithdrawMail';
  }

  /* Método que a tarefa vai executar quando este job for rodado */
  async handle({ data }) {
    const { orderWithdrawNotificationData } = data;

    await Mail.sendMail({
      to: `${orderWithdrawNotificationData.recipient.name} <${orderWithdrawNotificationData.recipient.email}>`,
      subject: `Produto "${orderWithdrawNotificationData.order.product}" disponível para retirada`,
      template: 'order_withdraw',
      context: {
        deliveryMan: orderWithdrawNotificationData.deliveryMan.name,
        product: orderWithdrawNotificationData.order.product,
        recipientId: orderWithdrawNotificationData.recipient.id,
      },
    });
  }
}

export default new OrderWithdrawMail();
