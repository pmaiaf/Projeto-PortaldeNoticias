const express = require('express');
var bodyParser = require('body-parser')
const mongoose = require('mongoose')
const fs = require('fs');
const fileupload = require('express-fileupload')
const path = require('path');

const app = express();


const Posts = require('./Posts')

var sessions = require('express-session')

mongoose.connect('mongodb+srv://Hoot:Vilaca_08@cluster0.xog5kik.mongodb.net/Projeto01?retryWrites=true&w=majority',{useNewUrlParser:true, useUnifiedTopology: true}).then(() =>{
    console.log('Conetactado')
}).catch((err)=>{

    console.log(err.message)

})

app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 

app.use(fileupload({
    useTempFiles: true,
    tempFileDir: path.join(__dirname, 'temp')
}))

app.use(sessions({  secret:'keyboard cat',  cookie:{maxAge:60000}
}))

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'));


app.get('/',(req,res)=>{
    
    if(req.query.busca == null){
        Posts.find({}).sort({'_id': -1}).exec((err, posts)=>{
            res.render('home',{posts:posts});  
        })
    }else{
        Posts.find({titulo: {$regex: req.query.busca,}}, (err,post) =>{
            res.render('busca',{post: post, contagem: post.length});
        }) 
    }
});


app.get('/:slug',(req,res)=>{
    //res.send(req.params.slug);
    Posts.findOneAndUpdate({slug: req.params.slug}, {$inc :{views:1}}, {new: true}, (err, resposta) => {
        res.render('single',{noticia: resposta});
    })
 
})

var usuarios =[
    {
        login:'admin',
        senha:'123456'
    }
]

app.get('/admin/deletar/:id', (req,res) =>{
          Posts.deleteOne({id:req.params.id}). then(()=>{
            res.send("Deletado com sucesso a notícia:" + req.params.id)
          })
}) 

app.post('/admin/cadastro', (req, res)=>{
    

    Posts.create({
        titulo:req.body.titulo_noticia,
        categoria: 'Nenhuma',
        imagem: req.body.url_imagem,
        conteudo: req.body.descricao_noticia,
        slug: req.body.slug_noticia,
        autor: "Admin",
    });
    res.redirect('/admin/')

})

app.post('/admin/login', (req, res) =>{
      usuarios.map((val) =>{
        if(val.login == req.body.login && val.senha == req.body.senha){
            req.session.login = "guilherme"
        }
      })
      res.redirect('/admin/login')
})

app.get('/admin/login', (req, res) =>{
    if(req.session.login == null){

        res.render('painel-login')
    }else{
        Posts.find({}).sort({'id': -1}).exec((err, posts) =>{
           posts =  posts.map((val) =>{
               return{
                id:val.id,
                titulo: val.titulo,
                slug: val.slug,
                imagem: val.imagem,
                autor: val.autor
               }
           })
           res.render('painel-adm', {posts})
        })
    }
})


app.listen(3000,()=>{
    console.log('server rodando!');
})