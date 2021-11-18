let assert = require('assert');
const MultiFruitBasket = require('../multi-fruit_basket');
const {Pool} = require('pg');

const connectionString = process.env.DATABASE_URL || 'postgresql://codex:pg123@localhost:5432/multi_fruit_basket_test';

const pool = new Pool({
	connectionString,
	ssl : {
		rejectUnauthorized:false
	}
});

describe('Multi fruit basket' , function(){
	beforeEach(async function(){
		// clean the tables before each test run
		await pool.query('DELETE FROM fruit_basket_item;');
	});

	it('Should create a new fruit basket for a given fruit type, qty & fruit price', async function(){
		let multiFruitBasket = MultiFruitBasket(pool);

		await multiFruitBasket.addFruitBasketItem({type: 'Apple', quantity: 12, price: 2.50});
		await multiFruitBasket.addFruitBasketItem({type: 'Apple', quantity: 5, price: 2.00});

		assert.deepEqual([{fruit_type: 'Apple', quantity: 12, price: 2.50, multi_fruit_basket_id: 6}], await multiFruitBasket.getAllFruitBasket());
	});

	it('Should add fruits to an existing basket', async function(){
		let multiFruitBasket = MultiFruitBasket(pool);

		await multiFruitBasket.addFruitBasketItem({type: 'Apricot', quantity: 8, price: 2.50});
		await multiFruitBasket.addFruitBasketItem({type: 'Plum', quantity: 3, price: 3.00});
		await multiFruitBasket.addFruitBasketItem({type: 'Lime', quantity: 5, price: 3.50});

		await multiFruitBasket.addFruitQuantity({type: 'Plum', quantity: 3})

		assert.deepEqual({fruit_type: 'Plum', quantity: 6, price: 3.00, multi_fruit_basket_id: 3}, await multiFruitBasket.findFruitBasket('Plum'));
	});

	it('Should remove fruits from an existing basket', async function(){
		let multiFruitBasket = MultiFruitBasket(pool);

		await multiFruitBasket.addFruitBasketItem({type: 'Apricot', quantity: 8, price: 2.50});
		await multiFruitBasket.addFruitBasketItem({type: 'Plum', quantity: 3, price: 3.00});
		await multiFruitBasket.addFruitBasketItem({type: 'Lime', quantity: 5, price: 3.50});

		await multiFruitBasket.subtractFruitQuantity({type: 'Apricot', quantity: 6})

		assert.deepEqual({fruit_type: 'Apricot', quantity: 2, price: 2.50, multi_fruit_basket_id: 3}, await multiFruitBasket.findFruitBasket('Apricot'));
	});

	it('Should remove the fruit basket if there are no fruit left', async function(){
		let multiFruitBasket = MultiFruitBasket(pool);

		await multiFruitBasket.addFruitBasketItem({type: 'Honeydewmelon', quantity: 3, price: 7.50});
		await multiFruitBasket.addFruitBasketItem({type: 'Mango', quantity: 10, price: 9.50});
		await multiFruitBasket.addFruitBasketItem({type: 'Kiwi', quantity: 2, price: 6.00});
		await multiFruitBasket.addFruitBasketItem({type: 'Blueberry', quantity: 4, price: 8.00});

		await multiFruitBasket.subtractFruitQuantity({type: 'Honeydewmelon', quantity: 3})

		await multiFruitBasket.removeEmptyBasket();

		assert.equal(undefined , await multiFruitBasket.findFruitBasket('Honeydewmelon'));
	});

	it('Should return the basket_name & id as well as a list of all the fruits in the basket for a given id', async function(){
		let multiFruitBasket = MultiFruitBasket(pool);

		await multiFruitBasket.addFruitBasketItem({type: 'Apple', quantity: 12, price: 2.50});
		await multiFruitBasket.addFruitBasketItem({type: 'Banana', quantity: 15, price: 1.50});
		await multiFruitBasket.addFruitBasketItem({type: 'Orange', quantity: 10, price: 3.50});
		await multiFruitBasket.addFruitBasketItem({type: 'Strawberry', quantity: 5, price: 12.00});
		await multiFruitBasket.addFruitBasketItem({type: 'Raspberry', quantity: 10, price: 10.50});

		assert.deepEqual([{id: 1, name: 'Berries', fruit_type: 'Strawberry', quantity: 5, price: 12.00},
						{id: 1, name: 'Berries', fruit_type: 'Raspberry', quantity: 10, price: 10.50}], await multiFruitBasket.showAllFruitBasketForId(1));
	});

	it('Should return the total cost of a specific basket based on basket name', async function(){
		let multiFruitBasket = MultiFruitBasket(pool);

		await multiFruitBasket.addFruitBasketItem({type: 'Apple', quantity: 12, price: 2.50});
		await multiFruitBasket.addFruitBasketItem({type: 'Banana', quantity: 15, price: 1.50});
		await multiFruitBasket.addFruitBasketItem({type: 'Orange', quantity: 10, price: 3.50});
		await multiFruitBasket.addFruitBasketItem({type: 'Strawberry', quantity: 5, price: 12.00});
		await multiFruitBasket.addFruitBasketItem({type: 'Raspberry', quantity: 10, price: 10.50});

		assert.deepEqual({basket_total: 165.00}, await multiFruitBasket.totalCostForBasketName('Berries'));
	});

	it('Should return the total cost of a specific basket based on the basket id', async function(){
		let multiFruitBasket = MultiFruitBasket(pool);

		await multiFruitBasket.addFruitBasketItem({type: 'Banana', quantity: 13, price: 1.50});
		await multiFruitBasket.addFruitBasketItem({type: 'Mango', quantity: 10, price: 9.50});
		await multiFruitBasket.addFruitBasketItem({type: 'Kiwi', quantity: 2, price: 6.00});
		await multiFruitBasket.addFruitBasketItem({type: 'Blueberry', quantity: 4, price: 8.00});

		assert.deepEqual({basket_total: 114.50}, await multiFruitBasket.totalCostForBasketName(4));
	});

	after(function(){
		pool.end();
	});
});