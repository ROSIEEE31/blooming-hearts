<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'db.php';

try {
    $conn = getConnection();
    $sql = "SELECT
                id,
                full_name,
                email,
                subject,
                message,
                submission_date
            FROM
                contact_submissions
            ORDER BY
                id ASC"; // Order by id, newest first (assuming higher ID is newer)
    $result = $conn->query($sql);

    $feedback_items = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $feedback_items[] = $row;
        }
        echo json_encode(["success" => true, "feedback" => $feedback_items]);
    } else {
        echo json_encode(["success" => true, "feedback" => []]); // No feedback found
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error fetching feedback: " . $e->getMessage()]);
} finally {
    if ($conn) {
        $conn->close();
    }
}
?>