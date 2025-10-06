import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

// ParkingLot model for managing parking facilities
const ParkingLot = sequelize.define('ParkingLot', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },

  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
  },

  address: {
    type: DataTypes.TEXT,
    allowNull: false,
  },

  total_slots: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
    },
  },

  // Foreign key to admin user who manages this lot
  admin_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
}, {
  tableName: 'parking_lots',
  timestamps: true,
});

// Get available slots count for this lot
ParkingLot.prototype.getAvailableSlots = async function() {
  const { Slot } = sequelize.models;
  return await Slot.count({
    where: {
      lot_id: this.id,
      status: 'Free',
    },
  });
};

// Get occupancy percentage
ParkingLot.prototype.getOccupancyRate = async function() {
  const availableSlots = await this.getAvailableSlots();
  const occupancyRate = ((this.total_slots - availableSlots) / this.total_slots) * 100;
  return Math.round(occupancyRate * 100) / 100; // Round to 2 decimal places
};

// Define model relationships
ParkingLot.associate = (models) => {
  ParkingLot.belongsTo(models.User, {
    foreignKey: 'admin_id',
    as: 'admin',
  });

  ParkingLot.hasMany(models.Slot, {
    foreignKey: 'lot_id',
    as: 'slots',
  });
};

export default ParkingLot;