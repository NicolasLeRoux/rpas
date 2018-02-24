# RPAS

## Introduction

Embedded system.


## Install

### Local

Pour effectuer l'installation sur une machine local, la première étape consiste à
installer les dépendances node avec la commande `npm i`.

Ensuite, effectuer l'install de la librairie `node-webrtc` globalement avec la
commande `npm i -g node-webrtc`.


### Raspberry Pi 3

Mettre à jour les packets Raspbian (`sudo apt-get update` et `sudo apt-get upgrade`).

Ensuite, installer `nvm` ([Node Version Manager](https://github.com/creationix/nvm))
via la commande suivante:

```sh
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
```

Puis, installer la dernière version de node:

```sh
nvm install 9
```

Puis, aller dans le répertoire `svr` (Srv is a serve folder. It holds site specific
data to be served by the system for protocols such as, ftp, rsync, www, cvs...).

Downloader le projet en `https`. Ici, seul la lecture va nous intéresser.

```sh
git clone https://github.com/NicolasLeRoux/rpas.git
```

Puis, se déplacer dans le projet `rpas`.

Lancer la commande d'installation des dépendances node (`npm i`).

Ensuite; il est nécessaire d'installer la librairie `node-webrtc` globalement. Par
contre, ce n'est pas la librairie officiel, mais un fork de cette dernière spécifique
à l'architecture du raspberry pi 3.

```sh
cd /home/pi/.nvm/versions/node/v9.5.0/lib/node_modules/
git clone https://github.com/ssaroha/node-webrtc.git
cd node-webrtc
gunzip third_party/webrtc/lib/libwebrtc.a.gz
npm install
```

Puis, pour référencer la lib `wrtc` dans node, lancer la commande:

```sh
npm i -g node-webrtc
```


## Start

### Local

Démarrer l'application avec la commande ``npm run start:local``.

:warning: Le serveur doit-être démarrer afin d'initier la communication web socket.


### Remote (Heroku)

Démarrer l'application avec la commande ``npm start``.


## PanTiltHat

Lien vers la documentation [ici](http://docs.pimoroni.com/pantilthat/)

Exemple de code python:

```python
import pantilthat

pantilthat.pan(25) # From -90 to 90
pantilthat.tilt(-12) # From -90 to 90
```


## RabbitMQ

Afin d'excécuter les applications `Python` et `Node` dans des process séparés, un
`message broker` est utilisé pour effectuer la communication entre eux. Ici, c'est
RabbitMQ notre `message broker`, avec `amqplib` pour l'intégration avec `Node` et
`pika` pour `Python`. Cf [medium](https://medium.com/@HolmesLaurence/integrating-node-and-python-6b8454bfc272)

RabbitMQ implémente entre autre le protocole AMQP qui permet de transporter des
messages contenant de l’information. Ce transport se fait de point à point ou bien
sur le principe de l’abonnement à un type de message.


### Install

#### OSX

Installation avec brew:

```sh
brew update
brew install rabbitmq
```

More information [here](https://www.rabbitmq.com/install-homebrew.html).


#### Raspberry Pi 3

Télécharger l’archive. La dernière version est la 3.1.5.:

```sh
wget http://www.rabbitmq.com/releases/rabbitmq-server/v3.1.5/rabbitmq-server_3.1.5-1_all.deb
```

Installer les paquets supplémentaires:

```sh
sudo apt-get install -y erlang logrotate
```

Installer RabbitMQ:

```sh
sudo dpkg -i rabbitmq-server_3.1.5-1_all.deb
```

Si vous avez une erreur essayez la commande:

```sh
sudo apt-get -f install
```

Activer les plugins de gestion du serveur:

```sh
sudo rabbitmq-plugins enable rabbitmq_management
```

Puis redémarrer le service:

```sh
sudo service rabbitmq-server restart
```

Pour accéder au Raspberry Pi, aller à l’adresse `http://<ip du raspberry>:15672/#/`
avec les identifiants par défaut:
- Username `guest`
- Password `guest`


## Annex

Build `node-webrtc` [here](https://github.com/js-platform/node-webrtc/wiki/Building)
