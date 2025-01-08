const express = require('express');;
const app = express();
const path = require('path');
const mongoose = require('mongoose');
const Product = require('./models/product');
const Farm = require('./models/farm');
const methodOverride = require('method-override');

mongoose.connect('mongodb://127.0.0.1:27017/farmStand')
    .then(()=>{console.log('Database connected')})
    .catch((err)=>{console.log("Database connection error", err)});


app.set('views', path.join(__dirname,'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));

app.get('/farms', async (req, res)=>{
    const farms = await Farm.find({});
    res.render('farms/index', {farms});
})

app.post('/farms', async (req, res)=>{
    const newFarm = new Farm(req.body);
    await newFarm.save();
    res.redirect('/farms');
})

app.get('/farms/new', (req, res)=>{
    res.render('farms/new');
})

app.get('/farms/:id', async (req, res)=>{
    const {id} = req.params;
    const farm = await Farm.findById(id).populate('products');
    res.render('farms/show', {farm});  
})

app.get('/farms/:id/products/new', async (req, res)=>{
    const {id} = req.params;
    const farm = await Farm.findById(id);
    const categories = await Product.distinct('category');
    res.render('products/new', {categories, farm});
})

app.post('/farms/:id/products', async (req, res)=>{
    const {id} = req.params;
    const farm = await Farm.findById(id);
    const {name, price, category} = req.body;
    const newProduct = new Product({name, price, category});
    farm.products.push(newProduct);
    newProduct.farm = farm;
    await farm.save();
    await newProduct.save();
    res.redirect(`/farms/${farm._id}`);
})

app.get('/products', async (req, res)=>{
    //filter by category
    const {category} = req.query;
    if(category){
        const products = await Product.find({category});
        res.render('products/index', {products, category});
        return;
    } else{
        const products = await Product.find({});
        res.render('products/index', {products, category: 'All'});
    }
})

app.get('/products/new',async (req,res)=>{
    const categories = await Product.distinct('category');
    res.render('products/new', { categories });
})

app.post('/products', async (req,res)=>{
    const newProduct = new Product(req.body);
    await newProduct.save();
    res.redirect(`/products/${newProduct._id}`);
})

app.get('/products/:id', async (req,res)=>{
    const {id} = req.params;
    const product = await Product.findById(id);
    res.render('products/show', {product});
})

app.put('/products/:id', async (req,res)=>{
    const {id} = req.params;
    const product = await Product.findByIdAndUpdate(id, req.body, {runValidators:true, new:true});
    res.redirect(`/products/${product._id}`);
})

app.get('/products/:id/edit', async (req,res)=>{
    const {id} = req.params;
    const product = await Product.findById(id);
    const categories = await Product.distinct('category');
    res.render('products/edit', {product, categories});
})

app.delete('/products/:id', async (req,res)=>{
    const {id} = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);
    res.redirect('/products');
})

app.listen(3000, ()=>{
    console.log('Server is running on port 3000');
})