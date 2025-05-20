<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['order_id'])) {
    $orderIdToDelete = $_POST['order_id'];

    try {
        $conn = getConnection();

        // 1. Delete related items from the order_items table
        $sqlDeleteItem = "DELETE FROM order_items WHERE order_id = ?";
        $stmtDeleteItem = $conn->prepare($sqlDeleteItem);
        $stmtDeleteItem->bind_param("i", $orderIdToDelete);
        $stmtDeleteItem->execute();
        $stmtDeleteItem->close();

        // 2. Now delete the order from the orders table
        $sqlDeleteOrder = "DELETE FROM orders WHERE order_id = ?";
        $stmtDeleteOrder = $conn->prepare($sqlDeleteOrder);
        $stmtDeleteOrder->bind_param("i", $orderIdToDelete);

        if ($stmtDeleteOrder->execute()) {
            if ($stmtDeleteOrder->affected_rows > 0) {
                echo json_encode(["success" => true, "message" => "Order and associated items deleted successfully."]);
            } else {
                echo json_encode(["success" => false, "message" => "Order not found."]);
            }
        } else {
            echo json_encode(["success" => false, "message" => "Error deleting order: " . $stmtDeleteOrder->error]);
        }

        $stmtDeleteOrder->close();

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