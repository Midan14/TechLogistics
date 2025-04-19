// src/models/Pedido.js

import { Model } from "sequelize";
import { logError, logInfo } from "../config/logger.js";

export default (sequelize, DataTypes) => {
  class Pedido extends Model {
    static associate(models) {
      // Verificar que todos los modelos necesarios existan
      const requiredModels = [
        "Cliente",
        "Producto",
        "Transportista",
        "Ruta",
        "EstadoEnvio",
      ];
      const missingModels = requiredModels.filter(
        (modelName) => !models[modelName],
      );

      if (missingModels.length > 0) {
        logError(
          `Modelos faltantes para las asociaciones de Pedido: ${missingModels.join(", ")}`,
        );
        return;
      }

      try {
        // Cliente
        Pedido.belongsTo(models.Cliente, {
          foreignKey: "id_cliente",
          as: "cliente",
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        });

        // Producto
        Pedido.belongsTo(models.Producto, {
          foreignKey: "id_producto",
          as: "producto",
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        });

        // Transportista
        Pedido.belongsTo(models.Transportista, {
          foreignKey: "id_transportista",
          as: "transportista",
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        });

        // Ruta
        Pedido.belongsTo(models.Ruta, {
          foreignKey: "id_ruta",
          as: "ruta",
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        });

        // EstadoEnvio
        Pedido.belongsTo(models.EstadoEnvio, {
          foreignKey: "id_estado",
          as: "estadoEnvio",
          onDelete: "RESTRICT",
          onUpdate: "CASCADE",
        });

        logInfo("Asociaciones de Pedido establecidas correctamente");
      } catch (error) {
        logError("Error al establecer asociaciones de Pedido:", error);
        throw error;
      }
    }

    // Método para calcular el total del pedido
    async calcularTotal() {
      try {
        const producto = await this.getProducto();
        if (!producto) {
          throw new Error("Producto no encontrado");
        }
        return this.cantidad * producto.precio;
      } catch (error) {
        logError("Error al calcular total del pedido:", error);
        throw error;
      }
    }

    // Método para verificar si el pedido puede ser cancelado
    async puedeSerCancelado() {
      const estadoActual = await this.getEstadoEnvio();
      return ["PENDIENTE", "EN_PREPARACION"].includes(
        estadoActual?.nombre_estado,
      );
    }
  }

  Pedido.init(
    {
      id_pedido: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: "Identificador único del pedido",
      },
      id_cliente: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "clientes",
          key: "id_cliente",
        },
        validate: {
          notNull: { msg: "El cliente es requerido" },
        },
      },
      id_producto: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "productos",
          key: "id_producto",
        },
        validate: {
          notNull: { msg: "El producto es requerido" },
        },
      },
      cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          notNull: { msg: "La cantidad es requerida" },
          isInt: { msg: "La cantidad debe ser un número entero" },
          min: {
            args: [1],
            msg: "La cantidad debe ser mayor a 0",
          },
        },
      },
      id_transportista: {
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
      id_estado: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "estados_envio",
          key: "id_estado",
        },
        validate: {
          notNull: { msg: "El estado es requerido" },
        },
      },
      id_ruta: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "rutas",
          key: "id_ruta",
        },
        validate: {
          notNull: { msg: "La ruta es requerida" },
        },
      },
      fecha_pedido: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          notNull: { msg: "La fecha del pedido es requerida" },
          isDate: { msg: "Formato de fecha inválido" },
        },
      },
    },
    {
      sequelize,
      modelName: "Pedido",
      tableName: "pedidos",
      timestamps: true,
      indexes: [
        {
          fields: ["fecha_pedido"],
        },
        {
          fields: ["id_cliente"],
        },
        {
          fields: ["id_transportista"],
        },
        {
          fields: ["id_estado"],
        },
      ],
      hooks: {
        beforeCreate: async (pedido) => {
          pedido.fecha_pedido = pedido.fecha_pedido || new Date();
        },
        afterCreate: async (pedido) => {
          logInfo("Nuevo pedido creado", {
            pedidoId: pedido.id_pedido,
            cliente: pedido.id_cliente,
          });
        },
      },
    },
  );

  // Métodos de clase
  Pedido.findByCliente = async function (idCliente) {
    return await this.findAll({
      where: { id_cliente: idCliente },
      include: ["producto", "estadoEnvio"],
    });
  };

  // Scopes comunes
  Pedido.addScope("pendientes", {
    where: {
      id_estado: 1, // ID del estado PENDIENTE
    },
  });

  Pedido.addScope("enProceso", {
    where: {
      id_estado: {
        [sequelize.Sequelize.Op.in]: [2, 3], // IDs de estados EN_PREPARACION y EN_RUTA
      },
    },
  });

  Pedido.addScope("completos", {
    where: {
      id_estado: 4, // ID del estado ENTREGADO
    },
  });

  Pedido.addScope("conDetalles", {
    include: [
      { model: sequelize.models.Cliente, as: "cliente" },
      { model: sequelize.models.Producto, as: "producto" },
      { model: sequelize.models.Transportista, as: "transportista" },
      { model: sequelize.models.Ruta, as: "ruta" },
      { model: sequelize.models.EstadoEnvio, as: "estadoEnvio" },
    ],
  });

  return Pedido;
};
