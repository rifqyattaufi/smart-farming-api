module.exports = (sequelize, DataTypes) => {
    const Sakit = sequelize.define(
        "Sakit",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false,
                unique: true,
            },
            penyakit: {
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

    Sakit.associate = (models) => {
        Sakit.belongsTo(models.Laporan);
    };

    return Sakit;
}