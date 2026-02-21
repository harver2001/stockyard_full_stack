import amqp from 'amqplib';
import Portfolio from './schema.js';

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672';
const QUEUE_NAME = 'stock_events';

export const startConsumer = async () => {
    let connection;
    let channel;
    let retries = 5;

    while (retries > 0) {
        try {
            connection = await amqp.connect(RABBITMQ_URL);
            channel = await connection.createChannel();

            await channel.assertQueue(QUEUE_NAME, {
                durable: true
            });

            console.log(` [*] Portfolio service waiting for messages in ${QUEUE_NAME}. To exit press CTRL+C`);

            channel.consume(QUEUE_NAME, async (msg) => {
                if (msg !== null) {
                    try {
                        const content = JSON.parse(msg.content.toString());
                        console.log(` [x] Portfolio Service received:`, content);

                        if (content.event === 'STOCK_ADDED') {
                            const { symbol, user_id, userId } = content.data;
                            const finalUserId = user_id || userId;

                            if (finalUserId && symbol) {
                                const symbolUpper = symbol.toUpperCase();

                                // First, try to update existing stock quantity
                                const result = await Portfolio.findOneAndUpdate(
                                    { userId: finalUserId.toString(), "stocks.symbol": symbolUpper },
                                    { $inc: { "stocks.$.quantity": 1 } },
                                    { new: true }
                                );

                                if (!result) {
                                    // If not found, either the portfolio doesn't exist or the stock isn't in it
                                    // Try to push to existing portfolio
                                    const pushResult = await Portfolio.findOneAndUpdate(
                                        { userId: finalUserId.toString() },
                                        {
                                            $push: {
                                                stocks: {
                                                    symbol: symbolUpper,
                                                    quantity: 1,
                                                    purchasePrice: 0
                                                }
                                            }
                                        },
                                        { new: true }
                                    );

                                    if (!pushResult) {
                                        // Portfolio doesn't exist at all, create it
                                        await Portfolio.create({
                                            userId: finalUserId.toString(),
                                            stocks: [{
                                                symbol: symbolUpper,
                                                quantity: 1,
                                                purchasePrice: 0
                                            }]
                                        });
                                    }
                                }
                                console.log(` [v] Portfolio updated for user ${finalUserId}: ${symbolUpper}`);
                            }
                        }

                        channel.ack(msg);
                    } catch (err) {
                        console.error("Error processing message:", err);
                        // In case of error, still ack to avoid infinite loop, or use nack with requeue: false
                        channel.ack(msg);
                    }
                }
            });

            return;
        } catch (error) {
            console.error(`Failed to connect to RabbitMQ: ${error.message}. Retrying in 5 seconds...`);
            retries -= 1;
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
    console.error("Could not connect to RabbitMQ after retries.");
};
