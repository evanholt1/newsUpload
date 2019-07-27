// News Class
class News {
  constructor(Title,URL,text) {
    this.title = Title;
    this.URL =  URL; // for Routes to work
    this.text = text;
  }
}
News.count = 0; // Static field

module.exports = News;