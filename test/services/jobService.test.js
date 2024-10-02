const { sequelize, Job } = require('../../src/model');
const JobService = require('../../src/services/jobService');

// Setup mock database
jest.mock('../../src/model', () => ({
    sequelize: {
        transaction: jest.fn()
    },
    Job: {
        findOne: jest.fn(),
        update: jest.fn()
    },
    Profile: {
        update: jest.fn()
    },
    Contract: jest.fn()
}));

describe('JobService', () => {
    let jobService;
    let transaction;

    beforeEach(() => {
        jobService = new JobService();

        // Mock the transaction object
        transaction = {
            commit: jest.fn(),
            rollback: jest.fn(),
        };
        sequelize.transaction.mockResolvedValue(transaction);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('payForJob', () => {
        const jobId = 1;
        const clientId = 1;
        const mockJob = {
            Contract: {
                Client: { id: 1, balance: 1000, update: jest.fn() },
                Contractor: { id: 2, balance: 500, update: jest.fn() }
            },
            price: 200,
            update: jest.fn()
        };

        it('should pay for the job successfully', async () => {
            Job.findOne.mockResolvedValue(mockJob);

            const result = await jobService.payForJob(jobId, clientId);

            // Assertions for the service behavior
            expect(Job.findOne).toHaveBeenCalledWith({
                where: { ContractId: jobId },
                include: expect.any(Array),
                transaction
            });
            expect(mockJob.Contract.Client.update).toHaveBeenCalledWith(
                { balance: 800 },
                { transaction }
            );
            expect(mockJob.Contract.Contractor.update).toHaveBeenCalledWith(
                { balance: 700 },
                { transaction }
            );
            expect(mockJob.update).toHaveBeenCalledWith(
                { paid: true, paymentDate: expect.any(Date) },
                { transaction }
            );
            expect(transaction.commit).toHaveBeenCalled();
            expect(result).toEqual({ success: true, message: 'Payment successful' });
        });

        it('should throw error if job not found', async () => {
            Job.findOne.mockResolvedValue(null);

            await expect(jobService.payForJob(jobId, clientId)).rejects.toThrow('Job not found');
            expect(transaction.rollback).toHaveBeenCalled();
        });

        it('should throw error if client is unauthorized', async () => {
            const unauthorizedJob = { ...mockJob, Contract: { Client: { id: 999 } } };
            Job.findOne.mockResolvedValue(unauthorizedJob);

            await expect(jobService.payForJob(jobId, clientId)).rejects.toThrow(
                'You are not authorized to pay for this job'
            );
            expect(transaction.rollback).toHaveBeenCalled();
        });

        it('should throw error if client has insufficient balance', async () => {
            const insufficientBalanceJob = {
                ...mockJob,
                Contract: { ...mockJob.Contract, Client: { id: 1, balance: 100 } }
            };
            Job.findOne.mockResolvedValue(insufficientBalanceJob);

            await expect(jobService.payForJob(jobId, clientId)).rejects.toThrow(
                'Insufficient balance to pay for the job'
            );
            expect(transaction.rollback).toHaveBeenCalled();
        });

        it('should handle internal server error and rollback the transaction', async () => {
            Job.findOne.mockRejectedValue(new Error('Internal server error'));

            await expect(jobService.payForJob(jobId, clientId)).rejects.toThrow('Internal server error');
            expect(transaction.rollback).toHaveBeenCalled();
        });
    });
});
