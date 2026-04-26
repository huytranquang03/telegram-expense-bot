'use strict';

// Load handlers — each module registers its own bot.on() listener
require('./src/handlers/messageHandler');
require('./src/handlers/callbackHandler');

console.log('🤖 Bot chi tiêu nhóm đang chạy...');
