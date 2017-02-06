// import the required npm packages
var mysql = require("mysql");
var inquirer = require("inquirer");
var Table = require("cli-table");

// create a connection to the 
var connection = mysql.createConnection ({

	host: "localhost",
	port: 3306,

	user: "root",
	password: "Tantdyalfsw#4",
	database: "bamazon"

});

// establishing connection to the database
connection.connect(function(error){

	if (error) throw error;
	// if the connection is successfull, run the main function
	shop();

}); // connect callback function ends here


// Main function
function shop () {

	//print the products and related information on the screen
	connection.query("SELECT * FROM products", function(error, results){
		
		if (error) throw error;

		//creating a table to print out a product list neatly
		var table = new Table({

			head: [ "ID", "Product", "Department", "Price ($)", "Qty"],
			colWidths: [10, 30, 25, 10, 10]
		
		}); 
		
		// Loop through the entries in the database . . .
		for (var i = 0; i < results.length; i++){

			// . . . and push them to the created table
			table.push(

				[
				results[i].item_id,
				results[i].product_name,
				results[i].department_name,
				results[i].price,
				results[i].stock_quantity
				]

			); //Table push ends here

		} // for loop ends here

		// print out the table on the screen
		console.log(table.toString());

		//Ask the user for input
		inquirer.prompt([

			{
				type: "input",
				name: "productID",
				message: "Please enter ID for the product you want to buy: "
			},

			{
				type: "input",
				name: "quantityReqd",
				message: "Please enter the quantity you want to buy: "
			}

		// inquirer prompt ends here, and callback function begins	
		]).then(function(userInput){

			// typecast user input to an integer
			var toSell = parseInt(userInput.productID.trim());
			var qtyToSell = parseInt(userInput.quantityReqd.trim());

			// pass the user input to sale function.
			sale(toSell, qtyToSell);

		}); // inquirer callback ends here.

	}); // query callback function ends here;


} // shop function ends here


// ==================================================================================


//sale function takes user input and runs the number through database, and determines
//if the store has quantity of product in inventory as specified by the user.

function sale(item, quantity) {

	// pull the item specified by the user, from the database.
	connection.query ("SELECT * FROM products WHERE ?", 
	{ item_id : item }, function(err, res){

		if (err) throw err;

		// compare the user specified quantiy to quantity in stock, if quantity in stock
		// is greater than the user specified quantity
		if (res[0].stock_quantity >= quantity) {

			// Subtract the specified quantity from the stock
			newQuantity = res[0].stock_quantity - quantity;
			var totalPrice = res[0].price * quantity;

			// update the database with new quantity
			connection.query ("UPDATE products SET ? WHERE ?", 
			[
				{ stock_quantity : newQuantity},
				{ item_id: item }
			], function (err, res){

				if (err) throw err;

				else {

					//print total price for the user
					console.log ("Your Total will be $" + totalPrice);
					
					//escort the user out of the store
					process.exit();
				}

			}); // callback for Update query ends here

		}

		else {

			// Inform the user that we do not have enough quantity if quantity specified
			// by the user is greater than quantity in stock.
			console.log("Sorry! We do not have enough quantity");
			process.exit();

		} // else statement
	 }); // initial query for the item ends here

} // sale function ends here.