<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'db.php';

try {
    $conn = getConnection();
    $sql = "SELECT id, full_name, email, created_at FROM users WHERE role = 'user'"; // Added WHERE clause to filter by role 'user'
    $result = $conn->query($sql);

    $users = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $users[] = $row;
        }
        echo json_encode(["success" => true, "users" => $users]);
    } else {
        echo json_encode(["success" => true, "users" => []]); // No users with role 'user' found is still a success
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error fetching users: " . $e->getMessage()]);
} finally {
    if ($conn) {
        $conn->close();
    }
}
?>