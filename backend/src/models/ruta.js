// models/Ruta.js (renombrar el archivo para mantener consistencia)

import { Model } from "sequelize";
import { logError, logInfo } from "../config/logger.js";

export default (sequelize, DataTypes) => {
  class Ruta extends Model {
    static associate(models) {
      Ruta.belongsTo(models.Transportista, {
        foreignKey: "id_transportista", // Cambiado para coincidir con tu esquema
        as: "transportista",
      });

      Ruta.hasMany(models.Pedido, {
        foreignKey: "id_ruta", // Cambiado para coincidir con tu esquema
        as: "pedidos",
      });
    }

    // Método para verificar si la ruta está activa
    estaActiva(hora = new Date()) {
      const horaActual = hora.getHours();
      return horaActual >= this.horario_inicio && horaActual < this.horario_fin;
    }
  }

  Ruta.init(
    {
      id_ruta: {
        // Cambiado para coincidir con tu esquema
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      origen: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notNull: { msg: "El origen es requerido" },
          notEmpty: { msg: "El origen no puede estar vacío" },
        },
      },
      destino: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notNull: { msg: "El destino es requerido" },
          notEmpty: { msg: "El destino no puede estar vacío" },
        },
      },
      distancia: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: "Distancia en kilómetros",
      },
      tiempo_estimado: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      id_transportista: {
        // Cambiado para coincidir con tu esquema
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "transportistas",
          key: "id_transportista",
        },
        validate: {
          notNull: { msg: "El transportista es requerido" },
        },
      },
    },
    {
      sequelize,
      modelName: "Ruta",
      tableName: "rutas", // Cambiado para coincidir con tu esquema
      timestamps: true,
      indexes: [
        {
          fields: ["id_transportista"],
        },
      ],
    },
  );

  // Métodos de clase
  Ruta.findByTransportista = async function (idTransportista) {
    return await this.findAll({
      where: {
        id_transportista: idTransportista,
      },
      include: ["pedidos"],
    });
  };

  // Scopes comunes
  Ruta.addScope("conTransportista", {
    include: [
      {
        model: sequelize.models.Transportista,
        as: "transportista",
      },
    ],
  });

  Ruta.addScope("conPedidos", {
    include: [
      {
        model: sequelize.models.Pedido,
        as: "pedidos",
      },
    ],
  });

  return Ruta;
};
