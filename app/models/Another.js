/* jshint indent: 2 */

import AnotherAttr from './AnotherAttr'

module.exports = function(sequelize, DataTypes) {
  const attrs = AnotherAttr(DataTypes)
  return sequelize.define('Another', attrs, {
    tableName: 'another',
    underscored: true,
    timestamps: true
  })
}
