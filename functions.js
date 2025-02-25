import db from './database.js';



//############################ PRODUCTS #################################

const getProducts = () => {
    const products = db.prepare(`SELECT products.name AS productName,
                             products.description,
                             categories.name AS categoryName, 
                             manufacturers.name AS manufacturerName
                             FROM products
                             LEFT JOIN products_categories
                             ON products.product_id= products_categories.product_id
                             LEFT JOIN manufacturers 
                             ON products.manufacturer_id = manufacturers.manufacturer_id
                             LEFT JOIN categories
                             ON categories.category_id = products_categories.category_id;`)
                            .all();
        
    return products;
};



const getProductById = (id) => {
    const productById = db.prepare(`SELECT * FROM 
                                    products WHERE product_id = ?;`)
                                    .get(id);
                            
    return productById;
};


// Kom ihåg att lösa denna
const getProductsBySearch = (searchterm) => {

    const productBySearch = db.prepare(`SELECT * FROM products 
                                        WHERE name LIKE ?;`)
                                        .all(`%${searchterm}%`);

    return productBySearch;
        
};




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



const addProducts = (manufacturer_id, name, description, price, stock) => {
    const query = db.prepare(`INSERT INTO products 
                                    (manufacturer_id, name, description, price, stock)
                                    VALUES (?, ?, ?, ?, ?)`);
    
    const result = query.run(manufacturer_id, name, description, price, stock);

    return result ;
};





// Funktion som hämtas i API anropet för att uppdatera priset av en produkt genom dess id
const updateProductById = (id, newPrice) => { 
    try {
        const query = db.prepare(`UPDATE products SET price = ? WHERE product_id = ?;`);
        const result = query.run(newPrice, id);
      

        if (result.changes === 0) { // Kontrollerar om resultatet och en ändring gjorts
            return null; // Returnerar null om ingen ändring gjordes på gjorts
            
        };

        // En query för att få ut namnet på den uppdaterade produkten med sökt id
        const prodNameQuery = db.prepare(`SELECT name FROM products WHERE product_id = ?`);
        const product = prodNameQuery.get(id); // Varibael där produkten hämtas med id

        // Om produkt med sökt id finns returneras produktens namn, och det nya priset.
        if (product) { 
            return { name: product.name, price: newPrice }; 

        } else {
            return null; // Returnerar null om ingen product med det sökta id hittas

        };
        
        // Loggar fel med databas anslutning och kastar vidare till Express
    } catch (error) {

        console.error("Database error", error);
        throw error; 
    }
};




const deleteProduct = (id) => {
    const query = db.prepare(`DELETE FROM products 
                    WHERE product_id = ?;`);
    
    return query.run(id);
    
};

//########################## CUSTOMERS ################################

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



const getCustomerOrdersById = (id) => {
    const query = db.prepare(`SELECT * FROM orders WHERE customer_id=?;`);

    const result = query.all(id);
    return result;
}

//########################### ANALYSDATA ##############################

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

const getProductsByNameAndCategory = (name, category) => {
    const productBySearch = db.prepare(`SELECT products.name 
                                        AS productName, categories.name 
                                        AS categoryName 
                                        FROM products 
                                        JOIN products_categories 
                                        ON products.product_id = products_categories.product_id 
                                        JOIN categories 
                                        ON categories.category_id = products_categories.category_id 
                                        WHERE products.name LIKE ? 
                                        AND categories.name LIKE ?;`)
                                        .all(`%${name}%`, `%${category}%`);

    return productBySearch;
};



export{getProducts,getProductById, getProductsBySearch, getProductByCategoryId, 
        addProducts, updateProductById, deleteProduct, getCustomerById , updateCustomerById, 
        getCustomerOrdersById, getProductStat, getReviewsStats, getProductsByNameAndCategory }