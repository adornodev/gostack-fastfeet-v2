import 'dotenv/config';
import Sequelize, { Model } from 'sequelize';

class File extends Model {
  static init(sequelize) {
    super.init(
      {
        name: Sequelize.STRING,
        path: Sequelize.STRING,
        url: {
          type: Sequelize.VIRTUAL,
          get() {
            return `http://${process.env.DATABASE_HOST}:${process.env.API_PORT}/files/${this.path}`;
          },
        },
      },
      {
        sequelize,
      }
    );

    return this;
  }
}

export default File;
