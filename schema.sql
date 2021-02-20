CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username varchar(15) NOT NULL UNIQUE,
    password TEXT NOT NULL,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT NOT NULL
        CHECK (position('@' IN email) > 1),
    created_at TEXT NOT NULL,
    airline TEXT NOT NULL,
    is_admin BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE layovers (
    layover_code VARCHAR(3) PRIMARY KEY,
    city_name TEXT NOT NULL,
    country_name TEXT NOT NULL,
    description TEXT NOT NULL,
    currency VARCHAR(3) NOT NULL,
    language VARCHAR(18) NOT NULL,
    police INTEGER NOT NULL,
    ambulance INTEGER NOT NULL,
    international BOOLEAN NOT NULL DEFAULT TRUE,
    main_img_url TEXT,
    thumbnail_url TEXT
);

CREATE TABLE activities (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL,
    layover_code VARCHAR(3) NOT NULL,
    type_id INTEGER NOT NULL,
    address TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    body TEXT NOT NULL
);

CREATE TABLE activity_types (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL
);

CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    author_id INTEGER NOT NULL,
    activity_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    body TEXT NOT NULL
);

CREATE TABLE activity_photos (
    id SERIAL PRIMARY KEY,
    caption VARCHAR(30) NOT NULL,
    activity_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    created_at TEXT NOT NULL,
    url TEXT NOT NULL,
    main_img BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE photo_likes (
    id SERIAL PRIMARY KEY,
    photo_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    created_at TEXT NOT NULL
);

CREATE TABLE activity_likes (
    id SERIAL PRIMARY KEY,
    activity_id INTEGER NOT NULL,
    author_id INTEGER NOT NULL,
    created_at TEXT NOT NULL
);