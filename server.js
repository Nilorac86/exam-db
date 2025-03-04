
//import express from "express";

import { app} from "./database.js";

import {getProductById, getProducts, getProductsBySearch, getProductByCategoryId, 
        addProducts, updateProductById, deleteProduct, getCustomerById, updateCustomerById, 
        getCustomerOrdersById, getProductStat, getReviewsStats, getProductsByNameAndCategory,} from "./functions.js";



// ########################### PRODUKTER #################################

// Hämtar alla produkter, dess kategori och tillverkare
app.get(`/products`, (req, res) => {
    try{

        const products = getProducts();
        
        // Om inga produkter finns returneras ett felmeddelande.
        if (products.length === 0) {
            return res.status(404).json({ message: `No products found.` });
        }
        
        // Returnerar svar från anropet med meddelande.
        res.status(200).json({
            message: `Fetching products were successful.`,
            products: products});  

    // Fångar ev fel i kod eller databas, levererar ett felmeddelande.
    } catch (error) {

        console.error(`Error while fetching products:`, error);
        res.status(500).json({ error: `Something went wrong while fetching products. Try again later!` });
    };
    
});


// Hämtar produkt genom idparameter. 
app.get(`/products/:id`, (req, res) => {
    
    try{
        const productById = getProductById(req.params.id);

        // Om ingen produkt finns returneras ett meddelande.
        if (productById.length === 0) {
            return res.status(404).json({ message: `No product found.` });

        };

        // Skickar tillbaka produkten som json svar.
        res.status(200).json({
            message: `Fetching product was successful.`,
            products: productById});

        // fångar ev fel i kod eller databas.
    } catch (error) {

        console.error(`Error while fetching products by id:`, error);
        res.status(500).json({ error: `Something went wrong while fetching products by id. Try again later!` });
    };
}); 


// Hämtar produkter med sökparameter
// ?name=searchterm
app.get(`/product/search`, (req, res) => {
   try{
        const searchterm = req.query.name;

        // Anropar query
        const productBySearch = getProductsBySearch(searchterm);

        // Om ingen produkt finns returneras ett meddelande.
        if (productBySearch.length === 0) {
            return res.status(404).json({ message: `No products match the provided searchterm.` });
        }
        
        // Skickar ett json svar och produkter som hittades i sökningen.
        res.status(200).json({
            message: `Product search were successful.`,
            products: productBySearch});  

   // Fångar fel i databas eller kod.
    } catch (error) {

        console.error(`Error while searching for products:`, error);
        res.status(500).json({ error: `Something went wrong while searching for products. Try again later!` });
    };

});


// Hämtar produkter med kategori id.
app.get(`/products/category/:categoryId`, (req,res) => {
    try{
        const productsByCategoryId = getProductByCategoryId(req.params.categoryId);

        // Om ingen produkt hittas returneras ett meddelande.
        if (productsByCategoryId.length === 0) {
            return res.status(404).json({ message: `No products match the category id.` });
        }

        // Json svar skickas med hämtad produkt
        res.status(200).json({
            message: `Fetching products were successful.`,
            products: productsByCategoryId}); 
       
            // Fångar ev fel i db eller liknande och skickar error meddelande.
    } catch (error) {

        console.error(`Error while fetching products by category:`, error);
        res.status(500).json({ error: `Something went wrong while fetching products by category. Try again later!` });
    };
});





