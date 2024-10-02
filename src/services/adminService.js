const { Job, Profile, Contract, sequelize } = require('../model');
const Sequelize = require('sequelize');

class AdminService {
    async getBestClients(startDate, endDate, limit = 2) {
        const result = await Job.findAll({
            attributes: [
                [sequelize.col('Contract.ClientId'), 'clientId'],
                [sequelize.col('Contract.Client.firstName'), 'firstName'],
                [sequelize.col('Contract.Client.lastName'), 'lastName'],
                [sequelize.fn('SUM', sequelize.col('price')), 'total_paid'],
            ],
            include: [
                {
                    model: Contract,
                    attributes: [],
                    include: [
                        {
                            model: Profile,
                            as: 'Client',
                            attributes: ['id', 'firstName', 'lastName'], // Include client attributes as needed
                        }
                    ]
                }
            ],
            where: {
                paid: true,
                paymentDate: {
                    [Sequelize.Op.between]: [startDate, endDate],
                },
            },
            group: ['Contract.ClientId'],
            order: [[sequelize.literal('total_paid'), 'DESC']],
            limit: limit,
            raw: true, // Return plain result instead of model instances
        });

        // Process result to create full name
        const formattedResult = result.map(client => ({
            clientId: client.clientId,
            total_paid: client.total_paid,
            fullName: `${client.firstName} ${client.lastName}`.trim(),
        }));

        return formattedResult;
    }

    async getBestProfession(startDate, endDate) {
        try {
            // Find the total earnings by profession within the time range
            const result = await Job.findAll({
                attributes: [
                    [sequelize.col('Contract.Contractor.profession'), 'profession'],
                    [sequelize.fn('SUM', sequelize.col('price')), 'total_earned']
                ],
                include: [
                    {
                        model: Contract,
                        attributes: [], // No need to return contract data, only join
                        include: [
                            {
                                model: Profile,
                                as: 'Contractor',
                                attributes: ['profession'], // Only need profession for contractors
                            }
                        ]
                    }
                ],
                where: {
                    paid: true, // Only include paid jobs
                    paymentDate: {
                        [Sequelize.Op.between]: [startDate, endDate] // Filter jobs by payment date
                    }
                },
                group: ['Contract.Contractor.profession'],
                order: [[sequelize.literal('total_earned'), 'DESC']], // Sort by highest total earnings
                limit: 1, // Get the top profession
                raw: true // Return plain result instead of model instances
            });

            if (result.length === 0) {
                throw new Error('No data found for the given date range');
            }

            return {
                profession: result[0].profession,
                totalEarned: result[0].total_earned
            };
        } catch (error) {
            console.error('Error in getting best profession:', error);
            throw new Error('Internal server error');
        }
    }
}

module.exports = AdminService;
