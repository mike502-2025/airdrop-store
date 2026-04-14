const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const SECRET = "secreto123";

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 🔥 CONEXIÓN MONGODB mongod
mongoose.connect('mongodb+srv://admin:AirDrop123@cluster0.zqaaapk.mongodb.net/airdrop?retryWrites=true&w=majority')
.then(()=> console.log("Mongo conectado"))
.catch(err => console.log(err));
// Modelo
const Product = mongoose.model('Product', {
  name: String,
  price: Number,
  image: String,
  stock: Boolean
});

// 🔐 LOGIN
app.post('/api/login', (req, res) => {
  const { user, pass } = req.body;

  if(user === 'mike' && pass === '123456'){
    const token = jwt.sign({ user }, SECRET);
    res.json({ token });
  } else {
    res.status(401).json({ error: 'Error' });
  }
});

// 🔒 Middleware
function verify(req, res, next){
  const token = req.headers['authorization'];
  if(!token) return res.sendStatus(403);

  try {
    jwt.verify(token, SECRET);
    next();
  } catch {
    res.sendStatus(403);
  }
}

// 📦 CRUD PRODUCTOS
app.get('/api/products', async (req, res) => {
  const data = await Product.find();
  res.json(data);
});

app.post('/api/products', verify, async (req, res) => {
  const p = new Product(req.body);
  await p.save();
  res.json(p);
});

app.delete('/api/products/:id', verify, async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ ok:true });
});

app.put('/api/products/:id', verify, async (req, res) => {
  const p = await Product.findById(req.params.id);
  p.stock = !p.stock;
  await p.save();
  res.json(p);
});

app.listen(PORT, () => console.log("Servidor corriendo en puerto " + PORT));