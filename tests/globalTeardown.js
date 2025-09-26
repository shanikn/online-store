const fs = require('fs').promises;
const path = require('path');

module.exports = async () => {
    console.log('🧹 Cleaning up test environment...');

    try {
        // Clean up test user data files
        const userDataPath = path.join(__dirname, '..', 'data', 'user_data');

        const files = await fs.readdir(userDataPath);
        const testFiles = files.filter(file =>
            file.includes('test_') ||
            file.includes('e2e_') ||
            file.includes('concurrent_')
        );

        for (const file of testFiles) {
            try {
                await fs.unlink(path.join(userDataPath, file));
            } catch (error) {
                // File might not exist, ignore
            }
        }

        // Clean up backup files older than 24 hours
        const backupPath = path.join(__dirname, 'fixtures', 'backups');
        try {
            const backupFiles = await fs.readdir(backupPath);
            const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);

            for (const file of backupFiles) {
                const filePath = path.join(backupPath, file);
                const stats = await fs.stat(filePath);

                if (stats.mtime.getTime() < oneDayAgo) {
                    await fs.unlink(filePath);
                }
            }
        } catch (error) {
            // Backup directory might not exist
        }

        console.log('✅ Test environment cleanup complete');
    } catch (error) {
        console.log('⚠️  Warning: Could not complete cleanup:', error.message);
    }
};