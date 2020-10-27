CREATE TABLE IF NOT EXISTS user (
    email VARCHAR(255) NOT NULL,
    password VARCHAR(60) NOT NULL,
    balance INT NOT NULL,
    card VARCHAR(60),
    UNIQUE(email)
);

CREATE TABLE IF NOT EXISTS item (
    id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    image VARCHAR(255) NOT NULL,
    UNIQUE(id)
);

CREATE TABLE IF NOT EXISTS user2item (
	useremail VARCHAR(255) NOT NULL,
    itemid INT NOT NULL,
    quantity INT NOT NULL
);

DELETE FROM user;
DELETE FROM item;
DELETE FROM user2item;

INSERT INTO item (id, name, image)
VALUES
(101, "Echo", "echo.jpg"),
(102, "Faun's secret", "fauns-secret.jpg"),
(103, "Pale delight", "pale-delight.jpg"),
(104, "Pink panter", "pink-panter.jpg"),
(105, "Proud Victoria", "proud-victoria.jpg"),
(106, "Purple prism", "purple-prism.jpg"),
(107, "Red velvet", "red-velvet.jpg"),
(108, "Speckled beauty", "speckled-beauty.jpg"),
(109, "Vikings verdict", "vikings-verdict.jpg"),
(110, "Yellow dawn", "yellow-dawn.jpg");
