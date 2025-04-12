// models/pedido.js

import { Model } from "sequelize";
import { logError, logInfo } from "../config/logger.js";

export default (sequelize, DataTypes) => {
  class Pedido extends Model {
    static associate(models) {
      Pedido.belongsTo(models.Cliente, {
        foreignKey: "clienteId",
        targetKey: "id",
        as: "cliente",
      });

      Pedido.belongsTo(models.Producto, {
        foreignKey: "productoId",
        targetKey: "id",
        as: "producto",
      });

      Pedido.belongsTo(models.Transportista, {
        foreignKey: "transportistaId",
        targetKey: "id",
        as: "transportista",
      });

      Pedido.belongsTo(models.Ruta, {
        foreignKey: "rutaId",
        targetKey: "id",
        as: "ruta",
      });

      Pedido.belongsTo(models.EstadoEnvio, {
        foreignKey: "estadoEnvioId",
        targetKey: "idEstadoEnvio",
        as: "estadoEnvio",
      });
    }

    // Método para calcular el total del pedido
    async calcularTotal() {
      const producto = await this.getProducto();
      return this.cantidad * producto.precio;
    }

    // Método para verificar si se puede cancelar
    puedeSerCancelado() {
      const estadosPermitidos = ["PENDIENTE", "EN_PREPARACION"];
      return estadosPermitidos.includes(this.estado);
    }
  }

  Pedido.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: "id",
      },
      fechaPedido: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        validate: {
          notNull: { msg: "La fecha del pedido es requerida" },
          isDate: { msg: "Formato de fecha inválido" },
        },
      },
      estado: {
        type: DataTypes.ENUM(
          "PENDIENTE",
          "EN_PREPARACION",
          "EN_RUTA",
          "ENTREGADO",
          "CANCELADO",
        ),
        allowNull: false,
        defaultValue: "PENDIENTE",
        validate: {
          isIn: {
            args: [
              [
                "PENDIENTE",
                "EN_PREPARACION",
                "EN_RUTA",
                "ENTREGADO",
                "CANCELADO",
              ],
            ],
            msg: "Estado no válido",
          },
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
      clienteId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "idCliente",
        validate: {
          notNull: { msg: "El cliente es requerido" },
        },
      },
      productoId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "idProducto",
        validate: {
          notNull: { msg: "El producto es requerido" },
        },
      },
      transportistaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "idTransportista",
        validate: {
          notNull: { msg: "El transportista es requerido" },
        },
      },
      rutaId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "idRuta",
        validate: {
          notNull: { msg: "La ruta es requerida" },
        },
      },
      estadoEnvioId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        field: "idEstadoEnvio",
        validate: {
          notNull: { msg: "El estado de envío es requerido" },
        },
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      fechaEntregaEstimada: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      fechaEntregaReal: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      totalPedido: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Pedido",
      tableName: "Pedidos",
      timestamps: true, // Agregamos timestamps para auditoría
      paranoid: true, // Soft deletes
      indexes: [
        {
          fields: ["fechaPedido"],
        },
        {
          fields: ["estado"],
        },
        {
          fields: ["clienteId"],
        },
        {
          fields: ["transportistaId"],
        },
      ],
      hooks: {
        beforeCreate: async (pedido) => {
          pedido.fechaPedido = pedido.fechaPedido || new Date();
        },
        afterCreate: async (pedido) => {
          logInfo("Nuevo pedido creado", {
            pedidoId: pedido.id,
            cliente: pedido.clienteId,
          });
        },
        beforeUpdate: async (pedido) => {
          if (pedido.changed("estado")) {
            logInfo("Cambio de estado en pedido", {
              pedidoId: pedido.id,
              estadoAnterior: pedido._previousDataValues.estado,
              estadoNuevo: pedido.estado,
            });
          }
        },
      },
    },
  );

  // Métodos de clase
  Pedido.findByCliente = async function (clienteId) {
    return await this.findAll({
      where: { clienteId },
      include: ["producto", "estadoEnvio"],
    });
  };

  // Métodos de instancia
  Pedido.prototype.actualizarEstado = async function (
    nuevoEstado,
    observaciones = null,
  ) {
    const estadoAnterior = this.estado;
    this.estado = nuevoEstado;
    if (observaciones) {
      this.observaciones = this.observaciones
        ? `${this.observaciones}\n${observaciones}`
        : observaciones;
    }

    if (nuevoEstado === "ENTREGADO") {
      this.fechaEntregaReal = new Date();
    }

    await this.save();

    logInfo("Estado de pedido actualizado", {
      pedidoId: this.id,
      estadoAnterior,
      estadoNuevo: nuevoEstado,
    });
  };

  // Scopes útiles
  Pedido.addScope("pendientes", {
    where: { estado: "PENDIENTE" },
  });

  Pedido.addScope("enProceso", {
    where: {
      estado: ["EN_PREPARACION", "EN_RUTA"],
    },
  });

  Pedido.addScope("completos", {
    where: { estado: "ENTREGADO" },
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
