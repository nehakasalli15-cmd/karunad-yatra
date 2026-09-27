CREATE DATABASE IF NOT EXISTS karnataka_tourism;
USE karnataka_tourism;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tourist_places (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  city VARCHAR(255),
  district VARCHAR(255),
  description TEXT,
  category VARCHAR(100),
  best_time VARCHAR(255),
  duration VARCHAR(100),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  image_url VARCHAR(255),
  map_url VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS hotels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  destination_id INT,
  price_range VARCHAR(50),
  rating DECIMAL(3, 1),
  hotel_type VARCHAR(100),
  facilities TEXT,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  map_url VARCHAR(255),
  FOREIGN KEY (destination_id) REFERENCES tourist_places(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS restaurants (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  location VARCHAR(255),
  destination_id INT,
  cuisine VARCHAR(255),
  price_range VARCHAR(50),
  rating DECIMAL(3, 1),
  famous_dishes TEXT,
  opening_hours VARCHAR(255),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  map_url VARCHAR(255),
  FOREIGN KEY (destination_id) REFERENCES tourist_places(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS crowd_status (
  id INT AUTO_INCREMENT PRIMARY KEY,
  destination_id INT,
  crowd_level VARCHAR(50),
  estimated_count INT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (destination_id) REFERENCES tourist_places(id) ON DELETE CASCADE
);

-- Insert Sample Data
INSERT INTO tourist_places (name, city, district, description, category, best_time, duration, latitude, longitude, image_url, map_url) VALUES 
('Hampi', 'Hampi', 'Vijayanagara', 'Historic capital of the Vijayanagara Empire and a UNESCO World Heritage destination.', 'Heritage', 'October to February', '2-3 Days', 15.3350, 76.4600, '', 'https://maps.google.com/?q=15.3350,76.4600'),
('Mysuru Palace', 'Mysuru', 'Mysuru', 'Cultural capital of Karnataka known for royal heritage, palaces, festivals and traditional arts.', 'Heritage', 'October to February', '1-2 Days', 12.3051, 76.6551, '', 'https://maps.google.com/?q=12.3051,76.6551'),
('Coorg (Madikeri)', 'Madikeri', 'Kodagu', 'Known for Kodava culture, coffee plantations, forests and scenic Western Ghats landscapes.', 'Hill Station', 'October to March', '2-3 Days', 12.4244, 75.7382, '', 'https://maps.google.com/?q=12.4244,75.7382'),
('Jog Falls', 'Sagara', 'Shivamogga', 'One of the highest plunge waterfalls in India, located on the Sharavathi River.', 'Waterfalls', 'July to December', '1 Day', 14.2295, 74.8153, '', 'https://maps.google.com/?q=14.2295,74.8153'),
('Gokarna Beaches', 'Gokarna', 'Uttara Kannada', 'Known for pristine beaches and the Mahabaleshwar Temple.', 'Beaches', 'October to March', '2 Days', 14.5500, 74.3188, '', 'https://maps.google.com/?q=14.5500,74.3188'),
('Bandipur National Park', 'Bandipur', 'Chamarajanagar', 'Famous tiger reserve and national park in southern Karnataka.', 'Wildlife', 'October to May', '1-2 Days', 11.6669, 76.6285, '', 'https://maps.google.com/?q=11.6669,76.6285');

INSERT INTO hotels (name, location, destination_id, price_range, rating, hotel_type, facilities, latitude, longitude) VALUES 
('Heritage Resort Hampi', 'Hampi', 1, '4000-8000', 4.5, 'Resort', 'Pool, WiFi, Restaurant, Spa', 15.3350, 76.4600),
('Royal Orchid Metropole', 'Mysuru', 2, '5000-10000', 4.6, 'Luxury Hotel', 'Pool, WiFi, Restaurant, Heritage', 12.3051, 76.6551),
('Taj Madikeri Resort & Spa', 'Madikeri', 3, '10000-20000', 4.8, 'Luxury Resort', 'Pool, Spa, Nature Walk', 12.4244, 75.7382),
('Jungle Lodges & Resorts', 'Bandipur', 6, '6000-12000', 4.4, 'Wildlife Resort', 'Safari, Restaurant, Nature Walk', 11.6669, 76.6285);

INSERT INTO restaurants (name, location, destination_id, cuisine, price_range, rating, famous_dishes, opening_hours, latitude, longitude) VALUES 
('Mango Tree Restaurant', 'Hampi', 1, 'Indian, Continental', '500-1000', 4.3, 'Thali, Banana Pancakes', '8 AM - 10 PM', 15.3350, 76.4600),
('Mylari Hotel', 'Mysuru', 2, 'South Indian', '100-300', 4.7, 'Mylari Dosa', '6 AM - 1 PM, 3 PM - 8 PM', 12.3051, 76.6551),
('Coorg Cuisine', 'Madikeri', 3, 'Kodava, South Indian', '400-800', 4.4, 'Pandi Curry, Kadambuttu', '12 PM - 10 PM', 12.4244, 75.7382);

INSERT INTO crowd_status (destination_id, crowd_level, estimated_count) VALUES 
(1, 'Moderate', 1500),
(2, 'High', 5000),
(3, 'High', 3000),
(4, 'Low', 500),
(5, 'Moderate', 2000),
(6, 'Low', 300);
