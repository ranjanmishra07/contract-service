// __tests__/balances.test.js
const request = require('supertest');
const app = require('../src/app'); // Adjust the path to your app
const JobService = require('../src/services/jobService');
const { getProfile } = require('../src/middleware/getProfile'); // Import the middleware

jest.mock('../src/services/jobService'); // Mock the JobService
jest.mock('../src/middleware/getProfile'); // Mock the getProfile middleware

describe('Balances Route', () => {
    describe.only('POST /balances/deposit/:userId', () => {
        const profile = { id: 1, name: 'Profile Name' }; // Mock profile
        const mockResult = { success: true, message: 'Deposit successful', balance: 5000 }; // Mock result
        let jobService;
        beforeEach(() => {
            // Mock getProfile to set req.profile with the mock profile
            getProfile.mockImplementation((req, res, next) => {
                req.profile = profile; // Set the mocked profile
                next();
            });
            jobService = new JobService();
            JobService.depositToBalance.mockClear(); // Clear mock before each test
        });

        it('should deposit to user balance successfully', async () => {
            JobService.depositToBalance.mockResolvedValue(mockResult); // Mock the service method

            const response = await request(app)
                .post('/balances/deposit/2') // Assuming the userId is 2
                .set('profile_id', '1') // Add profile_id in the header
                .set('Accept', 'application/json');

            console.log("response.body", response.body);
            expect(response.status).toBe(200);
            expect(response.body).toStrictEqual(mockResult);
            expect(JobService.depositToBalance).toHaveBeenCalledWith(profile, '2');
        });

        it('should return 400 error if validation fails', async () => {
            // Mock case where payment validation middleware catches an error (e.g., invalid userId)
            const response = await request(app)
                .post('/balances/deposit/abc')
                .set('profile_id', '1')
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
        });

        it('should handle internal server errors', async () => {
            JobService.depositToBalance.mockRejectedValue(new Error('Internal server error')); // Mock an internal error

            const response = await request(app)
                .post('/balances/deposit/2')
                .set('profile_id', '1')
                .set('Accept', 'application/json');

            expect(response.status).toBe(500); // In case of internal server error
            expect(response.body.error).toBe('Internal server error'); // Adjust according to your error handling
        });
    });
});
