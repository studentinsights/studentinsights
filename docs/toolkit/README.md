# Corkscrew, by Fresh Tilled Soil

### Description

*Version 2 Release*

[View the demo](http://acme.ftsdev.com/styleguide/)

*Corkscrew is a style guide framework*. It was designed with ease of use in mind, it should get out of your way and help you create clear, helpful style guides to hand off to an implementation team. At its core it's a communication tool, but style guides can also serve as application/site road maps.

None of the Corkscrew CSS or JavaScript should collide with any custom code you need for your project; it's all namespaced.

This version of Corkscrew is build on the Slim PHP framework with Twig templating. [Read more about Slim](http://www.slimframework.com/) and [Twig](http://twig.sensiolabs.org/). If you're using it out of the box, it's more important to read up about Twig than Slim. You can probably use Corkscrew without even knowing what Slim is.

### Dependencies

1. [PHP](http://php.net/)
2. [Apache](http://www.apache.org/) or [Nginx](https://www.nginx.com/resources/wiki/) (You have one)
3. [Composer](https://getcomposer.org/)

## Installation

1. Clone the repository
2. Run `composer install` in the terminal
3. If you don't have a server running already, run `php -S localhost:8080 -t .` in the terminal

## Usage

This is the basic structure of the files inside Corkscrew:

```
corkscrew/
├── assets/
│   ├── css/
│   │   ├── stylesheets/
│   │   ├── corkscrew.css
│   │   ├── corkscrew-extend.css
│   ├── images/
│   │   ├── logo.jpg
│   ├── js/
│       ├── corkscrew.js
│       ├── corkscrew-extend.js
│
src/
├── overview/
│   ├── _index.twig
├── */
│   ├── _index.twig
│   ├── *.twig
├── _corkscrew-api.twig
├── _corkscrew-layout.twig
├── _corkscrew-section.twig
│
.editorconfig
.htacces
composer.json
index.php
```

Let's step through what they do:

### Corkscrew

The main guts of Corkscrew live in the /corkscrew directory. You probably won't need to go in there often unless you're customizing the framework itself (not the project files/style guide modules).

*assets/css/corkscrew.css*

This is the main CSS for the framework, you probably won't need to edit this. All the SCSS files live in the sibling directory, `stylesheets`.

*assets/css/corkscrew-extend.css*

This is a CSS file that is hooked into Corkscrew and it is where you would put small, project-base, modifications to the look and feel of the framework itself. This is good to use if your changes probably shouldn't be added into Core.

*assets/js/corkscrew.js*

This file hosts all the JavaScript needed to run Corkscrew (there isn't much).

*assets/js/corkscrew-extend.js*

If you need to add onto Corkscrew's functionality with JavaScript, this is where you would do that.

### Src

The `src` directory is where all your style guide elements and templates live. Corkscrew looks through this directory to assemble your style guide. The URL structure is based on the folders present in  here, so `/base` will render at `<url>/base` and so on. Inside each subdirectory there is an `_index.twig` file, these are required (unless you want to update the routing in `index.php`). They are template includes, you can have as many includes as you want inside these files (or don't use any, it's whatever you want).

*_corkscrew-api.twig*

This is a JSON template for the API.

*_corkscrew-layout.twig*

This is the main layout template for the framework, it also contains your configuration options at the top. This includes: Client Name, misc. options, any css files you need to include, any JavaScript files, and also the color palette. Crack it open and have a look.

*_corkscrew-section.twig*

This is the template file for a sub section inside a page.

### .editorconfig

This is a config file for when you're editing. [read more about editorconfig files](http://editorconfig.org/)

### .htaccess

This is an apache config file so all the templates map to the right URLs. It's required by the Slim PHP framework. I would just leave this alone, it should work with any apache server (you probably have one). [Read more about Slim Web Servers](http://www.slimframework.com/docs/start/web-servers.html), [read more about htaccess files](https://httpd.apache.org/docs/current/howto/htaccess.html)

### composer.json

Composer is a dependency management system for PHP. This file will install everything you need to get up and started when you run `composer install` in the terminal. [Read more about Composer](https://getcomposer.org/)

### index.php

This is where Corkscrew ties itself together. The templating and routing is done in this file. There are 2 main routes set up for you. One is to the homepage ("overview") and the other is a wildcard path /*. Any new routes will need to be placed above the wildcard one to take precedence.

## Extending & customizing the framework

There are some extra hooks built into Corkscrew to help you cleanly customize the framework code to fit your needs while still allowing upgrades to the core framework.

/assets/css/corkscrew-extend.css

If you need to customize the framework for your organization (or client), you would do that in corkscrew-extend.css. It is currently branded for Fresh Tilled Soil, you're welcome to keep it that way, but you're also free to rebrand it.

/assets/js/corkscrew-extend.js

If you need extra functionality in the framework itself (outside of the styleguide), you would do so in corkscrew-extend.js. We don't recommend using corkscrew.js for customizing the interface, which is the main Javascript file for the application, because it could affect upgrades.

## API

Each element has a JSON output version routed to {baseURL}/{section}/{element}/json.

For example, JSON for buttons can be accessed via: http://localhost:8080/components/buttons/json

## Contributing

1. Fork it!
2. Create your feature branch: `git checkout -b my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin my-new-feature`
5. Submit a pull request

## Credits

Corkscrew is an Open Source style guide framework created by [Fresh Tilled Soil](http://freshtilledsoil.com), an experience design agency out of Boston. We use this on all of our projects and we welcome you to  do the same!

- [Tim Wright](http://github.com/timwright12) ( [@csskarma](http://twitter.com/csskarma) )

## License

Code and documentation are released under the MIT license.
