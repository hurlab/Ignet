<?php
/**
 * IgnetRedisCache — minimal pure-PHP Redis client using fsockopen (RESP protocol).
 * No PHP redis extension required.
 *
 * Supports: get, set (with TTL), del, flushAll.
 * Graceful failure: when Redis is unavailable, all methods return null/false
 * without throwing exceptions.
 */
class IgnetRedisCache
{
    /** @var resource|false */
    private $socket = false;

    private bool $connected = false;

    /**
     * Open a TCP connection to Redis.
     *
     * @param string $host Redis host (default 127.0.0.1)
     * @param int    $port Redis port (default 6379)
     * @return bool True on success, false if Redis is unavailable.
     */
    public function connect(string $host = '127.0.0.1', int $port = 6379): bool
    {
        try {
            $errno  = 0;
            $errstr = '';
            // 2-second connection timeout; keep silent on failure
            $sock = @fsockopen($host, $port, $errno, $errstr, 2.0);
            if ($sock === false) {
                $this->connected = false;
                return false;
            }
            // Set read timeout to 2 seconds
            @stream_set_timeout($sock, 2);
            $this->socket    = $sock;
            $this->connected = true;
            return true;
        } catch (\Throwable $e) {
            $this->connected = false;
            return false;
        }
    }

    /**
     * Retrieve a cached value.
     *
     * @param string $key
     * @return string|null The cached value, or null on miss / Redis unavailable.
     */
    public function get(string $key): ?string
    {
        if (!$this->connected) {
            return null;
        }
        try {
            $response = $this->sendCommand(['GET', $key]);
            if ($response === null || $response === false) {
                return null;
            }
            return (string) $response;
        } catch (\Throwable $e) {
            $this->connected = false;
            return null;
        }
    }

    /**
     * Store a value with an optional TTL.
     *
     * @param string $key
     * @param string $value
     * @param int    $ttl   Seconds until expiry (default 3600 = 1 hour). 0 = no expiry.
     * @return bool True on success, false on failure.
     */
    public function set(string $key, string $value, int $ttl = 3600): bool
    {
        if (!$this->connected) {
            return false;
        }
        try {
            if ($ttl > 0) {
                $response = $this->sendCommand(['SET', $key, $value, 'EX', (string) $ttl]);
            } else {
                $response = $this->sendCommand(['SET', $key, $value]);
            }
            return ($response === 'OK');
        } catch (\Throwable $e) {
            $this->connected = false;
            return false;
        }
    }

    /**
     * Delete one or more keys.
     *
     * @param string ...$keys
     * @return int Number of keys deleted, or 0 on failure.
     */
    public function del(string ...$keys): int
    {
        if (!$this->connected || empty($keys)) {
            return 0;
        }
        try {
            $args     = array_merge(['DEL'], $keys);
            $response = $this->sendCommand($args);
            return is_numeric($response) ? (int) $response : 0;
        } catch (\Throwable $e) {
            $this->connected = false;
            return 0;
        }
    }

    /**
     * Flush all keys in the current Redis database.
     *
     * @return bool True on success, false on failure.
     */
    public function flushAll(): bool
    {
        if (!$this->connected) {
            return false;
        }
        try {
            $response = $this->sendCommand(['FLUSHALL']);
            return ($response === 'OK');
        } catch (\Throwable $e) {
            $this->connected = false;
            return false;
        }
    }

    // -------------------------------------------------------------------------
    // Internal RESP protocol helpers
    // -------------------------------------------------------------------------

    /**
     * Serialize a command array as a RESP array and send it over the socket,
     * then read and parse the response.
     *
     * @param  array<string> $args
     * @return string|int|null|false Parsed Redis response.
     */
    private function sendCommand(array $args)
    {
        $payload = '*' . count($args) . "\r\n";
        foreach ($args as $arg) {
            $payload .= '$' . strlen($arg) . "\r\n" . $arg . "\r\n";
        }

        $written = @fwrite($this->socket, $payload);
        if ($written === false) {
            $this->connected = false;
            return false;
        }

        return $this->readResponse();
    }

    /**
     * Read and parse one RESP response from the socket.
     *
     * @return string|int|null|false
     */
    private function readResponse()
    {
        $line = @fgets($this->socket, 4096);
        if ($line === false) {
            $this->connected = false;
            return false;
        }

        $type = $line[0];
        $data = rtrim(substr($line, 1));

        switch ($type) {
            case '+': // Simple string
                return $data;

            case '-': // Error
                return false;

            case ':': // Integer
                return (int) $data;

            case '$': // Bulk string
                $len = (int) $data;
                if ($len === -1) {
                    return null; // Null bulk string (cache miss)
                }
                $bulk = '';
                $remaining = $len + 2; // +2 for trailing \r\n
                while ($remaining > 0) {
                    $chunk = @fread($this->socket, $remaining);
                    if ($chunk === false || $chunk === '') {
                        $this->connected = false;
                        return false;
                    }
                    $bulk      .= $chunk;
                    $remaining -= strlen($chunk);
                }
                return substr($bulk, 0, $len);

            case '*': // Array (not used in simple get/set, but handle gracefully)
                $count = (int) $data;
                if ($count === -1) {
                    return null;
                }
                $result = [];
                for ($i = 0; $i < $count; $i++) {
                    $result[] = $this->readResponse();
                }
                return $result;

            default:
                return false;
        }
    }

    /**
     * Close the socket on object destruction.
     */
    public function __destruct()
    {
        if ($this->socket !== false) {
            @fclose($this->socket);
        }
    }
}

/**
 * Return a shared IgnetRedisCache instance (lazy singleton).
 * Safe to call even when Redis is down — returns a non-connected instance
 * that returns null/false for all operations.
 *
 * @return IgnetRedisCache
 */
function getRedisCache(): IgnetRedisCache
{
    static $cache = null;
    if ($cache === null) {
        $cache = new IgnetRedisCache();
        $cache->connect();
    }
    return $cache;
}
