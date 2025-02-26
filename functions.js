import db from './database.js';



//############################ PRODUCTS #################################

// Query som hämtar produkter, kategorier och tillverkare med join
const getProducts = () => {
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
        
    return products; 
};


// Query som hämtar produkt med id
const getProductById = (id) => {
    const productById = db.prepare(`SELECT * FROM 
                                    products WHERE product_id = ?;`)
                                    .get(id);
                            
    return productById;
};

// Query som hämtar produkt genom sökparameter 
const getProductsBySearch = (searchterm) => {

    const productBySearch = db.prepare(`SELECT * FROM products 
                                        WHERE name LIKE ?;`)
                                        .all(`%${searchterm}%`);

    return productBySearch;
        
};



// Query som hämtar produkt genom kategori id med join
const getProductByCategoryId = (id) => {
    const productByCategory = db.prepare(`SELECT products.name AS productName, 
                                        categories.name AS categoriesName 
                                        FROM products_categories 
                                        JOIN products 
                                        ON products_categories.product_id = products.product_id
                                        JOIN categories
                                        ON categories.category_id = products_categories.category_id
                                        WHERE categories.category_id = ?; `)
                                        .all(id);

    return productByCategory;
};


// Query somlägger till produkter med parametrar.
const addProducts = (manufacturer_id, name, description, price, stock) => {


    const query = db.prepare(`INSERT INTO products 
                                    (manufacturer_id, name, description, price, stock)
                                    VALUES (?, ?, ?, ?, ?)`);
    
    const result = query.run(manufacturer_id, name, description, price, stock);

    return result ;
};





// Query som uppdaterar priset av en produkt genom dess id
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

        // Kastar felet till express catch
        console.error("Database error", error);
        throw error; 
    }
};



// Query som tar bort produkt genom id
const deleteProduct = (id) => {
    const query = db.prepare(`DELETE FROM products 
                    WHERE product_id = ?;`);
    
    return query.run(id);
    
};


//########################## CUSTOMERS ################################

// Query som hämtar kunder genom id
const getCustomerById = (id) => {
    const query = db.prepare(`SELECT customers.name,customers.address, customers.phone, 
                            customers.email, orders.order_id, orders.order_date, 
                            orders.shipping_method_id, products.name, order_details.quantity, 
                            order_details.status
                            FROM customers
                            LEFT JOIN orders
                            ON customers.customer_id = orders.customer_id 
                            JOIN order_details
                            ON orders.order_id = order_details.order_id 
                            JOIN products 
                            ON order_details.product_id = products.product_id 
                            WHERE customers.customer_id = ? ;`);

    const result = query.all(id);
    return result;

};


// Uppdaterar en kund genom id
const updateCustomerById = (id, address, email, phone) => {

    try{
        const query = db.prepare(`UPDATE customers SET address = ?, email = ?, 
                                phone = ?  WHERE customer_id = ?;`);

        const result = query.run(address, email, phone, id);

        if (result.changes === 0) {
            return null;
        }

        const customerQuery = db.prepare(`SELECT * FROM customers WHERE customer_id = ?;`);
        const customer = customerQuery.all(id)

        return customer;
        

    } catch (error) {

        console.error("Database error", error);
        throw error; 
    }
}; 


// Hämtar kunder och dess ordrar genom id
const getCustomerOrdersById = (id) => {
    const query = db.prepare(`SELECT * FROM orders WHERE customer_id=?;`);

    const result = query.all(id);
    return result;
}

//########################### ANALYSDATA ##############################

// Hämtar statistik av produkter och kategorier
const getProductStat = () => {
    const query = db.prepare(`SELECT categories.name, COUNT(products.product_id) 
                            AS total_products, ROUND(AVG(products.price),2)
                            AS average_price 
                            FROM products 
                            JOIN products_categories 
                            ON products.product_id = products_categories.product_id
                            JOIN categories
                            ON categories.category_id = products_categories.category_id GROUP BY categories.name;`)

    const result = query.all();
    return result;

};

// Hämtar statistik av omdöme 
const getReviewsStats = () => {
    const query = db.prepare(`SELECT products.name, AVG(reviews.rating) 
                            AS average_rating 
                            FROM reviews 
                            JOIN products 
                            ON reviews.product_id = products.product_id GROUP BY products.name;`);
    const result = query.all();
    return result;

};


// #################################### VG ##############################

// Hämtar produkter via namn och/ eller kategori
const getProductsByNameAndCategory = (name, category) => {
    let query = `SELECT products.name AS productName, categories.name AS categoryName 
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

    
    const productBySearch = db.prepare(query).all(...params);

    return productBySearch;
};


export{getProducts,getProductById, getProductsBySearch, getProductByCategoryId, 
        addProducts, updateProductById, deleteProduct, getCustomerById , updateCustomerById, 
        getCustomerOrdersById, getProductStat, getReviewsStats, getProductsByNameAndCategory }