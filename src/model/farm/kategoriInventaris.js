module.exports = (sequelize, DataTypes) => {
    const KategoriInventaris = sequelize.define(
        "KategoriInventaris",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
                unique: true,
            },
            nama: {
                type: DataTypes.STRING,
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            freezeTableName: true,
        }
    );
    
    KategoriInventaris.associate = (models) => {
        KategoriInventaris.hasMany(models.Inventaris);
    };

    return KategoriInventaris;
}