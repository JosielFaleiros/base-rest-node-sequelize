import fs from 'fs'
import path from 'path';
import {DataTypes, Dialect, Sequelize} from 'sequelize';
import Another from './entities/Another';
import Example from './entities/Example';
const basename  = path.basename(__filename)

export class Repository {
  private static instance: Repository;
  private modelAttrs: any[] = [];
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
    console.log(this.db)
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

    this.readModelAttrs()
    // db = {...db, ...()}

    this.db.Example = Example(this.sequelize, DataTypes);
    this.db.Another = Another(this.sequelize, DataTypes);
    this.db.Example.hasPaperTrail()
    console.log(' 1')
    // fs
    //     .readdirSync(__dirname)
    //     .filter(file => (
    //             !file.includes('Attr') &&
    //             file.indexOf('.') !== 0
    //             ) &&
    //         (file !== basename) &&
    //         (file !== 'Revision') &&
    //         (file.slice(-3) === '.js')
    //     )
    //     .forEach(async file => {
    //       console.log(' file ', file);
    //       const model = (await import(path.join(__dirname, file)))(this.sequelize, DataTypes)
    //       // const model = sequelize['import'](path.join(__dirname, file))
    //       console.log(' model ', model);
    //       this.db[model.name] = model
    //       if (!model.name.includes('Revision'))
    //         this.db[model.name].Revisions = this.db[model.name].hasPaperTrail()
    //     })

    Object.keys(this.db).forEach(modelName => {
      if (this.db[modelName].associate) {
        this.db[modelName].associate(this.db)
      }
    })
    // db.Example.belongsTo(db.Another, { foreignKey: 'another_id', constraints: false })
    // db.Another.hasOne(db.Example, { foreignKey: 'another_id', constraints: false })

    this.sequelize.sync({ force: true })
  }

  readModelAttrs() {
    fs
      .readdirSync(__dirname)
      .filter(file => (
              file.includes('Attr') &&
              file.indexOf('.') !== 0) &&
          (file !== basename) &&
          (file.slice(-3) === '.js')
      )
      .forEach(file => {
        this.modelAttrs.push(file)
      })
  }

  public static getInstance(): Repository {
    if (!Repository.instance) {
      Repository.instance = new Repository();
    }

    return Repository.instance;
  }
}