// Lägger till produkter 
app.post(`/products`, (req, res) => {

    try{
        const {manufacturer_id, name, description, price, stock, category_id} = req.body;

        
        // Validerar att namn, pris och saldo finns annars returneras ett error. 
        if ( !name || !price || !stock ) {
            return res.status(400).json({ error: "Name, price and stock are required to proceed." });
        }

        // Validerar att pris och saldo är en siffra annars skickas ett error.
        if (isNaN(price) || isNaN(stock) ){
            return res.status(400).json({ error: `Price and stock must be a number.` });
        }

          
        // Validerar om priset är större än 0 om inte returneras ett error med info.
        if (price <= 0) {
            return res.status(400).json({ error: `Price must be greater than 0.` });
        }

        // Anropar funktionen och kör queryn.
        const productId = addProducts(manufacturer_id, name, description, price, stock, category_id);
        
        
        // Returnerar den tillagda produkten med ett meddelande med förändring, sistaraden (id) 
        // och den tillagda produkten.
        return res.status(201).json({
            message: "Product has been successfully added.",
            product: {
            product_id: productId,
            manufacturer_id: manufacturer_id,
            name: name,
            description: description,
            price: price,
            stock: stock
            }
        });
   
       // Fångar fel som kan uppstå under processen och skickar ett error
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Something went wrong while adding product. Try again later!" });
    };
    
});






// Uppdaterar priset på en product med id
app.put(`/products/:id`, (req, res) => {

    try{
    const { id } = req.params; // skickar in id som en parameter i sökvägen
    const { price } = req.body; // skickar in den nya informationen via body


        // Validerar om priset är ett nummer annars returneras ett error med info.
        if (isNaN(price)){
            return res.status(400).json({ error: `Price must be a number.` });
        };
          
        // Validerar om priset är större än 0 om inte returneras ett error med info.
        if (price <= 0) {
            return res.status(400).json({ error: `Price must be greater than 0.` });

        }; 
            
            const updatedProduct = updateProductById(id, price);


            // Om produkten inte finns returneras ett meddelande.
            if (!updatedProduct) {
                return res.status(404).json({ message: "Product not found." });
            };
        
                // returnerar ett json svar
                return res.status(201).json({ 
                    message: `Product price has been updated.`, 
                    product:{
                    productName: updatedProduct.name, 
                    updatedPrice: price 
                    }
                });
    
    
        // Fångar fel som kan uppstå under processen och skickar ett error.
    } catch (error) {
        console.error(`Error updating product:`, error);
        return res.status(500).json({ error: `Failed to update the product. Try again later!` });
    };
});




// Raderar en produkt genom id parameter
app.delete(`/products/:id`, (req, res) => {

    try{
        const {id} = req.params;

        const product = getProductById(id); 

        // Om produkten inte finns returneras ett meddelande.
        if (product.length === 0) {
            return res.status(404).json({
                message: `Product with ID ${id} not found.`
            });
        };

         // Anropar query funktion med id parameter
         const deleteProductResult = deleteProduct(id);

         if (deleteProductResult){
        // Returnerar json svar 
        return res.status(200).json({
            message: `Product and reviews has been successfully deleted`,
        });
    };

        // Fångar fel och lämnar error meddelande
    } catch (error) {

        console.error(`Error: Something went wrong `, error);
        res.status(500).json({ error: `Something went wrong while deleting product. Try again later!` });
    };

});


//########################## CUSTOMERS ################################

// Hämtar kund med order info genom id
app.get(`/customers/:id`, (req, res) => {

    try{
        const {id} = req.params

        const getCustomerByIdResult = getCustomerById(id);

        // Validerar om det inte finns kund med id returneras ett meddelande.
        if (getCustomerByIdResult.length === 0){
            return res.status(404).json({ message: `No customer with ID:${id} found.` });
        }

        // Returnerar json svar om kund och order.
       return res.status(200).json({
        message: `Fetching customer were successful`,
        customer: getCustomerByIdResult
    });
           

    // Fångar ev fel och ger error meddelande.
    } catch (error) {

        console.error(`Error: Something went wrong `, error);
        res.status(500).json({ error: `Something went wrong while fetching customer. Try again later!` });
    };
    
});





