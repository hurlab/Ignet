<?php
// chat_limiter_sqlite.php - SQLite-based chat limiter
// Database file will be created in the same directory as this script.

class ChatLimiterSQLite {
    private $dbPath;
    private $maxChatsPerDay = 5;
    private $blockDuration = 86400; // 24 hours in seconds

    public function __construct($dbFile = 'chat_limits.db') {
        // Place DB in the same directory as this script
        $this->dbPath = __DIR__ . '/' . $dbFile;

        // Log the path for debugging
        // error_log("ChatLimiter: Using database path: " . $this->dbPath);

        if (!$this->initDB()) {
             // If DB initialization fails, log it but maybe allow script to continue (or throw exception)
             error_log("ChatLimiter FATAL: Database initialization failed. Limiter inactive.");
             // Optional: throw new Exception("Database initialization failed.");
        }
    }

    /**
     * Get Client IP Address - More robust version
     */
    private function getClientIP() {
        if (!empty($_SERVER['HTTP_CLIENT_IP'])) {
            $ip = $_SERVER['HTTP_CLIENT_IP'];
        } elseif (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
            // Can contain comma-separated list, take the first one
            $ipList = explode(',', $_SERVER['HTTP_X_FORWARDED_FOR']);
            $ip = trim($ipList[0]);
        } elseif (!empty($_SERVER['REMOTE_ADDR'])) {
            $ip = $_SERVER['REMOTE_ADDR'];
        } else {
            $ip = 'UNKNOWN'; // Fallback
        }
        // Basic validation - very simple, might need improvement for IPv6 etc.
        // return filter_var($ip, FILTER_VALIDATE_IP) ? $ip : 'INVALID_IP';
        return $ip; // Return even if validation fails for logging purposes
    }


    /**
     * Initialize database and create table if needed
     * Returns true on success, false on failure.
     */
    private function initDB() {
        try {
            // Check SQLite extension
            if (!class_exists('SQLite3')) {
                error_log("ChatLimiter ERROR: SQLite3 PHP extension is not installed or enabled.");
                return false; // Cannot proceed
            }

            // Check if directory is writable
            $dir = dirname($this->dbPath);
            if (!is_writable($dir)) {
                error_log("ChatLimiter ERROR: Directory is not writable: " . $dir . " - Please check permissions.");
                 // Attempt to fix permissions (might fail depending on server setup)
                 @chmod($dir, 0775); // Try making it writable for owner and group
                 if (!is_writable($dir)) {
                     return false; // Still not writable
                 }
            }

            $db = new SQLite3($this->dbPath);
            // Enable Write-Ahead Logging for better concurrency
            $db->exec('PRAGMA journal_mode = WAL;');

            $db->exec("CREATE TABLE IF NOT EXISTS chat_limits (
                ip TEXT,
                timestamp REAL PRIMARY KEY
            )"); // Timestamp as primary key helps prevent duplicate entries per exact second

             // Check table creation
             $checkTable = $db->querySingle("SELECT name FROM sqlite_master WHERE type='table' AND name='chat_limits'");
             if (!$checkTable) {
                 error_log("ChatLimiter ERROR: Failed to create chat_limits table in SQLite database.");
                 $db->close();
                 return false;
             }

            $db->close();
            return true; // Initialization successful

        } catch (Exception $e) {
            error_log("ChatLimiter ERROR during DB init: " . $e->getMessage() . " DB Path: " . $this->dbPath);
            return false;
        }
    }

    /**
     * Clean old entries (> blockDuration old)
     */
    private function cleanOldEntries($db) {
        if (!$db instanceof SQLite3) return; // Ensure valid DB object
        $cutoffTime = time() - $this->blockDuration;
        try {
            $stmt = $db->prepare("DELETE FROM chat_limits WHERE timestamp < :cutoff");
            $stmt->bindValue(':cutoff', $cutoffTime, SQLITE3_FLOAT);
            $stmt->execute();
        } catch (Exception $e) {
             error_log("ChatLimiter: Error cleaning old entries: " . $e->getMessage());
        }
    }

