-- Admins Table
CREATE TABLE admins (
    admin_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(100) NOT NULL
);

INSERT INTO admins (admin_id, name, email, password)
VALUES 
    (1, 'Sujal Jakakure', 'sujaljakakure.sj@gmail.com', 'scrypt:32768:8:1$J9MKJekdma3DhMPy$4a574bffa4f8df56dfafa579eb0b9ffb09f4555c177d1820313d48910913d4f133c35a0944fdef7815c97254a5c0910babc22ee04cd4b3deda371ba16c775240'),
    (2, 'Alok Meshram' ,'alokmeshram.am@gmail.com', 'scrypt:32768:8:1$BkjOiRb92dwrbLLL$231fd92565abdd7b9fcaae347442eac6cf79f3cb9f72a37575c893e918eef0e0d8ce28abf1fae6945f4ffe9b2184ece1e8ed1b17e6dcbafcc7667b6ed101cf4d'),
    (3, 'Sarthak Gaikar','sarthakgaikar.sg@gmail.com', 'scrypt:32768:8:1$Dskn3ZgROrl7d0ba$c6a060f905dcb7b596f29651089b2db06db634054b40f052a462a610ea723550224d05fe05dabf32bdd032f51188546d6158b73100a5315960e3043607d2325a');

ALTER TABLE admins ALTER COLUMN password TYPE TEXT;

-- Trainers Table
CREATE TABLE trainers (
    trainer_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Changed to TEXT for hashed passwords
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    expertise TEXT
);

-- Members Table
CREATE TABLE members (
    member_id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL, -- Changed to TEXT
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(15),
    membership_plan VARCHAR(100),
    membership_expiry DATE,
    trainer_id INT REFERENCES trainers(trainer_id) ON DELETE SET NULL
);

-- Attendance Table
CREATE TABLE attendance (
    attendance_id SERIAL PRIMARY KEY,
    member_id INT REFERENCES members(member_id) ON DELETE CASCADE,
    check_in TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    check_out TIMESTAMP
);

-- Payments Table
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    member_id INT REFERENCES members(member_id) ON DELETE CASCADE,
    amount NUMERIC(10,2),
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50)  -- Removed non-breaking space and fixed syntax
);

ALTER TABLE members 
ADD COLUMN age INT,
ADD COLUMN gender VARCHAR(10),
ADD COLUMN address TEXT,
ADD COLUMN emergency_contact VARCHAR(15);

ALTER TABLE trainers 
ADD COLUMN certifications TEXT,
ADD COLUMN availability VARCHAR(50);  -- Example: "Mon-Fri: 9 AM - 6 PM"

ALTER TABLE payments 
ADD COLUMN payment_method VARCHAR(50);  -- Example: "Credit Card", "UPI", "Cash"

-- Feedback Table
CREATE TABLE feedbacks (
    feedback_id SERIAL PRIMARY KEY,
    member_id INT REFERENCES members(member_id) ON DELETE CASCADE,
    trainer_id INT REFERENCES trainers(trainer_id) ON DELETE SET NULL,
    feedback_text TEXT NOT NULL,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE feedbacks
ADD COLUMN admin_response TEXT; -- Admin can respond to feedback

CREATE TABLE workout_plans (
    plan_id SERIAL PRIMARY KEY,
    member_id INT REFERENCES members(member_id) ON DELETE CASCADE,
    trainer_id INT REFERENCES trainers(trainer_id) ON DELETE SET NULL,
    plan_details TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE diet_plans (
    diet_id SERIAL PRIMARY KEY,
    member_id INT REFERENCES members(member_id) ON DELETE CASCADE,
    trainer_id INT REFERENCES trainers(trainer_id) ON DELETE SET NULL,
    diet_details TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE class_bookings (
    booking_id SERIAL PRIMARY KEY,
    member_id INT REFERENCES members(member_id) ON DELETE CASCADE,
    class_name VARCHAR(100),
    trainer_id INT REFERENCES trainers(trainer_id) ON DELETE SET NULL,
    class_time TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Booked'  -- "Booked", "Cancelled", "Completed"
);


CREATE TABLE equipment_maintenance (
    maintenance_id SERIAL PRIMARY KEY,
    equipment_name VARCHAR(100) NOT NULL,
    last_service_date DATE,
    next_service_due DATE,
    status VARCHAR(50) DEFAULT 'Working'  -- "Working", "Needs Repair", "Under Maintenance"
);


UPDATE admins SET password = 'scrypt:32768:8:1$xK8g0s7xBJJWBQB5$c37b43eda1e38f07bb60d5d42e6c5e7750985424f11559d7ca3027e6696498bb1d97c474e3f56d1db2c9bcada1530aa159244891d976f8fa762fe8c21b98e8aa' WHERE admin_id = 1;
UPDATE admins SET password = 'scrypt:32768:8:1$Mw1apkIXho0cZVem$399ecac8c54ff21b9ed57492da2bcf92163d15e508a3aa33ce9c8a5b49b556d41e2a41e93d7fe89500033eea16a9cd1668d1f0a662ff0af9bba8d6c9dadc08b0' WHERE admin_id = 2;
UPDATE admins SET password = 'scrypt:32768:8:1$UbP8HBzmJf9KFWoC$1ae371e7f1176501a373b0037e758a11a8c3bae18dbb71be7e3d2b04ed8069848eb13c99c8aa78558372b6ed2ae6da5ada3016dbcc6288def2cc19df030ea636' WHERE admin_id = 3;

ALTER TABLE trainers 
ADD COLUMN phone_number VARCHAR(15) UNIQUE;
