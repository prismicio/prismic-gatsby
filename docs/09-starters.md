# Starters

Here you'll find a starter project we've created to help you learn how to use Gatsby with Prismic. Feel free to explore how it all works or use it as your starter project if it fits your needs!

---

## Multilanguage site

This starter project uses the preview setup with `gatsby-plugin-prismic-previews` and pulls data from your newly created repository with the source plugin `gatsby-source-prismic`.

The content model for this sample blog has three Custom Types: `homepage`, `post`, and `menu`. And two initial languages that you can explore with the built-in language switcher. You can add any additional languages to your repository.

![Sample Gatsby multi-language site](https://images.prismic.io/prismicio-docs-v3/a4a44978-317a-48db-b846-2199af209f02_multi-lang.png?auto=compress,format&rect=55,0,1167,772&w=470&h=311)

Multi-language site with multiple locals and a language switcher.

- [Preview](https://gatsby-prismic-multi-language-site.vercel.app/)
- [Explore](https://github.com/prismicio/gatsby-multi-language-site)

## Run the command

Navigate to the location you want to create your project and run the theme command in the terminal. It'll perform these processes:

1. Install the Prismic CLI (command-line interface). This tool will allow you to interact with Prismic from your local machine.
1. Run the theme command. It'll prompt you to name your Prismic repository and local folder. Then, it'll install the project code locally, download the project files to your machine and create a new repository with content.
1. If you're not logged in to Prismic yet, it'll prompt an option to enter the email and password for your Prismic account (or sign up for an account).

Select the command for the sample project of your choice:

```bash
npx prismic-cli@latest theme --theme-url https://github.com/prismicio/gatsby-multi-language-site --conf prismic-configuration.js
```

## Run the project

Run your project with the following command and view your published content locally.

**npm**:

```bash
npm start
```

**Yarn**:

```bash
yarn start
```

Your site is now running locally at [http://localhost:8000](http://localhost:8000/). You can change the code to customize the website: edit the stylesheets, the templates, and the repository's content to fit your design.

## Deploy the project

You can publish your newly created site right away, refer to the dedicated deployment guide and select the option that best fits your needs:

- [**Deploy**](./07-deploy.md)<br/>Resources to help you deploy your Prismic and Gatsby project to one of the many providers that support static sites.
