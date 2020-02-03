import Sequelize, { Model } from 'sequelize';

class DeliveryMan extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        email: Sequelize.STRING,
        avatar_id: Sequelize.STRING,
      },
      {
        sequelize,
        tableName: 'deliverymen',
      }
    );

    return this;
  }
}

export default DeliveryMan;
