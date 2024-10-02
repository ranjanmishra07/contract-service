// src/services/jobService.js

const Sequelize = require('sequelize');
const { Job, Profile, Contract, sequelize } = require('../model');
class JobService {
    async payForJob(jobId, clientId) {
        const transaction = await sequelize.transaction();

        try {
            // Find the job and associated contract
            const job = await Job.findOne({
                where: { ContractId: jobId },
                include: [
                    {
                        model: Contract,
                        include: [
                            {
                                model: Profile,
                                as: 'Client' // Include the client who pays
                            },
                            {
                                model: Profile,
                                as: 'Contractor' // Include the contractor who receives payment
                            }
                        ]
                    }
                ],
                transaction
            });

            if (!job) {
                throw new Error('Job not found');
            }

            const contract = job.Contract;
            const client = contract.Client; // The client who is paying
            const contractor = contract.Contractor; // The contractor who will receive payment

            // Validate payment
            if (client.id !== clientId) {
                throw new Error('You are not authorized to pay for this job');
            }
            if (client.balance < job.price) {
                throw new Error('Insufficient balance to pay for the job');
            }

            // Update balances
            await client.update({ balance: client.balance - job.price }, { transaction });
            await contractor.update({ balance: contractor.balance + job.price }, { transaction });

            await job.update({ paid: true, paymentDate: new Date() }, { transaction });

            await transaction.commit();
            return { success: true, message: 'Payment successful' };
        } catch (error) {
            await transaction.rollback();
            throw error;
        }
    }

    async getUnpaidJobsByProfile(profile) {
        try {
            const unpaidJobs = await Job.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        { paid: { [Sequelize.Op.is]: null } },
                        { paid: false }
                    ]
                },
                include: [{
                    model: Contract,
                    where: {
                        [Sequelize.Op.or]: [
                            { ContractorId: profile.id },
                            { ClientId: profile.id },
                        ],
                        status: 'in_progress',
                    },
                }],
            });

            return unpaidJobs;
        } catch (error) {
            console.error('Error fetching unpaid jobs:', error);
            throw new Error('Internal server error');
        }
    }

    static async depositToBalance(depositor, userId) {
        const transaction = await sequelize.transaction();
        try {
            // Fetch the recipient's profile (userId)
            const recipient = await Profile.findByPk(userId);
            if (!recipient) {
                throw new Error('Recipient not found');
            }

            // Calculate the total amount of unpaid jobs for the client
            const unpaidJobs = await Job.findAll({
                where: {
                    [Sequelize.Op.or]: [
                        { paid: { [Sequelize.Op.is]: null } },
                        { paid: false }
                    ]
                },
                include: [{
                    model: Contract,
                    where: {
                        [Sequelize.Op.or]: [
                            { ContractorId: userId },
                            { ClientId: userId },
                        ],
                        status: 'in_progress',
                    },
                }],
            });
            const totalUnpaid = unpaidJobs.reduce((sum, job) => sum + job.price, 0);
            const depositAmount = totalUnpaid * 0.25; // 25% of the total unpaid jobs
            // Ensure that the deposit amount is valid
            if (depositAmount <= 0 && depositor.balance <= depositAmount) {
                throw new Error('No unpaid jobs to calculate deposit from');
            }

            // Perform the balance update
            await depositor.update({ balance: depositor.balance - depositAmount }, { transaction });
            await recipient.update({ balance: recipient.balance + depositAmount }, { transaction });
            await transaction.commit();
            return { success: true, message: 'Deposit successful', depositAmount };
        } catch (error) {
            console.error(error);
            transaction.rollback();
            throw error;
        }
    }
}

module.exports = JobService;
