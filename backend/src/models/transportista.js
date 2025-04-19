// models/Transportista.js

import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Transportista extends Model {
    static associate(models) {
      // Relación con Pedidos
      Transportista.hasMany(models.Pedido, {
        foreignKey: "transportistaId",
        as: "pedidos",
        onDelete: "RESTRICT",
      });

      // Si tienes una relación con rutas (opcional)
      if (models.Ruta) {
        Transportista.belongsToMany(models.Ruta, {
          through: "TransportistaRuta",
          as: "rutas",
          foreignKey: "transportistaId",
        });
      }
    }
  }

  Transportista.init(
    {
      id_transportista: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_transportista",
        comment: "Identificador único del transportista",
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: { msg: "El nombre es requerido" },
        },
      },
      placa: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          notEmpty: { msg: "La placa del vehículo es requerida" },
        },
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          notEmpty: { msg: "El teléfono es requerido" },
        },
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          isEmail: { msg: "Debe ser un email válido" },
        },
      },
      tipo_vehiculo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        defaultValue: "Automóvil",
      },
      capacidad_carga: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: "Capacidad en kilogramos",
        validate: {
          isDecimal: { msg: "Debe ser un número decimal" },
          min: { args: [0], msg: "La capacidad debe ser mayor a 0" },
        },
      },
      disponible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      zona_cobertura: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      calificacion: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: 5.0,
        validate: {
          min: { args: [0], msg: "La calificación mínima es 0" },
          max: { args: [5], msg: "La calificación máxima es 5" },
        },
      },
    },
    {
      sequelize,
      modelName: "Transportista",
      tableName: "transportistas",
      timestamps: true, // Para usar createdAt y updatedAt
    },
  );

  // Métodos estáticos
  Transportista.findDisponibles = async function () {
    return this.findAll({
      where: { disponible: true },
      order: [["calificacion", "DESC"]],
    });
  };

  return Transportista;
};
