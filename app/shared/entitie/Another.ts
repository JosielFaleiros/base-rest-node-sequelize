import AnotherAttr from './AnotherAttr'

export class Another {
  private attrs;
  public getAttrs() {
    return this.attrs;
  }
  public define (sequelize, DataTypes) {
    this.attrs = AnotherAttr(DataTypes)
    return sequelize.define('Another', this.attrs, {
      tableName: 'another',
      underscored: true,
      timestamps: true
    })
  }
}
