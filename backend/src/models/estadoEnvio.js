// models/estadoEnvio.js

import { Model } from "sequelize";
import { logInfo } from "../config/logger.js";

export default (sequelize, DataTypes) => {
  class EstadoEnvio extends Model {
    static associate(models) {
      EstadoEnvio.hasMany(models.Pedido, {
        foreignKey: "idEstadoEnvio",
        sourceKey: "idEstadoEnvio",
        as: "pedidos",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      });
    }

    // Método para verificar si el cambio de estado es válido
    puedeTransicionarA(nuevoEstado) {
      const transicionesPermitidas = {
        PENDIENTE: ["PREPARACION", "CANCELADO"],
        PREPARACION: ["EN_RUTA", "CANCELADO"],
        EN_RUTA: ["ENTREGADO", "NO_ENTREGADO"],
        ENTREGADO: [],
        NO_ENTREGADO: ["EN_RUTA"],
        CANCELADO: [],
      };

      return (
        transicionesPermitidas[this.estado]?.includes(nuevoEstado) || false
      );
    }
  }

  EstadoEnvio.init(
    {
      idEstadoEnvio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: "Identificador único del estado de envío",
      },
      estado: {
        type: DataTypes.ENUM(
          "PENDIENTE",
          "PREPARACION",
          "EN_RUTA",
          "ENTREGADO",
          "NO_ENTREGADO",
          "CANCELADO",
        ),
        allowNull: false,
        validate: {
          notNull: { msg: "El estado es requerido" },
          isIn: {
            args: [
              [
                "PENDIENTE",
                "PREPARACION",
                "EN_RUTA",
                "ENTREGADO",
                "NO_ENTREGADO",
                "CANCELADO",
              ],
            ],
            msg: "Estado no válido",
          },
        },
      },
      descripcion: {
        type: DataTypes.STRING(100),
        allowNull: true,
      },
      color: {
        type: DataTypes.STRING(7),
        allowNull: false,
        defaultValue: "#000000",
        validate: {
          is: {
            args: /^#[0-9A-Fa-f]{6}$/,
            msg: "Color debe ser un código hexadecimal válido (ej: #FF0000)",
          },
        },
      },
      orden: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "EstadoEnvio",
      tableName: "estado",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["estado"],
        },
      ],
    },
  );

  // Estados predefinidos
  EstadoEnvio.ESTADOS = {
    PENDIENTE: "PENDIENTE",
    PREPARACION: "PREPARACION",
    EN_RUTA: "EN_RUTA",
    ENTREGADO: "ENTREGADO",
    NO_ENTREGADO: "NO_ENTREGADO",
    CANCELADO: "CANCELADO",
  };

  // Método para inicializar estados por defecto
  EstadoEnvio.inicializarEstados = async function () {
    const estadosDefault = [
      {
        estado: "PENDIENTE",
        descripcion: "Pedido registrado",
        color: "#FFA500",
        orden: 1,
      },
      {
        estado: "PREPARACION",
        descripcion: "En preparación",
        color: "#0000FF",
        orden: 2,
      },
      {
        estado: "EN_RUTA",
        descripcion: "En ruta de entrega",
        color: "#008000",
        orden: 3,
      },
      {
        estado: "ENTREGADO",
        descripcion: "Entregado exitosamente",
        color: "#008000",
        orden: 4,
      },
      {
        estado: "NO_ENTREGADO",
        descripcion: "Entrega fallida",
        color: "#FF0000",
        orden: 5,
      },
      {
        estado: "CANCELADO",
        descripcion: "Pedido cancelado",
        color: "#FF0000",
        orden: 6,
      },
    ];

    try {
      for (const estado of estadosDefault) {
        await EstadoEnvio.findOrCreate({
          where: { estado: estado.estado },
          defaults: estado,
        });
      }
      logInfo("Estados de envío inicializados correctamente");
    } catch (error) {
      console.error("Error al inicializar estados:", error);
      throw error;
    }
  };

  // Métodos de clase
  EstadoEnvio.findByEstado = async function (estado) {
    return await this.findOne({
      where: {
        estado: estado.toUpperCase(),
        activo: true,
      },
    });
  };

  // Scopes comunes
  EstadoEnvio.addScope("activos", {
    where: { activo: true },
  });

  EstadoEnvio.addScope("ordenados", {
    order: [["orden", "ASC"]],
  });

  return EstadoEnvio;
};
