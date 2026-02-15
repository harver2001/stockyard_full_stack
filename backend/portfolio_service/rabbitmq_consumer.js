import amqp from 'amqplib';

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

            channel.consume(QUEUE_NAME, (msg) => {
                if (msg !== null) {
                    const content = JSON.parse(msg.content.toString());
                    console.log(` [x] Portfolio Service received:`, content);

                    // Here you would typically update the portfolio DB
                    // For example: if (content.event === 'STOCK_ADDED') { ... }

                    channel.ack(msg);
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
