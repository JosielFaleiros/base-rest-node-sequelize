import AnotherAttr from './AnotherAttr'

export = function (sequelize, DataTypes) {
  const attrs = AnotherAttr(DataTypes)
  return sequelize.define('Another', attrs, {
    tableName: 'another',
    underscored: true,
    timestamps: true
  })
}
