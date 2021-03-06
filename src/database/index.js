import Sequelize from 'sequelize';
import DeliveryMan from '../app/models/DeliveryMan';
import File from '../app/models/File';
import Order from '../app/models/Order';
import OrderProblem from '../app/models/OrderProblem';
import Recipient from '../app/models/Recipient';
import User from '../app/models/User';
import databaseConfig from '../config/database';

const models = [User, Recipient, DeliveryMan, Order, File, OrderProblem];

class Database {
  constructor() {
    this.init();
  }

  init() {
    this.connection = new Sequelize(databaseConfig);

    models
      .map(model => model.init(this.connection))
      .map(model => model.associate && model.associate(this.connection.models));
  }
}

export default new Database();
