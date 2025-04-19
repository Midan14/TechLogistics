// src/models/Producto.js

import { Model } from "sequelize";
import { logInfo } from "../config/logger.js";

export default (sequelize, DataTypes) => {
  class Producto extends Model {
    static associate(models) {
      Producto.hasMany(models.Pedido, {
        foreignKey: "id_producto",
        as: "pedidos",
        onDelete: "RESTRICT",
        onUpdate: "CASCADE",
      });
    }

    // Método para verificar stock disponible
    async verificarStock(cantidad) {
      return this.stock >= cantidad;
    }

    // Método para actualizar stock
    async actualizarStock(cantidad, tipo = "RESTAR") {
      try {
        const stockAnterior = this.stock;

        if (tipo === "SUMAR") {
          this.stock += cantidad;
        } else {
          if (this.stock < cantidad) {
            throw new Error("Stock insuficiente");
          }
          this.stock -= cantidad;
        }

        await this.save();

        logInfo("Stock actualizado", {
          productoId: this.id_producto,
          stockAnterior,
          stockNuevo: this.stock,
          tipo,
        });
      } catch (error) {
        throw new Error(`Error al actualizar stock: ${error.message}`);
      }
    }
  }

  Producto.init(
    {
      id_producto: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: "Identificador único del producto",
      },
      nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: { msg: "El nombre es requerido" },
          notEmpty: { msg: "El nombre no puede estar vacío" },
          len: {
            args: [3, 100],
            msg: "El nombre debe tener entre 3 y 100 caracteres",
          },
        },
      },
      descripcion: {
        type: DataTypes.TEXT,
        allowNull: true,
        validate: {
          len: {
            args: [0, 500],
            msg: "La descripción no puede exceder los 500 caracteres",
          },
        },
      },
      precio: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
          notNull: { msg: "El precio es requerido" },
          isDecimal: { msg: "El precio debe ser un número válido" },
          min: {
            args: [0],
            msg: "El precio no puede ser negativo",
          },
        },
        get() {
          const value = this.getDataValue("precio");
          return value ? parseFloat(value) : null;
        },
      },
      stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
          isInt: { msg: "El stock debe ser un número entero" },
          min: {
            args: [0],
            msg: "El stock no puede ser negativo",
          },
        },
      },
    },
    {
      sequelize,
      modelName: "Producto",
      tableName: "productos",
      timestamps: true,
      indexes: [
        {
          fields: ["nombre"],
        },
      ],
      hooks: {
        beforeValidate: (producto) => {
          if (producto.nombre) {
            producto.nombre = producto.nombre.trim();
          }
        },
      },
    },
  );

  // Métodos de clase
  Producto.findByNombre = async function (nombre) {
    return await this.findOne({
      where: { nombre: nombre.trim() },
    });
  };

  // Scopes comunes
  Producto.addScope("conStock", {
    where: {
      stock: {
        [sequelize.Sequelize.Op.gt]: 0,
      },
    },
  });

  Producto.addScope("completo", {
    include: [
      {
        model: sequelize.models.Pedido,
        as: "pedidos",
      },
    ],
  });

  return Producto;
};
