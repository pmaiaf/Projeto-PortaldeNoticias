var mongoose = require('mongoose')

var Schema = mongoose.Schema;

var postSchema = new Schema({

    titulo: String,
    imagem: String,
    categoria: String,
    conteudo: String,
    slug: String,
    autor: String,
    views: Number,
    previa: String
},{collection:'Posts'})


var Posts = mongoose.model('Post', postSchema)

module.exports = Posts;