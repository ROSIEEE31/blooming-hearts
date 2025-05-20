<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
session_start();
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'User not logged in']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$cardNumber = $data['cardNumber'] ?? '';
$expiry = $data['expiry'] ?? '';
$cvv = $data['cvv'] ?? '';
$total_amount = str_replace('₹', '', $data['amount'] ?? '0.00'); // Clean the amount
$items = $data['items'] ?? [];

if (empty($cardNumber) || empty($expiry) || empty($cvv) || empty($total_amount) || empty($items)) {
    echo json_encode(['success' => false, 'message' => 'Payment details or cart items are incomplete']);
    exit;
}

// Simulate payment processing (replace with actual payment gateway integration)
$paymentSuccessful = true; // For simulation, always true
$transactionId = 'SIMULATED_' . uniqid(); // Generate a simulated transaction ID

if ($paymentSuccessful) {
    $user_id = $_SESSION['user_id'];

    // 1. Insert order details into the 'orders' table
    $query = "INSERT INTO orders (user_id, total_amount, order_date, payment_method, payment_status, transaction_id) VALUES (?, ?, NOW(), 'Credit Card', 'Completed', ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("ids", $user_id, $total_amount, $transactionId);
    $stmt->execute();
    $order_id = $stmt->insert_id;

    if ($order_id) {
       // 2. Insert each item into the 'order_items' table
foreach ($items as $item) {
    // Extract product name and price
    $product_name = $item['name'];
    $client_unit_price = str_replace('₹', '', $item['price']); // Price sent from client

    // Extract quantity from the name
    $quantity = 1;
    if (preg_match('/x(\d+)$/', $product_name, $matches)) {
        $quantity = intval($matches[1]);
        $product_name = trim(preg_replace('/x\d+$/', '', $product_name));
    }

    // Fetch the product_id and price from the products table based on the product_name
    $query_product = "SELECT product_id, price FROM products WHERE name = ?";
    $stmt_product = $conn->prepare($query_product);
    $stmt_product->bind_param("s", $product_name);
    $stmt_product->execute();
    $result_product = $stmt_product->get_result();
    $product_row = $result_product->fetch_assoc();

    if ($product_row && isset($product_row['product_id'])) {
        $product_id = $product_row['product_id'];
        // Use the price from the database as the unit_price
        $unit_price = $product_row['price'];
        $subtotal = $unit_price * $quantity;

        $query_items = "INSERT INTO order_items (order_id, product_id, quantity, unit_price, subtotal) VALUES (?, ?, ?, ?, ?)";
        $stmt_items = $conn->prepare($query_items);
        $stmt_items->bind_param("iiidd", $order_id, $product_id, $quantity, $unit_price, $subtotal);
        $stmt_items->execute();
    } else {
        echo json_encode(['success' => false, 'message' => 'Product not found: ' . $product_name]);
        exit;
    }

    $stmt_product->close();
}

        // 3. (Optional) Clear the user's cart
        $query_clear_cart = "DELETE FROM cart WHERE user_id = ?";
        $stmt_clear_cart = $conn->prepare($query_clear_cart);
        $stmt_clear_cart->bind_param("i", $user_id);
        $stmt_clear_cart->execute();

        echo json_encode(['success' => true, 'message' => 'Order placed successfully!', 'order_id' => $order_id]);
    } else {
        echo json_encode(['success' => false, 'message' => 'Failed to create order. Please try again.']);
    }

} else {
    echo json_encode(['success' => false, 'message' => 'Payment processing failed. Please try again.']);
}

// Close connections
if (isset($stmt)) $stmt->close();
if (isset($stmt_items)) $stmt_items->close();
if (isset($stmt_clear_cart)) $stmt_clear_cart->close();
$conn->close();

?>