// Uppdaterar kund genom id.
app.put(`/customers/:id`, (req, res) => {

    try{
        const {id} = req.params; 
        const {name, address, email, phone} = req.body;
       
        // Validerar att alla fält är ifyllda om inte returneras ett json svar
        if (!address || !email || !phone ){
            return res.status(400).json({error: `Address, email, and phone are required to proceed `});
        }

         // Validera emailformatet med en regex
         const validateEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
         if (!validateEmail.test(email)) {
             return res.status(400).json({ error: `The email address must be valid and correctly formatted` });
         } 
        
         
         const updateCustomerResult = updateCustomerById(id, name, address, email, phone);

         // Om ingen kund hittas skickas json svar.
         if(!updateCustomerResult){
            return res.status(404).json({messege: `The customer not found with id: ${id}` });
        
         }

         // Uppdaterade produkten skickas son json svar.
        return res.status(200).json({
            messege: `The customer has been updated`,
            customer: updateCustomerResult });

// Fångar ev fel.
    } catch (error) {

        console.error(`Error: Something went wrong `, error);
        res.status(500).json({ error: `Something went wrong while updating customer. Try again later!` });
    };
});





// Hämtar en kunds ordrar
app.get(`/customers/:id/orders`, (req, res) => {

    try{
        const {id} = req.params;
        const customerOrders = getCustomerOrdersById(id);

        // Om inga ordrar hittas returneras ett json svar.
        if (customerOrders.length === 0) {
            return res.status(404).json({ message: `No orders found.` });
        }
        
       // Returnerar json svar. 
        return res.status(200).json({
            message: `Fetching orders were successful`,
            orders: customerOrders
        });

        // Fångar ev fel och skickar error meddelande.
    } catch (error) {

        console.error(`Error: Something went wrong `, error);
        res.status(500).json({ error: `Something went wrong while fetching customers and orders. Try again later!` });
    };
    
});


// ######################## ANALYSDATA ##############################
// Hämtar statistik av grupperad kategori, antal produkter och genomsnittligt pris/kategori
app.get(`/product/stats`, (req, res) => {

    try{
         
        const productStats = getProductStat();


        if (productStats === 0){
            return res.status(404).json({ message: "No products found." });
        }


        return res.status(200).json({
            message: `Fetching products were successful`,
            products: productStats});


    } catch (error) {

        console.error(`Error: Something went wrong `, error);
        res.status(500).json({ error: `Something went wrong while fetching products. Try again later!` });
    };

});

app.get(`/reviews/stats`, (req, res) => {

    try{
        const reviewsStats = getReviewsStats();

          // Validerar om det inte finns kund med id returneras ett meddelande.
          if (reviewsStats.length === 0){
            return res.status(404).json({ message: `No reviews found.` });
        }

        // Returnerar json svar om kund och order.
       return res.status(200).json({
        message: `Fetching reviews were successful`,
        customer: reviewsStats
    });
       

    } catch (error) {

        console.error(`Error: Something went wrong `, error);
        res.status(500).json({ error: `Something went wrong while fetching reviews. Try again later!` });
    };
   
});



//################################# EXTRA UPPGIFT VG ###################################

// Hämtar produkter och/ eller kategorier vid sökning genom parametrar från queryn. 
//?name=gaming&category=electronics
app.get('/search/products', (req, res) => {
   
    try {
        const { name, category } = req.query;  
   

        // Funktionen med queryn anropas. 
        const products = getProductsByNameAndCategory(name, category);

        
        // Kontrollerar om inga produkter hittades och då skickas ett meddelande
        if (products.length === 0) {
            return res.status(404).json({ message: `No products match the provided name and category.` });
        }

        // Svar från anropet skickar tillbaka json svar med medmeddelande och produkter.
            res.status(200).json({
            message: `Product search was successful.`,
            products: products});  


    // Fångar upp eventuella fel eller problem med att hämta. Och skickar error meddelande.
    } catch (error) {
        console.error(`Error fetching products:`, error);
        res.status(500).json({ error: `Something went wrong while fetching products.` });
    };
});




