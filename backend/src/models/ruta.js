// models/ruta.js

import { Model } from "sequelize";
import { logError, logInfo } from "../config/logger.js";

export default (sequelize, DataTypes) => {
  class Ruta extends Model {
    static associate(models) {
      Ruta.belongsTo(models.Transportista, {
        foreignKey: "transportistaId",
        as: "transportista",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      });

      Ruta.hasMany(models.Pedido, {
        foreignKey: "rutaId",
        as: "pedidos",
      });
    }

    // Método para calcular distancia aproximada
    calcularDistancia() {
      // Aquí podrías implementar un cálculo real de distancia
      // usando las coordenadas de origen y destino
      return Math.sqrt(
        Math.pow(this.destino_lat - this.origen_lat, 2) +
          Math.pow(this.destino_lng - this.origen_lng, 2),
      );
    }

    // Método para verificar si la ruta está activa en cierto horario
    estaActiva(hora = new Date()) {
      const horaActual = hora.getHours();
      return horaActual >= this.horario_inicio && horaActual < this.horario_fin;
    }
  }

  Ruta.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: "Identificador único de la ruta",
      },
      codigo: {
        type: DataTypes.STRING(20),
        allowNull: false,
        unique: {
          msg: "El código de ruta ya existe",
        },
        validate: {
          notNull: { msg: "El código es requerido" },
          notEmpty: { msg: "El código no puede estar vacío" },
        },
      },
      origen: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: { msg: "El origen es requerido" },
          notEmpty: { msg: "El origen no puede estar vacío" },
        },
      },
      origen_lat: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        validate: {
          isDecimal: { msg: "Latitud debe ser un número válido" },
          min: { args: [-90], msg: "Latitud mínima es -90" },
          max: { args: [90], msg: "Latitud máxima es 90" },
        },
      },
      origen_lng: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        validate: {
          isDecimal: { msg: "Longitud debe ser un número válido" },
          min: { args: [-180], msg: "Longitud mínima es -180" },
          max: { args: [180], msg: "Longitud máxima es 180" },
        },
      },
      destino: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: { msg: "El destino es requerido" },
          notEmpty: { msg: "El destino no puede estar vacío" },
        },
      },
      destino_lat: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
        validate: {
          isDecimal: { msg: "Latitud debe ser un número válido" },
          min: { args: [-90], msg: "Latitud mínima es -90" },
          max: { args: [90], msg: "Latitud máxima es 90" },
        },
      },
      destino_lng: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
        validate: {
          isDecimal: { msg: "Longitud debe ser un número válido" },
          min: { args: [-180], msg: "Longitud mínima es -180" },
          max: { args: [180], msg: "Longitud máxima es 180" },
        },
      },
      distancia: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: "Distancia en kilómetros",
      },
      tiempo_estimado: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: "Tiempo estimado en minutos",
      },
      horario_inicio: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 8,
        validate: {
          min: { args: [0], msg: "Hora mínima es 0" },
          max: { args: [23], msg: "Hora máxima es 23" },
        },
      },
      horario_fin: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 18,
        validate: {
          min: { args: [0], msg: "Hora mínima es 0" },
          max: { args: [23], msg: "Hora máxima es 23" },
        },
      },
      transportistaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "Transportistas",
          key: "id",
        },
        validate: {
          notNull: { msg: "El transportista es requerido" },
        },
      },
      activa: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Ruta",
      tableName: "Rutas",
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["codigo"],
        },
        {
          fields: ["transportistaId"],
        },
        {
          fields: ["activa"],
        },
      ],
      hooks: {
        beforeCreate: async (ruta) => {
          ruta.codigo = ruta.codigo.toUpperCase();
        },
        afterCreate: async (ruta) => {
          logInfo("Nueva ruta creada", {
            rutaId: ruta.id,
            codigo: ruta.codigo,
            origen: ruta.origen,
            destino: ruta.destino,
          });
        },
      },
    },
  );

  // Métodos de clase
  Ruta.findByCodigo = async function (codigo) {
    return await this.findOne({
      where: {
        codigo: codigo.toUpperCase(),
        activa: true,
      },
    });
  };

  Ruta.findByTransportista = async function (transportistaId) {
    return await this.findAll({
      where: {
        transportistaId,
        activa: true,
      },
    });
  };

  // Scopes comunes
  Ruta.addScope("activas", {
    where: { activa: true },
  });

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
