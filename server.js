const express = require('express');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const initSqlJs = require('sql.js');

const app = express();
const PORT = 3000;
const SECRET = process.env.JWT_SECRET || 'codealpha-demo-secret';
const DATA = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA, 'store.db');
let db;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function all(sql, params=[]) {
  const s=db.prepare(sql); s.bind(params); const out=[];
  while(s.step()) out.push(s.getAsObject()); s.free(); return out;
}
function one(sql, params=[]) { return all(sql,params)[0] || null; }
function run(sql, params=[]) { db.run(sql,params); }
function save(){ fs.writeFileSync(DB_FILE, Buffer.from(db.export())); }
function auth(req,res,next){
  const t=(req.headers.authorization||'').replace(/^Bearer\s+/,'');
  if(!t) return res.status(401).json({message:'Login required.'});
  try { req.user=jwt.verify(t,SECRET); next(); } catch { res.status(401).json({message:'Invalid or expired token.'}); }
}
function initSchema(){
  run('PRAGMA foreign_keys=ON');
  run(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,email TEXT UNIQUE NOT NULL,password_hash TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
  run(`CREATE TABLE IF NOT EXISTS products(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT NOT NULL,category TEXT NOT NULL,description TEXT NOT NULL,price REAL NOT NULL,image TEXT NOT NULL,created_at TEXT DEFAULT CURRENT_TIMESTAMP)`);
  run(`CREATE TABLE IF NOT EXISTS orders(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,total REAL NOT NULL,status TEXT DEFAULT 'Placed',created_at TEXT DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE)`);
  run(`CREATE TABLE IF NOT EXISTS order_items(id INTEGER PRIMARY KEY AUTOINCREMENT,order_id INTEGER NOT NULL,product_id INTEGER NOT NULL,quantity INTEGER NOT NULL,price REAL NOT NULL,FOREIGN KEY(order_id) REFERENCES orders(id) ON DELETE CASCADE,FOREIGN KEY(product_id) REFERENCES products(id))`);
  if(Number(one('SELECT COUNT(*) c FROM products').c)===0){
    const p=[
      ['Minimal Hoodie','Clothing','Premium everyday hoodie with a clean minimal look.',1499,'https://images.unsplash.com/photo-1556821840-3a63f95609a7?auto=format&fit=crop&w=900&q=80'],
      ['Classic Sneakers','Footwear','Comfortable sneakers designed for everyday wear.',2299,'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=900&q=80'],
      ['Urban Backpack','Accessories','Compact backpack for college, work and daily travel.',1799,'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80'],
      ['Analog Watch','Accessories','Simple analog watch with a timeless design.',1999,'https://images.unsplash.com/photo-1524805444758-089113d48a6d?auto=format&fit=crop&w=900&q=80'],
      ['Oversized T-Shirt','Clothing','Soft cotton oversized t-shirt for a relaxed fit.',799,'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=900&q=80'],
      ['Denim Jacket','Clothing','Versatile denim jacket for casual outfits.',2499,'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=900&q=80']
    ];
    p.forEach(x=>run('INSERT INTO products(name,category,description,price,image) VALUES(?,?,?,?,?)',x));
  }
  save();
}

app.get('/api/products',(req,res)=>{
  let sql='SELECT * FROM products WHERE 1=1', p=[];
  const q=String(req.query.search||'').trim(), c=String(req.query.category||'').trim();
  if(q){sql+=' AND (name LIKE ? OR description LIKE ?)'; p.push('%'+q+'%','%'+q+'%');}
  if(c&&c!=='All'){sql+=' AND category=?';p.push(c);}
  res.json(all(sql+' ORDER BY id DESC',p));
});
app.get('/api/products/:id',(req,res)=>{const x=one('SELECT * FROM products WHERE id=?',[req.params.id]);x?res.json(x):res.status(404).json({message:'Product not found.'});});

app.post('/api/auth/register',async(req,res)=>{
  try{
    const {name,email,password}=req.body;
    if(!name||!email||!password)return res.status(400).json({message:'Name, email and password are required.'});
    if(password.length<6)return res.status(400).json({message:'Password must be at least 6 characters.'});
    const e=email.trim().toLowerCase();
    if(one('SELECT id FROM users WHERE email=?',[e]))return res.status(409).json({message:'Email is already registered.'});
    run('INSERT INTO users(name,email,password_hash) VALUES(?,?,?)',[name.trim(),e,await bcrypt.hash(password,10)]);save();
    res.status(201).json({message:'Registration successful. You can now log in.'});
  }catch(e){console.error(e);res.status(500).json({message:'Registration failed.'});}
});
app.post('/api/auth/login',async(req,res)=>{
  try{
    const {email,password}=req.body; const u=one('SELECT * FROM users WHERE email=?',[(email||'').trim().toLowerCase()]);
    if(!u||!(await bcrypt.compare(password||'',u.password_hash)))return res.status(401).json({message:'Invalid email or password.'});
    const token=jwt.sign({id:u.id,name:u.name,email:u.email},SECRET,{expiresIn:'2h'});
    res.json({message:'Login successful.',token,user:{id:u.id,name:u.name,email:u.email}});
  }catch(e){res.status(500).json({message:'Login failed.'});}
});
app.get('/api/auth/me',auth,(req,res)=>{const u=one('SELECT id,name,email,created_at FROM users WHERE id=?',[req.user.id]);u?res.json(u):res.status(404).json({message:'User not found.'});});

app.post('/api/orders',auth,(req,res)=>{
  const items=Array.isArray(req.body.items)?req.body.items:[]; if(!items.length)return res.status(400).json({message:'Your cart is empty.'});
  try{
    run('BEGIN');let total=0, verified=[];
    for(const i of items){const p=one('SELECT id,price FROM products WHERE id=?',[i.productId]);const q=Number(i.quantity);if(!p||!Number.isInteger(q)||q<1){run('ROLLBACK');return res.status(400).json({message:'Invalid cart item.'});}total+=Number(p.price)*q;verified.push({id:p.id,q,price:Number(p.price)});}
    run('INSERT INTO orders(user_id,total,status) VALUES(?,?,?)',[req.user.id,total,'Placed']);const o=one('SELECT last_insert_rowid() id');
    verified.forEach(i=>run('INSERT INTO order_items(order_id,product_id,quantity,price) VALUES(?,?,?,?)',[o.id,i.id,i.q,i.price]));run('COMMIT');save();
    res.status(201).json({message:'Order placed successfully.',orderId:o.id,total});
  }catch(e){try{run('ROLLBACK')}catch{};console.error(e);res.status(500).json({message:'Could not place order.'});}
});
app.get('/api/orders',auth,(req,res)=>{
  const orders=all('SELECT id,total,status,created_at FROM orders WHERE user_id=? ORDER BY id DESC',[req.user.id]);
  orders.forEach(o=>o.items=all('SELECT oi.product_id,p.name,oi.quantity,oi.price FROM order_items oi JOIN products p ON p.id=oi.product_id WHERE oi.order_id=?',[o.id]));res.json(orders);
});
app.get('/{*splat}',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));

(async()=>{
  fs.mkdirSync(DATA,{recursive:true});
  const SQL=await initSqlJs({locateFile:f=>path.join(__dirname,'node_modules','sql.js','dist',f)});
  db=fs.existsSync(DB_FILE)?new SQL.Database(new Uint8Array(fs.readFileSync(DB_FILE))):new SQL.Database();
  initSchema();
  app.listen(PORT,()=>console.log(`\nNovaCart running at http://localhost:${PORT}\nSQLite database: ${DB_FILE}\n`));
})().catch(e=>{console.error(e);process.exit(1);});
