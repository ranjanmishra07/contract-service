// __tests__/adminHandler.test.js

const request = require('supertest');
const app = require('../src/app');
const AdminService = require('../src/services/adminService');
jest.mock('../src/services/adminService');

describe('Admin Route', () => {
    describe('GET /admin/best-clients', () => {
        let adminService;
        beforeEach(() => {
            adminService = new AdminService();
        });
        it('should return the best clients within a date range', async () => {
            const mockResponse = [
                {
                    clientName: 'John Doe',
                    totalPaid: 1500,
                },
                {
                    clientName: 'Jane Smith',
                    totalPaid: 1000,
                },
            ];
    
            AdminService.prototype.getBestClients.mockResolvedValue(mockResponse); // Mock the service method
    
            const response = await request(app)
                .get('/admin/best-clients?start=2023-01-01&end=2023-12-31&limit=2')
                .set('Accept', 'application/json')
                .set('profile_id', '1');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            expect(AdminService.prototype.getBestClients).toHaveBeenCalledWith('2023-01-01', '2023-12-31', 2);
        });
    
        it('should return a 400 error if the query parameters are invalid', async () => {
            const response = await request(app)
                .get('/admin/best-clients?start=invalid-date&end=2023-12-31&limit=2')
                .set('Accept', 'application/json')
                .set('profile_id', '1');
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid start or end date');
        });
    
        it('should return a empty response if no clients found', async () => {
            AdminService.prototype.getBestClients.mockResolvedValue([]);
    
            const response = await request(app)
                .get('/admin/best-clients?start=2023-01-01&end=2023-12-31&limit=2')
                .set('Accept', 'application/json')
                .set('profile_id', '1');
            expect(response.status).toBe(200);
            expect(response.body).toStrictEqual([]);
        });
    });
    
    describe('GET /admin/best-profession', () => {
        let adminService;
        beforeEach(() => {
            adminService = new AdminService();
        });
        it('should return the best clients within a date range', async () => {
            const mockResponse =
                {
                    "profession": "Programmer",
                    "totalEarned": 2683
                }
    
            AdminService.prototype.getBestProfession.mockResolvedValue(mockResponse);
    
            const response = await request(app)
                .get('/admin/best-profession?start=2023-01-01&end=2023-12-31')
                .set('Accept', 'application/json')
                .set('profile_id', '1');
            expect(response.status).toBe(200);
            expect(response.body).toEqual(mockResponse);
            expect(AdminService.prototype.getBestProfession).toHaveBeenCalledWith('2023-01-01', '2023-12-31'); 
        });
    
        it('should return a 400 error if the query parameters are invalid', async () => {
            const response = await request(app)
                .get('/admin/best-profession?start=invalid-date&end=2023-12-31')
                .set('Accept', 'application/json')
                .set('profile_id', '1');
            expect(response.status).toBe(400);
            expect(response.body.error).toBe('Invalid start or end date');
        });
    
        it('should return a empty response if profession is found', async () => {
            AdminService.prototype.getBestProfession.mockResolvedValue([]);
    
            const response = await request(app)
                .get('/admin/best-profession?start=2023-01-01&end=2023-12-31&limit=2')
                .set('Accept', 'application/json')
                .set('profile_id', '1');
            expect(response.status).toBe(200);
            expect(response.body).toStrictEqual([]);
        });
    });
} )
