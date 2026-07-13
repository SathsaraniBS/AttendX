CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    student_id VARCHAR(20),
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(20),
    class_name VARCHAR(100),
    status VARCHAR(20) DEFAULT 'Active',
    join_date DATE,
    photo_path VARCHAR(255),
    face_encoding TEXT
);

CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50),
    teacher VARCHAR(100),
    schedule VARCHAR(100),
    room VARCHAR(50),
    capacity INTEGER DEFAULT 40,
    status VARCHAR(20) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS attendance (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'Present',
    time_in TIME,
    UNIQUE(student_id, date)
);

CREATE TABLE IF NOT EXISTS verification_logs (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES students(id),
    cosine_distance FLOAT,
    euclidean_distance FLOAT,
    confidence FLOAT,
    verified BOOLEAN,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Insert the admin test user (matches password used in test_api.py)
INSERT INTO users (email, password, role)
VALUES ('admin@attendx.com', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING;