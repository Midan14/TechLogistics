// models/transportista.js

import { Model } from "sequelize";
import { logError, logInfo } from "../config/logger.js";

export default (sequelize, DataTypes) => {
  class Transportista extends Model {
    static associate(models) {
      Transportista.hasMany(models.Ruta, {
        foreignKey: "transportistaId",
        as: "rutas",
      });

      Transportista.hasMany(models.Pedido, {
        foreignKey: "transportistaId",
        as: "pedidos",
      });
    }

    // Método para verificar si está disponible
    async estaDisponible() {
      if (!this.activo) return false;

      // Verificar si tiene pedidos en proceso
      const pedidosEnProceso = await this.getPedidos({
        where: {
          estado: {
            [sequelize.Op.in]: ["EN_PREPARACION", "EN_RUTA"],
          },
        },
      });

      return pedidosEnProceso.length < this.capacidad_maxima_pedidos;
    }
  }

  Transportista.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        comment: "Identificador único del transportista",
      },
      codigo: {
        type: DataTypes.STRING(20),
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
      apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notNull: { msg: "El apellido es requerido" },
          notEmpty: { msg: "El apellido no puede estar vacío" },
        },
      },
      documento: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          notNull: { msg: "El documento es requerido" },
          notEmpty: { msg: "El documento no puede estar vacío" },
        },
      },
      telefono: {
        type: DataTypes.STRING(15),
        allowNull: false,
        validate: {
          notNull: { msg: "El teléfono es requerido" },
          is: {
            args: /^\+?[0-9]{8,14}$/,
            msg: "Número de teléfono inválido",
          },
        },
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
          isEmail: { msg: "Email inválido" },
        },
      },
      vehiculo: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          notNull: { msg: "El vehículo es requerido" },
          notEmpty: { msg: "El vehículo no puede estar vacío" },
        },
      },
      tipo_vehiculo: {
        type: DataTypes.ENUM("MOTO", "AUTO", "CAMIONETA", "CAMION", "FURGON"),
        allowNull: false,
        defaultValue: "AUTO",
      },
      placa: {
        type: DataTypes.STRING(10),
        allowNull: false,
        validate: {
          notNull: { msg: "La placa es requerida" },
          notEmpty: { msg: "La placa no puede estar vacía" },
        },
      },
      capacidad_carga: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        comment: "Capacidad de carga en kg",
      },
      capacidad_maxima_pedidos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 10,
        validate: {
          isInt: { msg: "Debe ser un número entero" },
          min: {
            args: [1],
            msg: "Debe ser al menos 1",
          },
        },
      },
      activo: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      fecha_licencia: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      observaciones: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Transportista",
      tableName: "Transportistas",
      timestamps: true,
      paranoid: true,
      indexes: [
        {
          unique: true,
          fields: ["codigo"],
        },
        {
          unique: true,
          fields: ["documento"],
        },
        {
          fields: ["activo"],
        },
      ],
      hooks: {
        beforeCreate: async (transportista) => {
          transportista.codigo = transportista.codigo.toUpperCase();
          if (transportista.email) {
            transportista.email = transportista.email.toLowerCase();
          }
        },
        afterCreate: async (transportista) => {
          logInfo("Nuevo transportista registrado", {
            id: transportista.id,
            codigo: transportista.codigo,
            nombre: `${transportista.nombre} ${transportista.apellido}`,
          });
        },
      },
    },
  );

  // Métodos de clase
  Transportista.findByCodigo = async function (codigo) {
    return await this.findOne({
      where: {
        codigo: codigo.toUpperCase(),
        activo: true,
      },
    });
  };

  Transportista.findByDocumento = async function (documento) {
    return await this.findOne({
      where: { documento },
    });
  };

  Transportista.findDisponibles = async function () {
    const transportistas = await this.findAll({
      where: { activo: true },
    });

    const disponibles = [];
    for (const transportista of transportistas) {
      if (await transportista.estaDisponible()) {
        disponibles.push(transportista);
      }
    }

    return disponibles;
  };

  // Métodos de instancia
  Transportista.prototype.activar = async function () {
    this.activo = true;
    await this.save();
    logInfo(`Transportista activado: ${this.codigo}`);
  };

  Transportista.prototype.desactivar = async function () {
    this.activo = false;
    await this.save();
    logInfo(`Transportista desactivado: ${this.codigo}`);
  };

  Transportista.prototype.getNombreCompleto = function () {
    return `${this.nombre} ${this.apellido}`;
  };

  // Scopes comunes
  Transportista.addScope("activos", {
    where: { activo: true },
  });

  Transportista.addScope("conRutas", {
    include: [
      {
        model: sequelize.models.Ruta,
        as: "rutas",
      },
    ],
  });

  Transportista.addScope("conPedidos", {
    include: [
      {
        model: sequelize.models.Pedido,
        as: "pedidos",
      },
    ],
  });

  return Transportista;
};
