import ExampleAttr from './ExampleAttr'

export = function(sequelize, DataTypes) {
  const attrs = ExampleAttr(DataTypes)
  return sequelize.define('Example', attrs, {
    tableName: 'example',
    underscored: true,
    timestamps: true
  })
}
