/* jshint indent: 2 */

import ExampleAttr from './ExampleAttr'

module.exports = function(sequelize, DataTypes) {
  const attrs = ExampleAttr(DataTypes)
  return sequelize.define('Example', attrs, {
    tableName: 'example',
    underscored: true,
    timestamps: true
  })
}
