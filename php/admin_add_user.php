<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $full_name = $_POST['full_name'] ?? '';
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? ''; // Get the password from the form

    // Basic input validation
    if (empty($full_name) || empty($email) || empty($password)) {
        echo json_encode(["success" => false, "message" => "All fields are required."]);
        exit();
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode(["success" => false, "message" => "Invalid email format."]);
        exit();
    }

    try {
        $conn = getConnection();

        // Hash the password securely
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Set the default role for new users
        $role = 'user';

        // Prepare the SQL statement to prevent SQL injection
        $sql = "INSERT INTO users (full_name, email, password, role, created_at) VALUES (?, ?, ?, ?, NOW())";
        $stmt = $conn->prepare($sql);

        // Bind the parameters
        $stmt->bind_param("ssss", $full_name, $email, $hashed_password, $role);

        // Execute the statement
        if ($stmt->execute()) {
            echo json_encode(["success" => true, "message" => "User added successfully."]);
        } else {
            echo json_encode(["success" => false, "message" => "Error adding user: " . $stmt->error]);
        }

        $stmt->close();
    } catch (Exception $e) {
        echo json_encode(["success" => false, "message" => "Database error: " . $e->getMessage()]);
    } finally {
        if ($conn) {
            $conn->close();
        }
    }
} else {
    echo json_encode(["success" => false, "message" => "Invalid request method."]);
}
?>