-- Create admin accounts with password #Admin123
INSERT INTO users (full_name, email, password, role) VALUES 
('Admin Rose', 'adminrose@gmail.com', '$2y$10$iQIA2ZvsVUHh9cXpHCvX1OgpQkupLfwM054f7liGL1B14tdGhDUPy', 'admin'),
('Admin Chinnu', 'adminchinnu@gmail.com', '$2y$10$iQIA2ZvsVUHh9cXpHCvX1OgpQkupLfwM054f7liGL1B14tdGhDUPy', 'admin');

-- Delete unauthorized admin accounts
DELETE FROM users WHERE email LIKE '%admin%' AND role != 'admin';

-- Update admin passwords to #Admin123
UPDATE users 
SET password = '$2y$10$Wd..FM1Z2oycauNr9PLm5evnL6qjVCbKqPy/a.PkGx9yrk4HKUdqa'
WHERE email IN ('adminrose@gmail.com', 'adminchinnu@gmail.com'); 