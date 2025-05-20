<?php
include 'db.php';  // Include the database connection file
session_start();

header('Content-Type: application/json');

try {
    $conn = getConnection();  // Get the database connection

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["success" => false, "message" => "User not logged in."]);
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $data = json_decode(file_get_contents('php://input'), true);
    $product_id = isset($data['product_id']) ? intval($data['product_id']) : 0;

    if ($product_id <= 0) {
        echo json_encode(["success" => false, "message" => "Invalid product ID."]);
        exit;
    }

    $sql = "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $user_id, $product_id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Product removed from wishlist successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error removing product from wishlist: " . $stmt->error]);
    }

    $stmt->close();
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error removing from wishlist: ' . $e->getMessage()
    ]);
} finally {
    if ($conn) {
        $conn->close();  // Close the database connection
    }
}
?>