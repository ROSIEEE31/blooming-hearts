<?php
include 'db.php'; // Include the database connection file
session_start();

header('Content-Type: application/json');

try {
    $conn = getConnection();

    if (!isset($_SESSION['user_id'])) {
        echo json_encode(["success" => false, "message" => "User not logged in."]);
        exit;
    }

    $user_id = $_SESSION['user_id'];
    $product_id = isset($_POST['product_id']) ? intval($_POST['product_id']) : 0; // Read from $_POST

    if ($product_id <= 0) {
        echo json_encode(["success" => false, "message" => "Invalid product ID."]);
        exit;
    }

    // Check if the item is already in the wishlist
    $check_sql = "SELECT * FROM wishlist WHERE user_id = ? AND product_id = ?";
    $check_stmt = $conn->prepare($check_sql);
    $check_stmt->bind_param("ii", $user_id, $product_id);
    $check_stmt->execute();
    $check_result = $check_stmt->get_result();

    if ($check_result->num_rows > 0) {
        echo json_encode(["success" => false, "message" => "Product is already in your wishlist."]);
        exit;
    }

    $sql = "INSERT INTO wishlist (user_id, product_id) VALUES (?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ii", $user_id, $product_id);

    if ($stmt->execute()) {
        echo json_encode(["success" => true, "message" => "Product added to wishlist successfully."]);
    } else {
        echo json_encode(["success" => false, "message" => "Error adding product to wishlist: " . $stmt->error]);
    }

    $stmt->close();
    $check_stmt->close();

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error adding to wishlist: ' . $e->getMessage()
    ]);
} finally {
    if ($conn) {
        $conn->close();
    }
}
?>