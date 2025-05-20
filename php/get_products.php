<?php
    ini_set('display_errors', 1);
    ini_set('display_startup_errors', 1);
    error_reporting(E_ALL);

    // get_products.php
    // Include the database connection file
    include 'db.php';

    // Set the content type to JSON and charset
    header('Content-Type: application/json; charset=utf-8');

    // Check if the database connection was successful
    if (!$conn) {
        $error = error_get_last();
        die(json_encode(['success' => false, 'message' => 'Failed to connect to database: ' . $error['message']]));
    }

    // Query to select all products from the products table
    $sql = "SELECT id, name, price, image_url FROM products";

    $result = $conn->query($sql);

    if ($result->num_rows > 0) {
        // Fetch all products into an array
        $products = [];
        while ($row = $result->fetch_assoc()) {
            $products[] = $row;
        }
        // Send the products as a JSON response
        echo json_encode(['success' => true, 'products' => $products]);
    } else {
        // If no products found, send a message
        echo json_encode(['success' => true, 'products' => [], 'message' => 'No products found']);
    }

    $conn->close();
    ?>
    