    /**
     * Check if the current IP can chat
     * Returns ['allowed' => bool, 'count' => int, 'remaining' => int, 'hours_remaining' => float]
     */
    public function canChat() {
        $ip = $this->getClientIP();
        if ($ip === 'UNKNOWN' || $ip === 'INVALID_IP') {
             error_log("ChatLimiter: Could not determine valid client IP address.");
             // Default to allowing chat if IP is unknown? Or block? Let's allow but log.
             return ['allowed' => true, 'count' => 0, 'remaining' => $this->maxChatsPerDay, 'hours_remaining' => 0];
        }

        $result = ['allowed' => true, 'count' => 0, 'remaining' => $this->maxChatsPerDay, 'hours_remaining' => 0];

        try {
            $db = new SQLite3($this->dbPath, SQLITE3_OPEN_READWRITE);
            $db->exec('PRAGMA journal_mode = WAL;'); // Ensure WAL mode
            $this->cleanOldEntries($db);

            $stmt = $db->prepare("SELECT COUNT(*) as count, MIN(timestamp) as first_chat FROM chat_limits WHERE ip = :ip");
            $stmt->bindValue(':ip', $ip, SQLITE3_TEXT);
            $res = $stmt->execute();
            $row = $res->fetchArray(SQLITE3_ASSOC);

            if ($row && $row['count'] !== null) {
                $result['count'] = intval($row['count']);
                $result['remaining'] = max(0, $this->maxChatsPerDay - $result['count']);

                if ($result['count'] >= $this->maxChatsPerDay) {
                    $result['allowed'] = false;
                    $firstChatTime = $row['first_chat'] ?? time(); // Use current time if somehow null
                    $blockEndTime = $firstChatTime + $this->blockDuration;
                    $secondsRemaining = $blockEndTime - time();
                    $result['hours_remaining'] = max(0, round($secondsRemaining / 3600, 1));
                }
            }
            $db->close();
        } catch (Exception $e) {
            error_log("ChatLimiter ERROR checking IP " . $ip . ": " . $e->getMessage());
            // Fail open? If DB check fails, maybe allow chat but log error?
            // Or fail closed: $result['allowed'] = false; $result['remaining'] = 0;
            // Let's fail open for now, assuming DB issue is temporary
            $result['allowed'] = true;
            $result['remaining'] = $this->maxChatsPerDay; // Assume limit not reached
        }
        return $result;
    }

    /**
     * Record a chat usage for the current IP
     * Returns ['success' => bool, 'count' => int, 'remaining' => int]
     */
    public function recordChat() {
        $ip = $this->getClientIP();
        if ($ip === 'UNKNOWN' || $ip === 'INVALID_IP') {
            return ['success' => false, 'count' => 0, 'remaining' => $this->maxChatsPerDay]; // Cannot record without IP
        }

        $currentTime = microtime(true); // Use microtime for potential primary key uniqueness

        try {
            $db = new SQLite3($this->dbPath, SQLITE3_OPEN_READWRITE | SQLITE3_OPEN_CREATE);
            $db->exec('PRAGMA journal_mode = WAL;');
            // Attempt insert
            $stmt = $db->prepare("INSERT INTO chat_limits (ip, timestamp) VALUES (:ip, :timestamp)");
            $stmt->bindValue(':ip', $ip, SQLITE3_TEXT);
            $stmt->bindValue(':timestamp', $currentTime, SQLITE3_FLOAT); // Store as float

            if ($stmt->execute()) {
                 // Get updated count after insert
                 $stats = $this->getStats(false); // Don't clean again immediately
                 $db->close();
                 return ['success' => true, 'count' => $stats['count'], 'remaining' => $stats['remaining']];
            } else {
                 error_log("ChatLimiter ERROR recording chat for IP " . $ip . ": Failed to execute insert.");
                 $db->close();
                 $stats = $this->getStats(false); // Still return current stats on failure
                 return ['success' => false, 'count' => $stats['count'], 'remaining' => $stats['remaining']];
            }
        } catch (Exception $e) {
            error_log("ChatLimiter ERROR recording chat for IP " . $ip . ": " . $e->getMessage());
            $stats = $this->getStats(false); // Still return current stats on failure
            return ['success' => false, 'count' => $stats['count'], 'remaining' => $stats['remaining']];
        }
    }

