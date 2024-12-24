# Docker Deploy Templates
This is a work in progress of the scripts and steps required to deploy in docker.

## TODO:
* Create a single sh script that would:
  * Install docker
  * logs into docker hub (if password provided)
  * download the docker image of the app
  * download template files from this repo
  * Create SSL Certificates for the domain with certbot
  * configure nginx
  * delete templates
  * lift the app [optional]

## Script params
* domain
* docker image
* docker user     [optional]
* docker password [optional]
* deploy flavor   [mongo-local, mongo-cloud, postgres-local][defaults mongo-local]
* should Lift     [optional][defaults false]

## Not Considered
* local config for the repo

As of now the file docker-certbot.sh is going in the right direction, but it is not there yet

