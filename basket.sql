CREATE TABLE multi_fruit_basket (
    id SERIAL NOT NULL PRIMARY KEY,
    name TEXT NOT NULL
);

CREATE TABLE fruit_basket_item (
    id SERIAL NOT NULL PRIMARY KEY, 
    fruit_type TEXT NOT NULL,
    quantity INT,
    price FLOAT(2) NOT NULL,
    multi_fruit_basket_id INT NOT NULL,
    FOREIGN KEY (multi_fruit_basket_id) REFERENCES multi_fruit_basket(id)
);

INSERT INTO multi_fruit_basket (name) VALUES ('Berries');
INSERT INTO multi_fruit_basket (name) VALUES ('Citrus');
INSERT INTO multi_fruit_basket (name) VALUES ('Stone fruit');
INSERT INTO multi_fruit_basket (name) VALUES ('Tropical and exotic');
INSERT INTO multi_fruit_basket (name) VALUES ('Melons');
INSERT INTO multi_fruit_basket (name) VALUES ('Other fruits');

-- Citrus – [Oranges, Grape, Lime]
-- Stone fruit – [Apricot, Peach, Plum]
-- Tropical and exotic – [Banana, Mango]
-- Berries – [Strawberry, Raspberry, Blueberry, Kiwi]
-- Melons – [Watermelon, Rockmelon, Honeydewmelon]
-- Other fruits – [Apple, Pear, Avocado]