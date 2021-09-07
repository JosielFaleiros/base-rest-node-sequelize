export = (DataTypes) => {
  return {
    id: { type: DataTypes? DataTypes.INTEGER(11): 'number', allowNull: false, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes? DataTypes.STRING(255): 'string', allowNull: false },
    description: { type: DataTypes? DataTypes.STRING(150): 'string', allowNull: true },
    created_at: { type: DataTypes? DataTypes.DATE: 'date' },
    updated_at: { type: DataTypes? DataTypes.DATE: 'date' }
  }
}