     /**
      * Get current stats for the IP (count, remaining) without blocking
      * Optional $clean: whether to clean old entries first
      */
     public function getStats($clean = true) {
         $ip = $this->getClientIP();
         if ($ip === 'UNKNOWN' || $ip === 'INVALID_IP') {
             return ['count' => 0, 'remaining' => $this->maxChatsPerDay];
         }
         $result = ['count' => 0, 'remaining' => $this->maxChatsPerDay];
         try {
             $db = new SQLite3($this->dbPath, SQLITE3_OPEN_READONLY); // Readonly connection
             if ($clean) {
                 // Clean needs write access, reopen if needed
                 $db->close();
                 $db = new SQLite3($this->dbPath, SQLITE3_OPEN_READWRITE);
                 $db->exec('PRAGMA journal_mode = WAL;');
                 $this->cleanOldEntries($db);
                 // Reopen as readonly? Might be overkill. Let's keep write access briefly.
             }

             $stmt = $db->prepare("SELECT COUNT(*) as count FROM chat_limits WHERE ip = :ip");
             $stmt->bindValue(':ip', $ip, SQLITE3_TEXT);
             $res = $stmt->execute();
             $row = $res->fetchArray(SQLITE3_ASSOC);
             if ($row && $row['count'] !== null) {
                 $result['count'] = intval($row['count']);
                 $result['remaining'] = max(0, $this->maxChatsPerDay - $result['count']);
             }
             $db->close();
         } catch (Exception $e) {
             error_log("ChatLimiter ERROR getting stats for IP " . $ip . ": " . $e->getMessage());
             // Return max remaining on error?
             $result['count'] = 0;
             $result['remaining'] = $this->maxChatsPerDay;
         }
         return $result;
     }


    // --- Admin Functions ---

    /**
     * Reset chat count for a specific IP (admin function)
     */
    public function resetIP($ip) {
        if (empty($ip)) return false;
        try {
            $db = new SQLite3($this->dbPath, SQLITE3_OPEN_READWRITE);
            $db->exec('PRAGMA journal_mode = WAL;');
            $stmt = $db->prepare("DELETE FROM chat_limits WHERE ip = :ip");
            $stmt->bindValue(':ip', $ip, SQLITE3_TEXT);
            $stmt->execute();
            $db->close();
            return true;
        } catch (Exception $e) {
            error_log("Error resetting IP " . $ip . ": " . $e->getMessage());
            return false;
        }
    }

    /**
     * Get list of currently blocked IPs (admin function)
     */
    public function getBlockedIPs() {
        $blocked = [];
        try {
            $db = new SQLite3($this->dbPath, SQLITE3_OPEN_READWRITE); // Need write for clean
            $db->exec('PRAGMA journal_mode = WAL;');
            $this->cleanOldEntries($db); // Clean first

            // Get IPs currently exceeding the limit within the time window
            $cutoffTime = time() - $this->blockDuration;
            $result = $db->query("
                SELECT
                    ip,
                    COUNT(*) as chat_count,
                    MIN(timestamp) as first_chat_time,
                    MAX(timestamp) as last_chat_time
                FROM chat_limits
                WHERE timestamp >= {$cutoffTime} -- Only consider chats within the window
                GROUP BY ip
                HAVING chat_count >= {$this->maxChatsPerDay}
                ORDER BY last_chat_time DESC
            ");

            if ($result) {
                while ($row = $result->fetchArray(SQLITE3_ASSOC)) {
                    $blockEndTime = $row['first_chat_time'] + $this->blockDuration;
                    $secondsRemaining = $blockEndTime - time();
                    $row['hours_remaining'] = max(0, round($secondsRemaining / 3600, 1));
                    $blocked[] = $row;
                }
            } else {
                 error_log("ChatLimiter ADMIN: Query failed for getBlockedIPs - " . $db->lastErrorMsg());
            }
            $db->close();
        } catch (Exception $e) {
            error_log("ChatLimiter ADMIN: Error getting blocked IPs: " . $e->getMessage());
        }
        return $blocked;
    }

    /**
     * Get database file path (for admin display)
     */
    public function getDBPath() {
        return $this->dbPath;
    }
}
?>
