<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'db.php';

try {
    $conn = getConnection();

    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $user_id = $conn->real_escape_string($_POST["user_id"]);

        $sql = "DELETE FROM users WHERE id = $user_id";

        if ($conn->query($sql) === TRUE) {
            echo json_encode(["success" => true, "message" => "User deleted successfully"]);
        } else {
            echo json_encode(["success" => false, "message" => "Error deleting user: " . $conn->error]);
        }
    } else {
        echo json_encode(["success" => false, "message" => "Invalid request method"]);
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error deleting user: " . $e->getMessage()]);
} finally {
    if ($conn) {
        $conn->close();
    }
}
?>