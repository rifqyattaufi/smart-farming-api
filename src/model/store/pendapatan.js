module.exports = (sequelize, DataTypes) => {
    const Pendapatan = sequelize.define(
        "Pendapatan",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
                unique: true,
            },
            pesananId: {
                type: DataTypes.UUID,
                allowNull: false,
            },
            tokoId: {
                type: DataTypes.UUID,
                allowNull: true,
            },
            harga: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false,
                allowNull: true,
            },
        },
        {
            tableName: "pendapatan",
            freezeTableName: true,
            timestamps: true,
        }
    );

    Pendapatan.associate = (models) => {
        Pendapatan.belongsTo(models.Toko, {
            foreignKey: "tokoId",
            as: "toko",
        });
    };

    return Pendapatan;
};