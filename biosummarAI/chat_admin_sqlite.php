<?php
// chat_admin_sqlite.php - Admin dashboard for SQLite-based chat limiting
// IMPORTANT: Change the password below!

ini_set('display_errors', 0);
error_reporting(0);

// Admin password: set ADMIN_PASSWORD environment variable.
// Legacy fallback uses a bcrypt hash for constant-time comparison.

session_start();

// Check login
if (!isset($_SESSION['chat_admin_logged_in'])) {
    if (isset($_POST['password'])) {
        $submitted_pw = $_POST['password'];
        $env_pw = getenv('ADMIN_PASSWORD');
        $authenticated = false;
        if ($env_pw !== false && $env_pw !== '') {
            $authenticated = hash_equals($env_pw, $submitted_pw);
        } else {
            // Legacy: verify against bcrypt hash of old password
            $legacy_hash = '$2y$10$3DRBx4I5xe2BgH22FP3Lje4BMsQewsMgoE0Fx6JdwawIFFCDL/K6y';
            $authenticated = password_verify($submitted_pw, $legacy_hash);
        }
        if ($authenticated) {
            $_SESSION['chat_admin_logged_in'] = true;
        } else {
            $error = "Invalid password";
        }
    }
    
    if (!isset($_SESSION['chat_admin_logged_in'])) {
        ?>
        <!DOCTYPE html>
        <html>
        <head>
            <title>Chat Admin - Login</title>
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 50px; }
                .login-box { max-width: 300px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                input[type="password"] { width: 100%; padding: 10px; margin: 10px 0; border: 1px solid #ccc; border-radius: 4px; }
                button { width: 100%; padding: 10px; background: #007bff; color: white; border: none; border-radius: 4px; cursor: pointer; }
                button:hover { background: #0056b3; }
                .error { color: red; margin: 10px 0; }
            </style>
        </head>
        <body>
            <div class="login-box">
                <h2>Chat Admin Login</h2>
                <?php if (isset($error)) echo "<p class='error'>" . htmlspecialchars($error, ENT_QUOTES, 'UTF-8') . "</p>"; ?>
                <form method="POST">
                    <input type="password" name="password" placeholder="Enter password" required>
                    <button type="submit">Login</button>
                </form>
            </div>
        </body>
        </html>
        <?php
        exit;
    }
}

// Logout
if (isset($_GET['logout'])) {
    session_destroy();
    header("Location: chat_admin_sqlite.php");
    exit;
}

// Include chat limiter
require_once __DIR__ . '/chat_limiter_sqlite.php';

// Initialize limiter
$limiter = new ChatLimiterSQLite();

// Handle actions
$message = '';
if (isset($_GET['action'])) {
    if ($_GET['action'] === 'reset' && isset($_GET['ip'])) {
        if ($limiter->resetIP($_GET['ip'])) {
            $message = "Successfully reset IP: " . htmlspecialchars($_GET['ip']);
        } else {
            $message = "Failed to reset IP";
        }
    } elseif ($_GET['action'] === 'cleanup') {
        $message = "Database refreshed (old entries auto-cleaned)";
    }
}

// Get statistics
$stats = $limiter->getTotalStats();
$blockedIPs = $limiter->getBlockedIPs();
$dbPath = $limiter->getDBPath();

?>
<!DOCTYPE html>
<html>
<head>
    <title>Chat Usage Admin Dashboard (SQLite)</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #333; margin-bottom: 30px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
        .logout-btn { padding: 8px 16px; background: #dc3545; color: white; text-decoration: none; border-radius: 4px; }
        .logout-btn:hover { background: #c82333; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #007bff; }
        .stat-card h3 { color: #666; font-size: 14px; margin-bottom: 10px; }
        .stat-card .value { font-size: 32px; font-weight: bold; color: #333; }
        .message { padding: 15px; background: #d4edda; color: #155724; border: 1px solid #c3e6cb; border-radius: 4px; margin-bottom: 20px; }
        .actions { margin-bottom: 20px; }
        .btn { padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 4px; display: inline-block; margin-right: 10px; border: none; cursor: pointer; }
        .btn:hover { background: #0056b3; }
        .btn-danger { background: #dc3545; }
        .btn-danger:hover { background: #c82333; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #007bff; color: white; font-weight: normal; }
        tr:hover { background: #f5f5f5; }
        .ip-address { font-family: monospace; }
        .timestamp { color: #666; font-size: 14px; }
        .badge { padding: 4px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; }
        .badge-danger { background: #dc3545; color: white; }
        .badge-warning { background: #ffc107; color: #333; }
        .info-box { margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; }
        .info-box ul { list-style: none; padding: 0; margin-top: 15px; }
        .info-box li { padding: 8px 0; border-bottom: 1px solid #ddd; }
        .db-path { font-family: monospace; background: #e9ecef; padding: 5px 10px; border-radius: 4px; word-break: break-all; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💬 Chat Usage Dashboard (SQLite)</h1>
            <a href="?logout" class="logout-btn">Logout</a>
        </div>
        
        <?php if ($message): ?>
            <div class="message"><?php echo htmlspecialchars($message, ENT_QUOTES, 'UTF-8'); ?></div>
        <?php endif; ?>
        
        <div class="actions">
            <a href="?action=cleanup" class="btn">🔄 Refresh Data</a>
            <button onclick="location.reload()" class="btn">↻ Reload Page</button>
        </div>
        
        <div class="stats-grid">
            <div class="stat-card">
                <h3>TOTAL USERS (24h)</h3>
                <div class="value"><?php echo number_format($stats['total_users'] ?? 0); ?></div>
            </div>
            <div class="stat-card">
                <h3>TOTAL CHATS (24h)</h3>
                <div class="value"><?php echo number_format($stats['total_chats'] ?? 0); ?></div>
            </div>
            <div class="stat-card">
                <h3>AVG CHATS/USER</h3>
                <div class="value"><?php echo number_format($stats['avg_chats_per_user'] ?? 0, 1); ?></div>
            </div>
            <div class="stat-card">
                <h3>BLOCKED IPs</h3>
                <div class="value"><?php echo count($blockedIPs); ?></div>
            </div>
        </div>
        
        <h2>🚫 Currently Blocked IPs (Reached 5 Chat Limit)</h2>
        
        <?php if (empty($blockedIPs)): ?>
            <p style="padding: 20px; text-align: center; color: #666;">No IPs are currently blocked. Great!</p>
        <?php else: ?>
            <table>
                <thead>
                    <tr>
                        <th>IP Address</th>
                        <th>Chat Count</th>
                        <th>First Chat</th>
                        <th>Last Chat</th>
                        <th>Status</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($blockedIPs as $row): ?>
                        <?php
                            $now = time();
                            $resetTime = $row['first_chat_time'] + 86400;
                            $hoursRemaining = ceil(($resetTime - $now) / 3600);
                            $isBlocked = $hoursRemaining > 0;
                        ?>
                        <tr>
                            <td class="ip-address"><?php echo htmlspecialchars($row['ip']); ?></td>
                            <td><span class="badge badge-danger"><?php echo $row['chat_count']; ?> / 5</span></td>
                            <td class="timestamp"><?php echo date('Y-m-d H:i:s', $row['first_chat_time']); ?></td>
                            <td class="timestamp"><?php echo date('Y-m-d H:i:s', $row['last_chat_time']); ?></td>
                            <td>
                                <?php if ($isBlocked): ?>
                                    <span class="badge badge-danger">BLOCKED (<?php echo $hoursRemaining; ?>h left)</span>
                                <?php else: ?>
                                    <span class="badge badge-warning">Expired (will auto-reset)</span>
                                <?php endif; ?>
                            </td>
                            <td>
                                <a href="?action=reset&ip=<?php echo urlencode($row['ip']); ?>" 
                                   class="btn btn-danger" 
                                   onclick="return confirm('Reset this IP?')">Reset</a>
                            </td>
                        </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        <?php endif; ?>
        
        <div class="info-box">
            <h3>ℹ️ System Information</h3>
            <ul>
                <li><strong>Chat Limit:</strong> 5 chats per IP per 24 hours</li>
                <li><strong>Reset Time:</strong> 24 hours after first chat</li>
                <li><strong>Storage Type:</strong> SQLite (file-based)</li>
                <li><strong>Database File:</strong> <span class="db-path"><?php echo htmlspecialchars($dbPath); ?></span></li>
                <li><strong>Auto Cleanup:</strong> Runs on every check (removes entries > 24h old)</li>
                <li><strong>Shared with:</strong> Python backend (api_biosummary.py)</li>
            </ul>
        </div>
    </div>
</body>
</html>
