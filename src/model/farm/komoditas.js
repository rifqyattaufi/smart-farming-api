module.exports = (sequelize, DataTypes) => {
    const Komoditas = sequelize.define(
        "Komoditas",
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
            gambar: {
                type: DataTypes.STRING,
            },
            jumlah: {
                type: DataTypes.DOUBLE,
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
            },
        },
        {
            tableName: "komoditas",
            freezeTableName: true,
        }
    );

    Komoditas.associate = (models) => {
        Komoditas.hasMany(models.Panen);

        Komoditas.belongsTo(models.Satuan);
        Komoditas.belongsTo(models.JenisBudidaya);
    };

    return Komoditas;
}