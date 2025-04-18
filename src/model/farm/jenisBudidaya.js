module.exports = (sequelize, DataTypes) => {
    const JenisBudaya = sequelize.define(
        "JenisBudaya",
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
            latin : {
                type: DataTypes.STRING,
            },
            tipe : {
                type: DataTypes.ENUM,
                values: ["hewan", "tumbuhan"],
            },
            gambar: {
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

    JenisBudaya.associate = (models) => {
        JenisBudaya.hasMany(models.UnitBudidaya)
        JenisBudaya.hasMany(models.Komoditas)
    };

    return JenisBudaya;
}