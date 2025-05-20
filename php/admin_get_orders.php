<?php
header('Content-Type: application/json; charset=utf-8');

require_once 'db.php';

try {
    $conn = getConnection();
    $sql = "SELECT
                order_id,
                user_id,
                order_date,
                total_amount,
                shipping_address,
                billing_address,
                payment_method,
                payment_status,
                shipping_method,
                shipping_status,
                order_status,
                transaction_id,
                created_at
            FROM
                orders
            ORDER BY
                order_id ASC"; // Order by creation date, newest first
    $result = $conn->query($sql);

    $orders = [];
    if ($result->num_rows > 0) {
        while ($row = $result->fetch_assoc()) {
            $orders[] = $row;
        }
        echo json_encode(["success" => true, "orders" => $orders]);
    } else {
        echo json_encode(["success" => true, "orders" => []]); // No orders found
    }
} catch (Exception $e) {
    echo json_encode(["success" => false, "message" => "Error fetching orders: " . $e->getMessage()]);
} finally {
    if ($conn) {
        $conn->close();
    }
}
?>