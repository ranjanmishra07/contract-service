const request = require('supertest');
const app = require('../src/app');
const JobService = require('../src/services/jobService');
const { getProfile } = require('../src/middleware/getProfile');

jest.mock('../src/services/jobService');
jest.mock('../src/middleware/getProfile');
jest.mock('../src/middleware/payment'); 

describe('Jobs Route', () => {
    const profile = { id: 1, name: 'Profile Name' };

    beforeEach(() => {
        // Mock getProfile to set req.profile with the mock profile
        getProfile.mockImplementation((req, res, next) => {
            req.profile = profile;
            next();
        });
    });

    describe('GET /jobs/unpaid', () => {
        const unpaidJobs = [
            { id: 1, description: 'Test Job 1', price: 100 },
            { id: 2, description: 'Test Job 2', price: 200 },
        ];

        it('should return unpaid jobs for the profile', async () => {
            JobService.prototype.getUnpaidJobsByProfile.mockResolvedValue(unpaidJobs);

            const response = await request(app)
                .get('/jobs/unpaid')
                .set('profile_id', '1')
                .set('Accept', 'application/json');

            expect(response.status).toBe(200);
            expect(response.body).toEqual(unpaidJobs);
            expect(JobService.prototype.getUnpaidJobsByProfile).toHaveBeenCalledWith(profile);
        });

        it('should return 404 if no unpaid jobs found', async () => {
            JobService.prototype.getUnpaidJobsByProfile.mockResolvedValue([]);

            const response = await request(app)
                .get('/jobs/unpaid')
                .set('profile_id', '1')
                .set('Accept', 'application/json');

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('No unpaid jobs found');
        });

        it('should handle internal server errors', async () => {
            JobService.prototype.getUnpaidJobsByProfile.mockRejectedValue(new Error('Internal server error'));

            const response = await request(app)
                .get('/jobs/unpaid')
                .set('profile_id', '1')
                .set('Accept', 'application/json');

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Internal server error');
        });
    });

    describe('POST /jobs/:job_id/pay', () => {
        const job = { id: 1, description: 'Test Job', price: 100 };

        it('should successfully pay for a job', async () => {
            JobService.prototype.payForJob.mockResolvedValue(job);

            const response = await request(app)
                .post('/jobs/1/pay')
                .set('profile_id', '1')
                .set('Accept', 'application/json');
            expect(response.status).toBe(200);
            expect(response.body).toStrictEqual({
                message: 'Payment successful',
                job
            });
            expect(JobService.prototype.payForJob).toHaveBeenCalledWith('1', profile.id);
        });

        it('should return 404 if job is not found', async () => {
            JobService.prototype.payForJob.mockRejectedValue(new Error('Job not found'));

            const response = await request(app)
                .post('/jobs/1/pay')
                .set('profile_id', '1')
                .set('Accept', 'application/json');

            expect(response.status).toBe(404);
            expect(response.body.error).toBe('Job not found');
        });

        it('should return 400 if balance is insufficient', async () => {
            JobService.prototype.payForJob.mockRejectedValue(new Error('Insufficient balance'));

            const response = await request(app)
                .post('/jobs/1/pay')
                .set('profile_id', '1')
                .set('Accept', 'application/json');

            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Insufficient balance');
        });

        it('should handle internal server errors', async () => {
            JobService.prototype.payForJob.mockRejectedValue(new Error('Internal server error'));

            const response = await request(app)
                .post('/jobs/1/pay')
                .set('profile_id', '1')
                .set('Accept', 'application/json');

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Internal server error');
        });
    });
});
