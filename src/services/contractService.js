// src/services/contractService.js

const Sequelize = require('sequelize');
const { Profile } = require('../model');

class ContractService {
  constructor(models) {
    this.models = models;
  }

  async getContractByIdAndProfile(id, profile) {
    const { Contract } = this.models;

    try {
      const contract = await Contract.findOne({
        where: {
          id,
          [Sequelize.Op.or]: [
            { ContractorId: profile.id },
            { ClientId: profile.id },
          ],
        },
      });
      return contract;
    } catch (error) {
      console.error('Error fetching contract:', error);
      throw new Error('Internal server error');
    }
  }

  async getContractsByProfile(profile) {
    const { Contract } = this.models;

    try {
      const contracts = await Contract.findAll({
        where: {
          [Sequelize.Op.or]: [
            { ContractorId: profile.id },
            { ClientId: profile.id },
          ],
          status: {
            [Sequelize.Op.ne]: 'terminated', // Exclude terminated contracts
          },
        },
      });

      return contracts;
    } catch (error) {
      console.error('Error fetching contracts:', error);
      throw new Error('Internal server error');
    }
  }

}

module.exports = ContractService;
