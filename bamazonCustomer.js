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

		var table = new Table({

			head: [ "ID", "Product", "Department", "Price ($)", "Qty"],
			colWidths: [10, 30, 25, 10, 10]
		
		}); 
		
		for (var i = 0; i < results.length; i++){

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

	console.log(item);

	connection.query ("SELECT * FROM products WHERE ?", 
	{ item_id : item }, function(err, res){

		if (err) throw err;

		if (res[0].stock_quantity >= quantity) {

			newQuantity = res[0].stock_quantity - quantity;
			var totalPrice = res[0].price * quantity;

			connection.query ("UPDATE products SET ? WHERE ?", 
			[
				{ stock_quantity : newQuantity},
				{ item_id: item }
			], function (err, res){

				if (err) throw err;

				else {

					console.log ("Your Total will be $" + totalPrice);
					process.exit();
				}

			}); // callback for Update query ends here

		}

		else {
			console.log("Sorry! We do not have enough quantity");
			process.exit();

		}
	 });

}