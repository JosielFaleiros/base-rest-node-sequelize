import ExampleAttr from './ExampleAttr'

export class Example {
  private attrs;
  public getAttrs() {
    return this.attrs;
  }
  public define (sequelize, DataTypes) {
    this.attrs = ExampleAttr(DataTypes);
    return sequelize.define('Example', this.attrs, {
      tableName: 'example',
      underscored: true,
      timestamps: true
    })
  }
}
