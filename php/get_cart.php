<?php
session_start();
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$user_id = $_SESSION['user_id'];

$query = "
    SELECT 
        c.product_id, 
        c.quantity, 
        p.name, 
        p.price, 
        p.image_url 
    FROM cart c
    JOIN products p ON c.product_id = p.product_id
    WHERE c.user_id = ?
";

$stmt = $conn->prepare($query);
$stmt->bind_param("i", $user_id);
$stmt->execute();
$result = $stmt->get_result();

$cart_items = [];

while ($row = $result->fetch_assoc()) {
    $cart_items[] = [
        'id' => $row['product_id'],
        'name' => $row['name'],
        'price' => $row['price'],
        'image' => $row['image_url'],
        'quantity' => $row['quantity']
    ];
}

echo json_encode([
    'success' => true,
    'items' => $cart_items
]);
?>

