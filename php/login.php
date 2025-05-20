<?php
// Prevent any output before JSON response
ob_start();

// Error handling
error_reporting(E_ALL);
ini_set('display_errors', 0); // Disable error display
ini_set('log_errors', 1); // Enable error logging
ini_set('error_log', 'php_errors.log'); // Set error log file

header('Content-Type: application/json');
session_start();

try {
    // Database connection
    $host = 'localhost';
    $port = 3307;  // Using the correct port from db.php
    $username = 'root';
    $password = '';
    $database = 'rose';

    $conn = new mysqli($host, $username, $password, $database, $port);

    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }

    $conn->set_charset("utf8mb4");

    // Get and validate input
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    if (empty($email) || empty($password)) {
        throw new Exception('Email and password are required.');
    }

    // Prepare statement
    $stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
    if (!$stmt) {
        throw new Exception('Database error: ' . $conn->error);
    }

    // Bind parameters and execute
    $stmt->bind_param("s", $email);
    if (!$stmt->execute()) {
        throw new Exception('Database error: ' . $stmt->error);
    }

    $result = $stmt->get_result();

    if ($result && $result->num_rows > 0) {
        $user = $result->fetch_assoc();

        if (password_verify($password, $user['password'])) {
            // Set session variables
            $_SESSION['email'] = $user['email'];
            $_SESSION['full_name'] = $user['full_name'];
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['role'] = $user['role'];

            $redirect = ($user['role'] === 'admin') ? '../html/admin.html' : '../html/dashboard.html';

            $response = [
                'success' => true,
                'message' => 'Login successful!',
                'redirect' => $redirect,
                'full_name' => $user['full_name'],
                'email' => $user['email'],
                'role' => $user['role']
            ];
        } else {
            throw new Exception('Incorrect password.');
        }
    } else {
        throw new Exception('No account found with this email.');
    }

    $stmt->close();
    $conn->close();

} catch (Exception $e) {
    // Clear any output buffers
    while (ob_get_level()) {
        ob_end_clean();
    }
    
    $response = [
        'success' => false,
        'message' => $e->getMessage()
    ];
}

// Clear any remaining output buffer
while (ob_get_level()) {
    ob_end_clean();
}

// Ensure we always return a JSON response
echo json_encode($response ?? ['success' => false, 'message' => 'An unknown error occurred']);
