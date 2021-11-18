module.exports = function MultiFruitBasket(data) {
    const pool = data;

    function getCategory(theType) {

        if(theType == 'Orange' || theType == 'Grape' || theType == 'Lime') {
            return 'Citrus';

        } else if (theType == 'Apricot' || theType == 'Peach' || theType == 'Plum') {
            return 'Stone fruit';
            
        } else if (theType == 'Banana' || theType == 'Mango') {
            return 'Tropical and exotic';

        } else if (theType == 'Strawberry' || theType == 'Raspberry' || theType == 'Blueberry' || theType == 'Kiwi') {
            return 'Berries';
            
        } else if (theType == 'Watermelon' || theType == 'Rockmelon' || theType == 'Honeydewmelon') {
            return 'Melons';
            
        } else if (theType == 'Apple' || theType == 'Pear' || theType == 'Avocado') {
            return 'Other fruits';
            
        }
    }

    async function getBasketId(theBasket) {
        const theId = await pool.query('SELECT * FROM multi_fruit_basket WHERE name = $1', [theBasket]);

        return theId.rows[0].id;
    }

    async function checkForDuplicate(checkFruit) {
        const theDuplicate = await pool.query('SELECT fruit_type FROM fruit_basket_item WHERE fruit_type = $1', [checkFruit]);

        return theDuplicate.rows;
    }

    async function addFruitBasketItem(fruitBasket) {
        let fruitCategory = getCategory(fruitBasket.type);
        let basketId = await getBasketId(fruitCategory);
        const fruitDuplicate = await checkForDuplicate(fruitBasket.type);

        if (fruitDuplicate.length == 0) {
            await pool.query('INSERT INTO fruit_basket_item (fruit_type, quantity, price, multi_fruit_basket_id) VALUES ($1, $2, $3, $4)', [fruitBasket.type, fruitBasket.quantity, fruitBasket.price, basketId]);

        }
    }

    async function findFruitBasket(fruit) {
        const findIt = await pool.query('SELECT fruit_type, quantity, price, multi_fruit_basket_id FROM fruit_basket_item WHERE fruit_type = $1', [fruit]);

        return findIt.rows[0];
    }

    async function getAllFruitBasket() {
        const displayBaskets = await pool.query('SELECT fruit_type, quantity, price, multi_fruit_basket_id FROM fruit_basket_item');

        return displayBaskets.rows;
    }

    async function addFruitQuantity(updateBasket) {
        let updateQty =[updateBasket.type, updateBasket.quantity]

        await pool.query('UPDATE fruit_basket_item SET quantity = quantity + $2 WHERE fruit_type = $1', updateQty);
    }

    async function showAllFruitBasketForId(givenId) {
        const displayAllForId = await pool.query(`SELECT m.id, m.name, f.fruit_type, f.quantity, f.price
                                                FROM multi_fruit_basket AS m
                                                INNER JOIN fruit_basket_item AS f ON m.id = f.multi_fruit_basket_id
                                                WHERE m.id = $1`, [givenId]);

        return displayAllForId.rows;
    }

    async function totalCostForBasketName(givenBasketName) {
        let basketId;

        if (typeof givenBasketName == 'string') {
            basketId = await getBasketId(givenBasketName);

        } else {
            basketId = givenBasketName;

        }
        
        const getTotal = await pool.query(`SELECT SUM(total_cost) AS basket_total FROM (SELECT (quantity * price) AS total_cost
                                        FROM fruit_basket_item WHERE multi_fruit_basket_id = $1) AS fruit_totals`, [basketId]);

        return getTotal.rows[0];
    }

    async function subtractFruitQuantity(updateBasket) {
        let updateQty =[updateBasket.type, updateBasket.quantity]

        await pool.query('UPDATE fruit_basket_item SET quantity = quantity - $2 WHERE fruit_type = $1', updateQty);
    }

    async function removeEmptyBasket() {
        await pool.query(`DELETE FROM fruit_basket_item WHERE quantity = 0`);

    }
    
    return {
        getCategory,
        getBasketId,
        checkForDuplicate,
        addFruitBasketItem,
        findFruitBasket,
        getAllFruitBasket,
        addFruitQuantity,
        showAllFruitBasketForId,
        totalCostForBasketName,
        subtractFruitQuantity,
        removeEmptyBasket

    };
};