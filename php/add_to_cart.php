<?php
include 'db.php'; // Include your database connection file
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

if (isset($_POST['product_id']) && isset($_POST['quantity'])) {
    $product_id = intval($_POST['product_id']);
    $quantity = intval($_POST['quantity']);

    if ($product_id <= 0 || $quantity <= 0) {
        echo json_encode(['success' => false, 'message' => 'Invalid product ID or quantity']);
        exit;
    }

    try {
        $conn = getConnection();

        // 1. Add to cart logic (your existing code)
        $check_cart_sql = "SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?";
        $check_cart_stmt = $conn->prepare($check_cart_sql);
        $check_cart_stmt->bind_param("ii", $user_id, $product_id);
        $check_cart_stmt->execute();
        $check_cart_result = $check_cart_stmt->get_result();

        if ($check_cart_result->num_rows > 0) {
            $row = $check_cart_result->fetch_assoc();
            $new_quantity = $row['quantity'] + $quantity;
            $update_cart_sql = "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?";
            $update_cart_stmt = $conn->prepare($update_cart_sql);
            $update_cart_stmt->bind_param("iii", $new_quantity, $user_id, $product_id);
            $cart_success = $update_cart_stmt->execute();
        } else {
            $insert_cart_sql = "INSERT INTO cart (user_id, product_id, quantity, added_at) VALUES (?, ?, ?, NOW())";
            $insert_cart_stmt = $conn->prepare($insert_cart_sql);
            $insert_cart_stmt->bind_param("iii", $user_id, $product_id, $quantity);
            $cart_success = $insert_cart_stmt->execute();
        }

        if ($cart_success) {
            // 2. Remove from wishlist after successfully adding to cart
            $delete_wishlist_sql = "DELETE FROM wishlist WHERE user_id = ? AND product_id = ?";
            $delete_wishlist_stmt = $conn->prepare($delete_wishlist_sql);
            $delete_wishlist_stmt->bind_param("ii", $user_id, $product_id);
            $delete_wishlist_stmt->execute(); // We don't need to check affected rows here

            echo json_encode(['success' => true, 'message' => 'Cart updated successfully <3.']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Failed to update cart.']);
        }

        if (isset($check_cart_stmt)) $check_cart_stmt->close();
        if (isset($update_cart_stmt)) $update_cart_stmt->close();
        if (isset($insert_cart_stmt)) $insert_cart_stmt->close();
        if (isset($delete_wishlist_stmt)) $delete_wishlist_stmt->close();
        $conn->close();

    } catch (Exception $e) {
        echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Product ID or quantity missing']);
}
?>


