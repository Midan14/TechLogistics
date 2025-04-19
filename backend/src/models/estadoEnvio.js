// models/EstadoEnvio.js

import { Model } from "sequelize";
import { logInfo } from "../config/logger.js";

export default (sequelize, DataTypes) => {
  class EstadoEnvio extends Model {
    static associate(models) {
      EstadoEnvio.hasMany(models.Pedido, {
        foreignKey: "estadoEnvioId", // Mantiene consistencia con el modelo Pedido
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
        transicionesPermitidas[this.nombre_estado]?.includes(nuevoEstado) ||
        false
      );
    }
  }

  EstadoEnvio.init(
    {
      // Definición de atributos alineada con la estructura de la base de datos
      id_estado: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id_estado", // Mapeo explícito
        comment: "Identificador único del estado de envío",
      },
      nombre_estado: {
        type: DataTypes.STRING(50),
        allowNull: false,
        field: "nombre_estado", // Mapeo explícito
        validate: {
          notNull: { msg: "El nombre del estado es requerido" },
          notEmpty: { msg: "El nombre del estado no puede estar vacío" },
        },
      },
      descripcion: {
        type: DataTypes.STRING(100),
        allowNull: true,
        field: "descripcion",
      },
      color: {
        type: DataTypes.STRING(7),
        allowNull: false,
        field: "color",
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
        field: "orden",
        defaultValue: 0,
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        field: "activo",
        defaultValue: true,
      },
      // Alias para mantener compatibilidad con el código existente
      estado: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.getDataValue("nombre_estado");
        },
        set(value) {
          this.setDataValue("nombre_estado", value);
        },
      },
    },
    {
      sequelize,
      modelName: "EstadoEnvio",
      tableName: "estados_envio", // Nombre CORRECTO de la tabla en la base de datos
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["nombre_estado"],
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
        nombre_estado: "PENDIENTE",
        descripcion: "Pedido registrado",
        color: "#FFA500",
        orden: 1,
      },
      {
        nombre_estado: "PREPARACION",
        descripcion: "En preparación",
        color: "#0000FF",
        orden: 2,
      },
      {
        nombre_estado: "EN_RUTA",
        descripcion: "En ruta de entrega",
        color: "#008000",
        orden: 3,
      },
      {
        nombre_estado: "ENTREGADO",
        descripcion: "Entregado exitosamente",
        color: "#008000",
        orden: 4,
      },
      {
        nombre_estado: "NO_ENTREGADO",
        descripcion: "Entrega fallida",
        color: "#FF0000",
        orden: 5,
      },
      {
        nombre_estado: "CANCELADO",
        descripcion: "Pedido cancelado",
        color: "#FF0000",
        orden: 6,
      },
    ];

    try {
      for (const estado of estadosDefault) {
        await EstadoEnvio.findOrCreate({
          where: { nombre_estado: estado.nombre_estado },
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
        nombre_estado: estado.toUpperCase(),
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
