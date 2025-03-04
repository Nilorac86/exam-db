import db from './database.js';

export{getProducts,getProductById, getProductsBySearch, getProductByCategoryId, 
    addProducts, updateProductById, deleteProduct, getCustomerById , updateCustomerById, 
    getCustomerOrdersById, getProductStat, getReviewsStats, getProductsByNameAndCategory,}


//############################ PRODUCTS #################################

// ################### Query som hämtar produkter, kategorier och tillverkare med join ######################

const getProducts = () => {

    try{
        const products = db.prepare(`SELECT products.product_id, products.name AS productName,
                             products.description, products.price, products.stock,
                             categories.name AS categoryName, 
                             manufacturers.name AS manufacturerName
                             FROM products
                             JOIN products_categories
                             ON products.product_id= products_categories.product_id
                             JOIN manufacturers 
                             ON products.manufacturer_id = manufacturers.manufacturer_id
                             LEFT JOIN categories
                             ON categories.category_id = products_categories.category_id;`)
                            .all();
        
    return products; // Returnerar query svaret.

    // Fångar och kastar och loggar fel i databas.
} catch (error) {
    console.error(`Error while fetching products from the database:`, error);
    throw new Error(`Database error while fetching products.`);
}
}; 



// ############################### Query som hämtar produkt med id ###############################

const getProductById = (id) => {

    try{

        const productById = db.prepare(`SELECT products.product_id, manufacturers.name AS manufacturerName,
                                        products.name AS productName,
                                        products.description, products.price, products.stock
                                        FROM products
                                        JOIN manufacturers 
                                        ON products.manufacturer_id = manufacturers.manufacturer_id
                                        WHERE product_id = ?;`)
                                        .all(id);
  
                            
    return productById;// Returnerar produkt via id som parameter

    // Fångar och kastar och loggar fel i databas.
} catch (error) {
    console.error(`Error while fetching products from the database:`, error);
    throw new Error(`Database error while fetching product.`);
}

};


// ################### Query som hämtar produkt genom sökparameter ###########################

const getProductsBySearch = (searchterm) => {

    try{
    const productBySearch = db.prepare(`SELECT * FROM products 
                                        WHERE name LIKE ?;`)
                                        .all(`%${searchterm}%`);

    return productBySearch; // Returnerar produkter genom att söka på productnamn med sökterm 

    // Fångar och kastar och loggar fel i databas.
} catch (error) {
    console.error(`Error while searching products from the database:`, error);
    throw new Error(`Database error while searching products.`);
}
        
};



// ################### Query som hämtar produkt genom kategori id med join ####################

const getProductByCategoryId = (id) => {

    try{
    const productByCategory = db.prepare(`SELECT categories.name AS categoriesName,
                                        products.name AS productName, 
                                        products.description, products.price,
                                        products.stock
                                        FROM products_categories 
                                        JOIN products 
                                        ON products_categories.product_id = products.product_id
                                        JOIN categories
                                        ON categories.category_id = products_categories.category_id
                                        WHERE categories.category_id = ?; `)
                                        .all(id);

    return productByCategory;// returnerar query svar

 // Fångar och kastar och loggar fel i databas.
} catch (error) {
    console.error(`Error while fetching products from the database:`, error);
    throw new Error(`Database error while fetching products by category.`);
}
};



// #### Query somlägger till produkter med parametrar lägger även till kategori id och uppdaterar produkt/kategori.
const addProducts = (manufacturer_id, name, description, price, stock, category_id) => {

    try{

    const query = db.prepare(`INSERT INTO products 
                                    (manufacturer_id, name, description, price, stock)
                                    VALUES (?, ?, ?, ?, ?)`);

    
    const result = query.run(manufacturer_id, name, description, price, stock);

    
// query för att lägga till categori id och produkt id i products_categories automatiskt när en produkt läggs till.
    const categoryQuery = db.prepare(`INSERT INTO products_categories (product_id, category_id) 
                                      VALUES (?, ?)`);

    categoryQuery.run(result.lastInsertRowid, category_id);

    // Returnerar produktens id. 
    return result.lastInsertRowid;

} catch (error) {
    console.error(`Error while adding product from the database:`, error);
    throw new Error(`Database error while adding product.`);
}
   
};

    

// ############## Query som uppdaterar priset av en produkt genom dess id ##################

const updateProductById = (id, price) => { 
    try {
        const query = db.prepare(`UPDATE products SET price = ? WHERE product_id = ?;`);
        const result = query.run(price, id);
      

        if (result.changes === 0) { // Kontrollerar om resultatet och en ändring gjorts
            return null; // Returnerar null om ingen ändring gjordes på gjorts
            
        };

        // En query för att få ut namnet på den uppdaterade produkten med sökt id
        const prodNameQuery = db.prepare(`SELECT name FROM products WHERE product_id = ?`);
        const product = prodNameQuery.get(id); // Varibael där produkten hämtas med id

        // Om produkt med sökt id finns returneras produktens namn, och det nya priset.
        if (product) { 
            return { name: product.name, price: price }; 

        } else {
            return null; // Returnerar null om ingen product med det sökta id hittas

        };
        
        // Loggar fel med databas anslutning och kastar vidare till Express
    } catch (error) {
        console.error(`Error while updating product from the database:`, error);
        throw new Error(`Database error while updating product.`);
    }
    
};



