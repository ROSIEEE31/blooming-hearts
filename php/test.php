<?php
// Include the database connection file
$conn = require_once 'db.php';

// Check if connection is successful
if ($conn) {
    echo "Connected successfully!";
} else {
    echo "Connection failed!";
}
?> 