<?php

  // Autoload the dependencies
  require 'vendor/autoload.php';

  // Set the timezone
  date_default_timezone_set('America/New_York');

  // Setting up some namespaces
  use \Psr\Http\Message\ServerRequestInterface as Request;
  use \Psr\Http\Message\ResponseInterface as Response;



  // Initializing the $app object
  $app = new \Slim\App();

  // Get container
  $container = $app->getContainer();

  /*
    Register component on container
  */

  $container['view'] = function ( $container ) {
    $view = new \Slim\Views\Twig(['src','corkscrew'], [
      'debug' => true,
      'cache' => false
    ]);
    $view->addExtension(new \Slim\Views\TwigExtension(
      $container['router'],
      $container['request']->getUri()
    ));

    return $view;
  };

  /*
    Application Routes
  */

  // Overview

  $app->get('/', function( $request, $response ) {
    return $this->view->render($response, 'overview/_index.twig');
  })->setName('overview');

  // API Routing

  $app->get( '/{name}/{item}/json', function ($request, $response, $args ) {

    return $this->view->render($response, $args['name'] . '/' . $args['item'] . '.twig', [
      'name' => $args['name'],
      'item' => $args['item'],
      'function' => 'json'
    ]);

  })->setName('api');

  // General application routes (this will just check for a folder, if it exists, cool, if not, 404)

  $app->get( '/{name}', function ($request, $response, $args ) {

    return $this->view->render($response, $args['name'] . '/_index.twig', [
      'name' => $args['name']
    ]);

  })->setName('navigation');

  $app->run();
