<?php
// Error handling
error_reporting(E_ALL);
ini_set('display_errors', 0); // Disable error display for security
ini_set('log_errors', 1);
ini_set('error_log', 'php_errors.log');

/**
 * Establishes a connection to the MySQL database.
 *
 * @return mysqli The database connection object.
 * @throws Exception If the connection fails.
 */
function getConnection(): mysqli
{
    try {
        $host = 'localhost';
        $port = 3307;
        $username = 'root';
        $password = '';
        $database = 'rose';

        $conn = new mysqli($host, $username, $password, $database, $port);

        if ($conn->connect_error) {
            throw new Exception('Database connection failed: ' . $conn->connect_error);
        }

        $conn->set_charset("utf8mb4");
        return $conn;
    } catch (Exception $e) {
        throw new Exception('Database connection error: ' . $e->getMessage());
    }
}

// Attempt to get a connection.  This is only executed if the file is directly included
try {
    $conn = getConnection();
} catch (Exception $e) {
    // Only output JSON response if this file is accessed directly (e.g., for testing).
    if (count(debug_backtrace()) === 0) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => $e->getMessage()
        ]);
        exit;
    }
    // If this file is included by another, the other file should handle the error.
    throw $e;
}
?>
