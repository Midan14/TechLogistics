// models/producto.js

import { Model } from "sequelize";
import { logError, logInfo } from "../config/logger.js";

export default (sequelize, DataTypes) => {
  class Producto extends Model {
    static associate(models) {
      Producto.hasMany(models.Pedido, {
        foreignKey: "productoId",
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
      const stockAnterior = this.stock;

      if (tipo === "SUMAR") {
        this.stock += cantidad;
      } else {
        if (this.stock < cantidad) {
          throw new Error("Stock insuficiente");
        }
        this.stock -= cantidad;
      }

      if (this.stock <= this.stockMinimo) {
        logInfo("Alerta de stock bajo", {
          productoId: this.id,
          nombre: this.nombre,
          stockActual: this.stock,
          stockMinimo: this.stockMinimo,
        });
      }

      await this.save();

      logInfo("Stock actualizado", {
        productoId: this.id,
        stockAnterior,
        stockNuevo: this.stock,
        tipo,
      });
    }
  }

  Producto.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: "Identificador único del producto",
      },
      codigo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: {
          msg: "El código ya existe",
        },
        validate: {
          notNull: { msg: "El código es requerido" },
          notEmpty: { msg: "El código no puede estar vacío" },
        },
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
      stockMinimo: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 5,
        validate: {
          isInt: { msg: "El stock mínimo debe ser un número entero" },
          min: {
            args: [0],
            msg: "El stock mínimo no puede ser negativo",
          },
        },
      },
      categoria: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      imagen: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isUrl: {
            msg: "Debe ser una URL válida",
          },
        },
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "Producto",
      tableName: "Productos",
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["codigo"],
        },
        {
          fields: ["categoria"],
        },
        {
          fields: ["activo"],
        },
      ],
      hooks: {
        beforeCreate: async (producto) => {
          producto.codigo = producto.codigo.toUpperCase();
        },
        afterCreate: async (producto) => {
          logInfo("Nuevo producto creado", {
            productoId: producto.id,
            codigo: producto.codigo,
            nombre: producto.nombre,
          });
        },
      },
    },
  );

  // Métodos de clase
  Producto.findByCodigo = async function (codigo) {
    return await this.findOne({
      where: {
        codigo: codigo.toUpperCase(),
        activo: true,
      },
    });
  };

  Producto.findByCategoria = async function (categoria) {
    return await this.findAll({
      where: {
        categoria,
        activo: true,
      },
    });
  };

  // Scopes comunes
  Producto.addScope("activos", {
    where: { activo: true },
  });

  Producto.addScope("conStock", {
    where: {
      stock: {
        [sequelize.Op.gt]: 0,
      },
    },
  });

  Producto.addScope("stockBajo", {
    where: sequelize.literal("stock <= stockMinimo"),
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