// ####################### Query som tar bort produkt genom id ########################

const deleteProduct = (id) => {

    try{
    const query = db.prepare(`DELETE FROM products 
                    WHERE product_id = ?;`);
    
    return query.run(id); // Kör queryn med id som parameter

  // Fångar, loggar och kastar error vid fel.
} catch (error) {
    console.error(`Error while removing product from the database:`, error);
    throw new Error(`Database error while removing product.`);
}
    
};


//########################## CUSTOMERS ################################

// ################ Query som hämtar kunder och orderhistorik genom id #########################

const getCustomerById = (id) => {

    try{
    const query = db.prepare(`SELECT customers.name AS customerName,customers.address, customers.phone, 
                            customers.email, orders.order_id, orders.order_date, 
                            shipping_methods.name AS ShippingMethod, products.name AS productName, order_details.quantity, 
                            order_details.status
                            FROM customers
                            JOIN orders
                            ON customers.customer_id = orders.customer_id 
                            JOIN order_details
                            ON orders.order_id = order_details.order_id 
                            JOIN products 
                            ON order_details.product_id = products.product_id 
                            JOIN shipping_methods
                            ON shipping_methods.shipping_method_id = orders.shipping_method_id
                            WHERE customers.customer_id = ? ;`);

    const result = query.all(id);
    return result; // returnerar resultat av queryn

    // Kastar och loggar ev fel
} catch (error) {
    console.error(`Error while fetching customers from the database:`, error);
    throw new Error(`Database error while fetching customer.`);
}
};



// #################### Uppdaterar en kund genom id parameter ###########################

const updateCustomerById = (id, name, address, email, phone) => {

    try{
        const query = db.prepare(`UPDATE customers SET name = ?, address = ?, email = ?, 
                                phone = ?  WHERE customer_id = ?;`);

        const result = query.run(name, address, email, phone, id);

        // Om inga uppdateringar skett returneras null 
        if (result.changes === 0) {
            return null;
        }

        // Query för att att hämta info om kund
        const customerQuery = db.prepare(`SELECT * FROM customers WHERE customer_id = ?;`);
        const customer = customerQuery.all(id)

        return customer; // returnerar resultat av queryn customer
        

    } catch (error) {
        console.error(`Error while updating customers from the database:`, error);
        throw new Error(`Database error while updating customer.`);
    }
}; 


// ###################  Hämtar kunder och dess ordrar genom id ################################

const getCustomerOrdersById = (id) => {

    try{
    const query = db.prepare(`SELECT * FROM orders WHERE customer_id=?;`);

    const result = query.all(id); 
    return result; // returnerar resultat av queryn

} catch (error) {
    console.error(`Error while fetching customer and orders from the database:`, error);
    throw new Error(`Database error while fetching customer and orders.`);
}
};

//########################### ANALYSDATA ##############################

// ##################### Hämtar statistik av produkter och kategorier #########################

const getProductStat = () => {

    try{
    const query = db.prepare(`SELECT categories.name AS categoryName, COUNT(products.product_id) 
                            AS total_products, ROUND(AVG(products.price),2)
                            AS average_price 
                            FROM products 
                            JOIN products_categories 
                            ON products.product_id = products_categories.product_id
                            JOIN categories
                            ON categories.category_id = products_categories.category_id GROUP BY categories.name;`)

    const result = query.all();
    return result; // returnerar resultat av queryn
    
} catch (error) {
    console.error(`Error while fetching product from the database:`, error);
    throw new Error(`Database error while fetching product statsistics.`);
}
};

// ########################## Hämtar statistik av omdöme ##########################

const getReviewsStats = () => {
try{
    const query = db.prepare(`SELECT products.name, AVG(reviews.rating) 
                            AS average_rating 
                            FROM reviews 
                            JOIN products 
                            ON reviews.product_id = products.product_id GROUP BY products.name;`);
    const result = query.all();
    return result; // returnerar resultat av queryn

    // Kastar och loggar eventuella fel
} catch (error) {
    console.error(`Error while fetching product from the database:`, error);
    throw new Error(`Database error while fetching reviews statistics.`);
}

};


// ################################ VG SÖKFUNKTION PÅ NAMN OCH KATEGORI ##############################

// ######################## Hämtar produkter via namn och/ eller kategori ########################

const getProductsByNameAndCategory = (name, category) => {

    try{
        let query = `SELECT products.name AS productName, categories.name AS categoryName, 
                    products.description, products.price, products.stock
                    FROM products 
                    JOIN products_categories ON products.product_id = products_categories.product_id 
                    JOIN categories ON categories.category_id = products_categories.category_id 
                    WHERE 1=1`; 

    const params = [];        

    // Om man söker på namn läggs denna queryn till på den befintliga.
    if (name) {
        query += ` AND products.name LIKE ?`;
        params.push(`%${name}%`);  
    }

    // Om man söker på kategori läggs denna queryn till på den befintliga.
    if (category) {
        query += ` AND categories.name LIKE ?`;
        params.push(`%${category}%`); 
    }

    // skickar med parametrarna som lagras i arrayen
    const productBySearch = db.prepare(query).all(...params);

    return productBySearch;

    // Kastar och loggar ev fel.
} catch (error) {
    console.error(`Error while searching products from the database:`, error);
    throw new Error(`Database error while searching products.`);
}
};





       