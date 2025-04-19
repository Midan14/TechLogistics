// models/Cliente.js

import { Model } from "sequelize";
import { logError } from "../config/logger.js";

export default (sequelize, DataTypes) => {
  class Cliente extends Model {
    // Métodos estáticos para asociaciones
    static associate(models) {
      Cliente.hasMany(models.Pedido, {
        foreignKey: "id_cliente",
        as: "pedidos",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      });
    }

    // Método para obtener el nombre completo
    getNombreCompleto() {
      return `${this.nombre} ${this.apellido}`;
    }

    // Método para obtener resumen de pedidos
    async getResumenPedidos() {
      try {
        const pedidos = await this.getPedidos();
        return {
          total: pedidos.length,
          completados: pedidos.filter((p) => p.estado === "ENTREGADO").length,
          pendientes: pedidos.filter((p) => p.estado === "PENDIENTE").length,
        };
      } catch (error) {
        logError("Error al obtener resumen de pedidos", error);
        throw error;
      }
    }
  }

  Cliente.init(
    {
      id_cliente: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: "Identificador único del cliente",
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: { msg: "El nombre es requerido" },
          notEmpty: { msg: "El nombre no puede estar vacío" },
          len: {
            args: [2, 100],
            msg: "El nombre debe tener entre 2 y 100 caracteres",
          },
        },
      },
      correo: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: {
          msg: "Este correo ya está registrado",
        },
        validate: {
          notNull: { msg: "El correo es requerido" },
          isEmail: { msg: "Debe proporcionar un correo válido" },
          normalizeEmail(value) {
            this.setDataValue("correo", value.toLowerCase().trim());
          },
        },
      },
      direccion: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notNull: { msg: "La dirección es requerida" },
          len: {
            args: [5, 255],
            msg: "La dirección debe tener entre 5 y 255 caracteres",
          },
        },
      },
      telefono: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          notNull: { msg: "El teléfono es requerido" },
          is: {
            args: /^\+?[0-9]{8,14}$/,
            msg: "Número de teléfono inválido",
          },
        },
      },
      estado: {
        type: DataTypes.ENUM("ACTIVO", "INACTIVO"),
        defaultValue: "ACTIVO",
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Cliente",
      tableName: "clientes",
      timestamps: true,
      paranoid: true, // Soft deletes
      indexes: [
        {
          unique: true,
          fields: ["correo"],
        },
        {
          fields: ["estado"],
        },
      ],
      hooks: {
        beforeCreate: async (cliente) => {
          cliente.correo = cliente.correo.toLowerCase().trim();
        },
        beforeUpdate: async (cliente) => {
          if (cliente.changed("correo")) {
            cliente.correo = cliente.correo.toLowerCase().trim();
          }
        },
      },
    },
  );

  // Métodos de clase
  Cliente.findByEmail = async function (correo) {
    return await this.findOne({
      where: { correo: correo.toLowerCase() },
    });
  };

  // Métodos de instancia
  Cliente.prototype.activar = async function () {
    this.estado = "ACTIVO";
    await this.save();
  };

  Cliente.prototype.desactivar = async function () {
    this.estado = "INACTIVO";
    await this.save();
  };

  // Scopes
  Cliente.addScope("activos", {
    where: { estado: "ACTIVO" },
  });

  Cliente.addScope("conPedidos", {
    include: [
      {
        model: sequelize.models.Pedido,
        as: "pedidos",
      },
    ],
  });

  return Cliente;
};
