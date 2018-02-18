# RPAS

## Introduction

Embedded system.


## Install

### Local

Pour effectuer l'installation sur une machine local, la première (et seul) étape
consiste à installer les dépendances node avec la commande ``npm i``.


### Raspberry Pi 3

Mettre à jour les packets Raspbian (`sudo apt-get update` et `sudo apt-get upgrade`).

Les packets suivant sont aussi nécessaire:

```sh
sudo apt-get install cmake build-essential libglib2.0-dev libgtk2.0-dev libxtst-dev \
    libxss-dev libpci-dev libdbus-1-dev libgconf2-dev \
    libgnome-keyring-dev libnss3-dev libasound2-dev libpulse-dev \
    libudev-dev
```

Cf build [libwebrtc](https://github.com/aisouard/libwebrtc)

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


### install

Télécharger l’archive. La dernière version est la 3.1.5.:

```sh
wget http://www.rabbitmq.com/releases/rabbitmq-server/v3.1.5/rabbitmq-server_3.1.5-1_all.deb
```

Installer les paquets supplémentaires:

```sh
apt-get install -y erlang logrotate
```

Installer RabbitMQ:

```sh
dpkg -i rabbitmq-server_3.1.5-1_all.deb
```

Activer les plugins de gestion du serveur:

```sh
rabbitmq-plugins enable rabbitmq_management
```

Puis redémarrer le service:

```sh
service rabbitmq-server restart
```

Pour accéder au Raspberry Pi, aller à l’adresse `http://<ip du raspberry>:15672/#/`


## Annex

Build `node-webrtc` [here](https://github.com/js-platform/node-webrtc/wiki/Building)
