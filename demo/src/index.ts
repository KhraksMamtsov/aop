// import "./01_decorator.ts";
// import "./02_aspect.ts";
// import "./03_decoratorES6.ts";
// import "./03_trueAspect.ts";
import "./04_decorators.ts";

// import { afterMethod, beforeMethod, Advised, Metadata } from "aspect.js";
// import * as AOP from "aspect.js";

// console.log(AOP);

// class LoggerAspect {
//   @afterMethod({
//     classNamePattern: /^Article/,
//     methodNamePattern: /^(getArticle)/
//   })
//   invokeBeforeMethod(meta: Metadata) {
//     // meta.advisedMetadata == { bar: 42 }
//     console.log(meta);
//     console.info(
//       `Inside of the logger. Called ${meta.className}.${
//       meta.method.name
//       } with args: ${meta.method.args.join(", ")}.`
//     );
//   }
// }

// class Article {
//   id: number;
//   title: string;
//   content: string;
// }

// @Advised({ bar: 42 })
// class ArticleCollection {
//   articles: Article[] = [];

//   async getArticle(id: number) {
//     console.log(`Getting article with id: ${id}.`);
//     return this.articles.filter(a => a.id === id)[0];
//   }

//   async setArticle(article: Article) {
//     console.log(`Setting article with id: ${article.id}.`);
//     this.articles.push(article);
//   }
// }

// let ac = new ArticleCollection();
// ac.setArticle({
//   content: "Article Content",
//   id: 0,
//   title: "Article example"
// });

// ac.getArticle(0).then(console.log);

// // Result:
// // Inside of the logger. Called ArticleCollection.getArticle with args: 1.
// // Getting article with id: 1.
