<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['feedback_id'])) {
    $feedbackIdToDelete = $_POST['feedback_id'];

    try {
        $conn = getConnection();
        $sql = "DELETE FROM contact_submissions WHERE id = ?"; // Assuming your primary key is 'id'
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("i", $feedbackIdToDelete); // "i" for integer

        if ($stmt->execute()) {
            if ($stmt->affected_rows > 0) {
                echo json_encode(["success" => true, "message" => "Feedback deleted successfully."]);
            } else {
                echo json_encode(["success" => false, "message" => "Feedback not found."]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Error deleting feedback: " . $stmt->error]);
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
    echo json_encode(["success" => false, "message" => "Invalid request."]);
}
?>