// const { sequelize } = require(".");
const { Model, DataTypes, Deferrable } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
    
    class Employee extends Model {}

    Employee.init({
        eid: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4, 
            primaryKey: true
        }, 
        userId: {
            type: DataTypes.UUID,
            references: {
                model: 'users',
                key: 'user_id'
            },
            allowNull: false
        }, 
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        },
        salary: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1000
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    }, {
        indexes: [
            {
                name: 'emp_user_name_idx',
                unique: true,
                fields: ['user_id', 'name']
            }
        ],
        sequelize, 
        underscored: true,
        modelName: 'employee'
    });

    return Employee;
}