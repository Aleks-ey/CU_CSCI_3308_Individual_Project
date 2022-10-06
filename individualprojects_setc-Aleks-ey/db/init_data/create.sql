DROP TABLE IF EXISTS reviews;

CREATE TABLE IF NOT EXISTS reviews (
    id          SERIAL PRIMARY KEY,
    artist_name VARCHAR(60) NOT NULL,
    review 		VARCHAR(65536) NOT NULL,
    created 	TIMESTAMPTZ NOT NULL
);

INSERT INTO reviews (artist_name, review, created) VALUES
('Kanye','wow so good', NOW()),
('Rhianna', 'wow very good', NOW()),
('John', 'who is John?', NOW());