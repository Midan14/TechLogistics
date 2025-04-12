// models/cliente.js

import { Model } from 'sequelize';
import { logError } from '../config/logger.js';

export default (sequelize, DataTypes) => {
  class Cliente extends Model {
    // Métodos estáticos para asociaciones
    static associate(models) {
      Cliente.hasMany(models.Pedido, {
        foreignKey: 'clienteId',
        as: 'pedidos',
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE'
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
          completados: pedidos.filter(p => p.estado === 'COMPLETADO').length,
          pendientes: pedidos.filter(p => p.estado === 'PENDIENTE').length
        };
      } catch (error) {
        logError('Error al obtener resumen de pedidos', error);
        throw error;
      }
    }
  }

  Cliente.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      comment: 'Identificador único del cliente'
    },
    nombre: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: 'El nombre es requerido' },
        notEmpty: { msg: 'El nombre no puede estar vacío' },
        len: {
          args: [2, 100],
          msg: 'El nombre debe tener entre 2 y 100 caracteres'
        }
      }
    },
    apellido: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        notNull: { msg: 'El apellido es requerido' },
        notEmpty: { msg: 'El apellido no puede estar vacío' },
        len: {
          args: [2, 100],
          msg: 'El apellido debe tener entre 2 y 100 caracteres'
        }
      }
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: {
        msg: 'Este email ya está registrado'
      },
      validate: {
        notNull: { msg: 'El email es requerido' },
        isEmail: { msg: 'Debe proporcionar un email válido' },
        normalizeEmail(value) {
          this.email = value.toLowerCase().trim();
        }
      }
    },
    telefono: {
      type: DataTypes.STRING(15),
      allowNull: false,
      validate: {
        notNull: { msg: 'El teléfono es requerido' },
        is: {
          args: /^\+?[0-9]{8,14}$/,
          msg: 'Número de teléfono inválido'
        }
      }
    },
    direccion: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        len: {
          args: [5, 255],
          msg: 'La dirección debe tener entre 5 y 255 caracteres'
        }
      }
    },
    estado: {
      type: DataTypes.ENUM('ACTIVO', 'INACTIVO'),
      defaultValue: 'ACTIVO',
      allowNull: false
    },
    ultimaCompra: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    modelName: 'Cliente',
    tableName: 'Clientes',
    timestamps: true,
    paranoid: true, // Soft deletes
    indexes: [
      {
        unique: true,
        fields: ['email']
      },
      {
        fields: ['estado']
      }
    ],
    hooks: {
      beforeCreate: async (cliente) => {
        cliente.email = cliente.email.toLowerCase().trim();
      },
      beforeUpdate: async (cliente) => {
        if (cliente.changed('email')) {
          cliente.email = cliente.email.toLowerCase().trim();
        }
      },
      afterCreate: async (cliente) => {
        // Aquí podrías enviar un email de bienvenida
        console.log(`Cliente creado: ${cliente.email}`);
      }
    }
  });

  // Métodos de clase
  Cliente.findByEmail = async function(email) {
    return await this.findOne({
      where: { email: email.toLowerCase() }
    });
  };

  // Métodos de instancia
  Cliente.prototype.activar = async function() {
    this.estado = 'ACTIVO';
    await this.save();
  };

  Cliente.prototype.desactivar = async function() {
    this.estado = 'INACTIVO';
    await this.save();
  };

  Cliente.prototype.actualizarUltimaCompra = async function() {
    this.ultimaCompra = new Date();
    await this.save();
  };

  // Scopes
  Cliente.addScope('activos', {
    where: { estado: 'ACTIVO' }
  });

  Cliente.addScope('conPedidos', {
    include: [{
      model: sequelize.models.Pedido,
      as: 'pedidos'
    }]
  });

  return Cliente;
