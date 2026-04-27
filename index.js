'use strict';

require('dotenv').config();
const connectDB = require('./src/config/database');

async function start() {
	try {
		// Connect to MongoDB first
		await connectDB();

		// Load handlers — each module registers its own bot.on() listener
		require('./src/handlers/messageHandler');
		require('./src/handlers/callbackHandler');

		console.log('🤖 Bot chi tiêu nhóm đang chạy...');

		// Graceful shutdown
		const shutdown = async () => {
			console.log('\nStopping bot and closing database...');
			const mongoose = require('mongoose');
			await mongoose.connection.close();
			process.exit(0);
		};

		process.on('SIGINT', shutdown);
		process.on('SIGTERM', shutdown);
	} catch (error) {
		console.error('❌ Failed to start:', error);
		process.exit(1);
	}
}

start();
