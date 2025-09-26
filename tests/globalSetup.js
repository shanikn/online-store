const fs = require('fs').promises;
const path = require('path');

module.exports = async () => {
    console.log('🚀 Setting up test environment...');

    // Create test data directories
    const testDataPath = path.join(__dirname, '..', 'data');
    const userDataPath = path.join(testDataPath, 'user_data');

    await fs.mkdir(testDataPath, { recursive: true });
    await fs.mkdir(userDataPath, { recursive: true });

    // Create backup directory for original data
    const backupPath = path.join(__dirname, 'fixtures', 'backups');
    await fs.mkdir(backupPath, { recursive: true });

    console.log('✅ Test environment setup complete');
};