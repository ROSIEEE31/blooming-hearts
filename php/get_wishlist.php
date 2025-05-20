<?php
include 'db.php'; // Include the database connection file
session_start();

header('Content-Type: application/json'); // Set the content type for JSON responses

try {
    $conn = getConnection(); // Get the database connection

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["success" => false, "message" => "User not logged in."]);
        exit;
    }

    $user_id = $_SESSION['user_id'];

    // First, get the total number of items in the wishlist
    $count_sql = "SELECT COUNT(*) AS total FROM wishlist WHERE user_id = ?";
    $count_stmt = $conn->prepare($count_sql);
    $count_stmt->bind_param("i", $user_id);
    $count_stmt->execute();
    $count_result = $count_stmt->get_result();
    $total_items = 0;
    if ($count_result->num_rows > 0) {
        $row = $count_result->fetch_assoc();
        $total_items = $row['total'];
    }
    $count_stmt->close();

    // Then, get the wishlist items
    $sql = "SELECT
                w.product_id,
                p.name,
                p.description,
                p.price,
                p.image_url
            FROM
                wishlist w
            JOIN
                products p ON w.product_id = p.product_id
            WHERE
                w.user_id = ?";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result();

    $wishlist_items = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $wishlist_items[] = $row;
        }
    }

    $stmt->close();
    echo json_encode(["success" => true, "total_items" => $total_items, "wishlist" => $wishlist_items]);

} catch (Exception $e) {
    // Handle database errors
    echo json_encode([
        'success' => false,
        'message' => 'Error loading wishlist: ' . $e->getMessage()
    ]);
} finally {
    if ($conn) {
        $conn->close();
    }
}
?>