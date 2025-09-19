const { runMigrations } = require('../db/migrate');

runMigrations();
console.log('Database migrated and seeded successfully.');
