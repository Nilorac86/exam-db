
import express from "express";

import {getProductById, getProducts, getProductsBySearch, getProductByCategoryId, 
        addProducts, updateProductById, deleteProduct, getCustomerById, updateCustomerById, 
        getCustomerOrdersById, getProductStat, getReviewsStats, getProductsByNameAndCategory,} from "./functions.js";

const app = express();
const PORT = 3000;
const URL = "localhost";

app.use(express.json());


app.listen(PORT, URL, () => {

    console.log(`Server is running att ${URL}:${PORT}`);
});



// Hämtar alla produkter, dess kategori och tillverkare
app.get(`/products`, (req, res) => {
    try{

        const products = getProducts();
        console.log(products);
        res.json(products);
    
    } catch (error) {

        console.error(`Error while fetching products:`, error);
        res.status(500).json({ error: `Something went wrong while fetching products. Try again later!` });
    };
    
});


// Hämtar produkt genom id
app.get(`/products/:id`, (req, res) => {
    
    try{
        const productById = getProductById(req.params.id);
        console.log(productById);
        res.json(productById);
    
    } catch (error) {

        console.error(`Error while fetching products by id:`, error);
        res.status(500).json({ error: `Something went wrong while fetching products by id. Try again later!` });
    };


}); 


// ?name=searchterm
app.get(`/product/search`, (req, res) => {
   try{
        const searchterm = req.query.name;

        const productBySearch = getProductsBySearch(searchterm);
        console.log(productBySearch);
        res.json(productBySearch);
   
    } catch (error) {

        console.error(`Error while searching for products:`, error);
        res.status(500).json({ error: `Something went wrong while searching for products. Try again later!` });
    };

});



app.get(`/products/category/:categoryId`, (req,res) => {
    try{
        const productsByCategoryId = getProductByCategoryId(req.params.categoryId);
        console.log(productsByCategoryId);
        res.json(productsByCategoryId);
       
    } catch (error) {

        console.error(`Error while fetching products by category:`, error);
        res.status(500).json({ error: `Something went wrong while fetching products by category. Try again later!` });
    };
   

});


// Lägger till produkter 
app.post(`/products`, (req, res) => {

    try{
        const {manufacturer_id, name, description, price, stock} = req.body;

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

        // Anropar funktionen
        const productId = addProducts(manufacturer_id, name, description, price, stock);
        
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
        res.status(500).json({ error: "Something went wrong while adding the product. Try again later!" });
    };
    
});



// Uppdaterar priset på en product med id
app.put(`/products/:id`, (req, res) => {
    const { id } = req.params; // skickar in id som en parameter i sökvägen
    const { price } = req.body; // skickar in den nya informationen via body

    try {
        
        // Validerar om priset är ett nummer annars returneras ett error med info.
        if (isNaN(price)){
            return res.status(400).json({ error: `Price must be a number.` });
        }
          
        // Validerar om priset är större än 0 om inte returneras ett error med info.
        if (price <= 0) {
            return res.status(400).json({ error: `Price must be greater than 0.` });

        // Om pris är större än 0 anropas funktionen med queryn.
        } else {
            const updatedProduct = updateProductById(id, price);
            console.log(updatedProduct);

         // Validerar funktionen och returnerar meddelande, productnamn och uppdaterat pris i json format
            if (updatedProduct) {
                
                return res.status(201).json({ 
                    message: `Product price has been updated.`, 
                    productName: updatedProduct.name, 
                    updatedPrice: price 
                });
    
            // Om inte någon product hittas skickas ett meddelande.
            } else {
                return res.status(404).json({ message: `Product not found.` });
            };
        };

        // Fångar fel som kan uppstå under processen och skickar ett error.
    } catch (error) {
        console.error(`Error updating product:`, error);
        return res.status(500).json({ error: `Failed to update the product. Try again later!` });
    }
});




app.delete(`/products/:id`, (req, res) => {

    try{
        const {id} = req.params;
        const deleteProductResult = deleteProduct(id);
    
        console.log(deleteProductResult);
        res.json(deleteProductResult);
       
    } catch (error) {

        console.error(`Error: Something went wrong `, error);
        res.status(500).json({ error: `Something went wrong while deleting product. Try again later!` });
    };

});


//########################## CUSTOMERS ################################

app.get(`/customers/:id`, (req, res) => {

    try{
        const getCustomerByIdResult = getCustomerById(req.params.id);

        console.log (getCustomerByIdResult);
        res.json(getCustomerByIdResult);
           
    } catch (error) {

        console.error(`Error: Something went wrong `, error);
        res.status(500).json({ error: `Something went wrong while fetching customer. Try again later!` });
    };
    
});




app.put(`/customers/:id`, (req, res) => {

    try{
        const {id} = req.params;
        const {address, email, phone} = req.body;
       

        if (!address || !email || !phone ){
            return res.status(400).json({error: `Address, email, and phone are required to proceed `});
        }

         // Validera emailformatet med en regex
         const validateEmail = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
         if (!validateEmail.test(email)) {
             return res.status(400).json({ error: `The email address must be valid and correctly formatted` });
         } 
        
            
         const updateCustomerResult = updateCustomerById(id, address, email, phone);

         if(updateCustomerResult){
            
            return res.status(200).json({
            messege: `The customer has been updated`,
            customer: updateCustomerResult
        });
    }

    } catch (error) {

        console.error(`Error: Something went wrong `, error);
        res.status(500).json({ error: `Something went wrong while updating customer. Try again later!` });
    };
});



app.get(`/customers/:id/orders`, (req, res) => {

    try{
        const {id} = req.params;
        const customerOrders = getCustomerOrdersById(id);

        console.log(customerOrders);
        res.json(customerOrders);


    } catch (error) {

        console.error(`Error: Something went wrong `, error);
        res.status(500).json({ error: `Something went wrong while fetching customers and orders. Try again later!` });
    };
    
});


// ######################## ANALYSDATA ##############################

app.get(`/product/stats`, (req, res) => {

    try{
         
        const productStats = getProductStat();

        console.log(productStats);
        res.json(productStats);


    } catch (error) {

        console.error(`Error: Something went wrong `, error);
        res.status(500).json({ error: `Something went wrong while fetching products. Try again later!` });
    };

});

app.get(`/reviews/stats`, (req, res) => {

    try{
        const reviewsStats = getReviewsStats();

        console.log(reviewsStats);
        res.json(reviewsStats);


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

        // Svar från anropet skickas tillbaka med meddelande och produkter.
            res.status(200).json({
            message: `Product search was successful.`,
            products: products});  


    // Fångar upp eventuella fel eller problem med att hämta. Och skickar error meddelande.
    } catch (error) {
        console.error(`Error fetching products:`, error);
        res.status(500).json({ error: `Something went wrong while fetching products.` });
    };
});




