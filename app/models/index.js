'use strict'

const fs = require('fs')
const path = require('path')
const Sequelize = require('sequelize')
const basename  = path.basename(__filename)

console.log(process.env.DB_NAME, process.env.DB_USERNAME)
// const sequelize = new Sequelize(process.env.DATABASE, process.env.USERNAME, process.env.PASSWORD, {

var db = {}

function readModelAttrs() {
  db.modelAttrs = []
  fs
    .readdirSync(__dirname)
    .filter(file => (
      file.includes('Attr') &&
      file.indexOf('.') !== 0) &&
      (file !== basename) &&
      (file.slice(-3) === '.js')
    )
    .forEach(file => {
      db.modelAttrs.push(file)
    })
}

function getInstance() {
  if (db.sequelize) return db

  const sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USERNAME,
    process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      warnings: false,
      logging: process.env.SEQUELIZE_LOG==='true' || process.env.NODE_ENV != 'production',
      dialect: process.env.DB_DIALECT
    })
  const PaperTrail = require('sequelize-paper-trail').init(sequelize, {
    mysql: true,
    tableUnderscored: true,
    underscored: true,
    underscoredAttributes: true,
    tableName: 'revisions',
    // log: function() {console.log('[papertrail]', ...arguments)},
    debug: process.env.NODE_ENV != 'production' && process.env.LOG_PAPERTRAIL === 'true'
  })
  PaperTrail.defineModels()

  readModelAttrs()
  // db = {...db, ...()}
  fs
    .readdirSync(__dirname)
    .filter(file => (
      !file.includes('Attr') &&
      file.indexOf('.') !== 0) &&
      (file !== basename) &&
      (file !== 'Revision') &&
      (file.slice(-3) === '.js')
    )
    .forEach(file => {
      const model = require(path.join(__dirname, file))(sequelize, Sequelize.DataTypes)
      // const model = sequelize['import'](path.join(__dirname, file))
      db[model.name] = model
      if (!model.name.includes('Revision'))
        db[model.name].Revisions = db[model.name].hasPaperTrail()
    })

  Object.keys(db).forEach(modelName => {
    if (db[modelName].associate) {
      db[modelName].associate(db)
    }
  })


  // db.Example.belongsTo(db.Another, { foreignKey: 'another_id', constraints: false })
  // db.Another.hasOne(db.Example, { foreignKey: 'another_id', constraints: false })

  sequelize.sync({ force: db.force === true })
    .then(function() {
      if (typeof db.finishCbFn == 'function') {
        console.log('db.finishCbFn(db)')
        db.finishCbFn(db)
        console.log('db.finishCbFn(db)')
      }
      console.log('syncronized?  sequelize ', typeof db.finishCbFn)
    })
    .catch(err => {
      console.log('log err called', err)
      typeof db.catchFinishCbFn == 'function'? db.catchFinishCbFn(): console.log(err)
    })

  db.sequelize = sequelize
  db.Sequelize = Sequelize
  return db
}
// sequelize.sync();

module.exports = (finishCbFn, catchFinishCbFn, force) => {

  Object.defineProperty(db, 'force', { value: force == 'true' } )
  if (typeof finishCbFn == 'function') {
    Object.defineProperty(db, 'finishCbFn', {
      value: finishCbFn
    })
  }
  if (typeof catchFinishCbFn == 'function') {
    Object.defineProperty(db, 'catchFinishCbFn', {
      value: catchFinishCbFn
    })
  }
  return getInstance()
}
