import axios from  'axios';
import * as cheerio from 'cheerio';
import ExcelJS from 'exceljs';


const scrapeAmazon = async (searchQuery) => {
    const url = `https://www.amazon.com/s?k=${encodeURIComponent(searchQuery)}`;
    const { data } = await axios.get(url);
    const $ = cheerio.load(data);
    const products = [];

    $('.s-main-slot .s-result-item').each((index, element) => {
        const name = $(element).find('h2 a span').text().trim();
        const price = $(element).find('.a-price .a-offscreen').text().trim();
        const availability = $(element).find('.a-declarative .a-size-small').text().trim() || 'In Stock';
        const rating = $(element).find('.a-icon-alt').text().trim() || 'No Rating';

        if (name) {
            products.push({ name, price, availability, rating });
        }
    });

    return products;
};


const saveToExcel = async (products) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Products');

    worksheet.columns = [
        { header: 'Product Name', key: 'name', width: 30 },
        { header: 'Price', key: 'price', width: 15 },
        { header: 'Availability', key: 'availability', width: 15 },
        { header: 'Product Rating', key: 'rating', width: 15 },
    ];

    products.forEach(product => {
        worksheet.addRow(product);
    });

    await workbook.xlsx.writeFile('products.xlsx');
    console.log('Data saved to products.xlsx');
};


const main = async () => {
    try {
        const products = await scrapeAmazon('laptop');
        await saveToExcel(products);
    } catch (error) {
        console.error('Error:', error);
    }
};

main();
