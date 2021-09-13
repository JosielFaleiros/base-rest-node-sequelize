import {DataTypes, Dialect, Sequelize} from 'sequelize';
import {Another} from './entitie/Another';
import {Example} from './entitie/Example';

export class Repository {
  private static instance: Repository;
  private sequelize: any;
  private db = {
    Example: undefined,
    Another: undefined
  };

  private constructor() {
    console.log('=====================================================================')
    console.log('Repository.constructor()');
    this.initialise();
  }

  public static getModelRepository(modelName: string) {
    const repositoryBase = Repository.getInstance();
    return repositoryBase.getRepositoryByName(modelName);
  }

  public getRepositoryByName(modelName: string) {
    return this?.db[modelName];
  }

  private initialise() {
    this.sequelize = new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USERNAME,
      process.env.DB_PASSWORD, {
        host: process.env.DB_HOST,
        logging: process.env.SEQUELIZE_LOG==='true' || process.env.NODE_ENV != 'production'? console.log: () => {},
        dialect: process.env.DB_DIALECT as Dialect
      })

    const PaperTrail = require('sequelize-paper-trail').init(this.sequelize, {
      mysql: true,
      tableUnderscored: true,
      underscored: true,
      underscoredAttributes: true,
      tableName: 'revisions',
      // log: function() {console.log('[papertrail]', ...arguments)},
      debug: process.env.NODE_ENV != 'production' && process.env.LOG_PAPERTRAIL === 'true'
    })
    PaperTrail.defineModels()

    this.db.Example = new Example().define(this.sequelize, DataTypes);
    this.db.Another = new Another().define(this.sequelize, DataTypes);
    this.db.Example.hasPaperTrail()

    Object.keys(this.db).forEach(modelName => {
      if (this.db[modelName].associate) {
        this.db[modelName].associate(this.db)
      }
    })
    this.sequelize.sync({ force: true })
  }

  public static getInstance(): Repository {
    if (!Repository.instance) {
      Repository.instance = new Repository();
    }

    return Repository.instance;
  }
}
