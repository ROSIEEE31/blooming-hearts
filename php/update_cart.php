<?php
session_start();
include('db.php');
header('Content-Type: application/json');

$data = json_decode(file_get_contents('php://input'), true);

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];
$product_id = $data['product_id'] ?? null;
$quantity_change = $data['quantity_change'] ?? null;
$new_quantity = $data['new_quantity'] ?? null;

if (!$product_id) {
    echo json_encode(['success' => false, 'message' => 'Product ID missing']);
    exit;
}

try {
    if ($quantity_change !== null) {
        $check = $conn->prepare("SELECT quantity FROM cart WHERE user_id = ? AND product_id = ?");
        $check->bind_param("ii", $user_id, $product_id);
        $check->execute();
        $result = $check->get_result();
        $row = $result->fetch_assoc();
        $current_quantity = $row['quantity'] ?? 0;
        $check->close();

        $updated_quantity = $current_quantity + $quantity_change;
        if ($updated_quantity < 1) {
            echo json_encode(['success' => false, 'message' => 'Quantity cannot be less than 1']);
            exit;
        }

        $query = "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iii", $updated_quantity, $user_id, $product_id);
    } elseif ($new_quantity !== null) {
        if ($new_quantity < 1) {
            echo json_encode(['success' => false, 'message' => 'Quantity must be at least 1']);
            exit;
        }

        $query = "UPDATE cart SET quantity = ? WHERE user_id = ? AND product_id = ?";
        $stmt = $conn->prepare($query);
        $stmt->bind_param("iii", $new_quantity, $user_id, $product_id);
    } else {
        throw new Exception("Invalid quantity update request.");
    }

    if (!$stmt) {
        throw new Exception("Failed to prepare statement.");
    }

    $stmt->execute();
    echo json_encode(['success' => true, 'message' => 'Cart updated']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
} finally {
    if (isset($stmt)) $stmt->close();
    $conn->close();
}
?>
