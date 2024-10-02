// __tests__/contracts.test.js
const request = require('supertest');
const app = require('../src/app'); // Adjust the path to your app
const ContractService = require('../src/services/contractService');

jest.mock('../src/services/contractService'); // Mock the ContractService

describe('Contracts Route', () => {
    let contractService;

    beforeEach(() => {
        // Create a fresh instance of the mocked service before each test
        contractService = new ContractService();
    });

    describe('GET /contracts/:id', () => {
        it('should return a contract by id', async () => {
            const mockContract = {
                id: '1',
                title: 'Contract 1',
                description: 'Description of contract 1',
            };

            ContractService.prototype.getContractByIdAndProfile.mockResolvedValue(mockContract); // Mock the service method

            const response = await request(app)
                .get('/contracts/1')
                .set('Accept', 'application/json')
                .set('profile_id', '1'); // Add profile_id in the header

            expect(response.status).toBe(200);
            expect(response.body).toStrictEqual(mockContract); // Check deep equality
        });

        it('should return a 404 error if the contract is not found', async () => {
            ContractService.prototype.getContractByIdAndProfile.mockResolvedValue(null); // Mock to return null

            const response = await request(app)
                .get('/contracts/1')
                .set('Accept', 'application/json')
                .set('profile_id', '1'); // Add profile_id in the header

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Contract not found or access denied'); // Adjust according to your error handling
        });

        it('should handle internal server errors', async () => {
            ContractService.prototype.getContractByIdAndProfile.mockRejectedValue(new Error('Internal server error')); // Mock to throw an error

            const response = await request(app)
                .get('/contracts/1')
                .set('Accept', 'application/json')
                .set('profile_id', '1'); // Add profile_id in the header

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Internal server error'); // Adjust according to your error handling
        });
    });

    describe('GET /contracts', () => {
        it('should return active contracts for the profile', async () => {
            const mockContracts = [
                { id: '1', title: 'Contract 1', description: 'Description of contract 1' },
                { id: '2', title: 'Contract 2', description: 'Description of contract 2' },
            ];

            ContractService.prototype.getContractsByProfile.mockResolvedValue(mockContracts); // Mock the service method

            const response = await request(app)
                .get('/contracts')
                .set('Accept', 'application/json')
                .set('profile_id', '1'); // Add profile_id in the header

            expect(response.status).toBe(200);
            expect(response.body).toStrictEqual(mockContracts); // Check deep equality
        });

        it('should return a 404 error if no active contracts are found', async () => {
            ContractService.prototype.getContractsByProfile.mockResolvedValue([]); // Mock to return no contracts

            const response = await request(app)
                .get('/contracts')
                .set('Accept', 'application/json')
                .set('profile_id', '1'); // Add profile_id in the header

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('No active contracts found'); // Adjust according to your error handling
        });

        it('should handle internal server errors', async () => {
            ContractService.prototype.getContractsByProfile.mockRejectedValue(new Error('Internal server error')); // Mock to throw an error

            const response = await request(app)
                .get('/contracts')
                .set('Accept', 'application/json')
                .set('profile_id', '1'); // Add profile_id in the header

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Internal server error'); // Adjust according to your error handling
        });
    });
});
