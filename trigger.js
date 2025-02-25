import db from './database.js';

// La till en trigger så att de nya producterna som läggs till även ska hamna i products_categories tabellen.
// Nöjde mig med produkter därför får nya produkter inga kategorier eftersom jag inte lägger till den 
// när produkten skapas.

function createProductTrigger(db) {
    const createTrigger = db.prepare(`
         CREATE TRIGGER IF NOT EXISTS after_product_insert
        AFTER INSERT ON products
        BEGIN
            -- Lägg till produktens id i products_categories (utan att koppla till kategori)
            INSERT INTO products_categories (product_id)
            VALUES (new.product_id);  -- Koppla den nya produkten till products_categories
        END;
    `);

    createTrigger.run();
}

export{createProductTrigger};
