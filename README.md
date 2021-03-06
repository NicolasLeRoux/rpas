# RPAS

## Introduction

Embedded system.


## Installation

### Locale

Pour effectuer l'installation sur une machine locale, la première étape consiste à
installer les dépendances node avec la commande `npm i`.

Ensuite, effectuer l'installation de la librairie `node-webrtc` globalement avec la
commande `npm i -g wrtc`.


### Raspberry Pi 3

Mettre à jour les packets Raspbian (`sudo apt-get update` et `sudo apt-get upgrade`).

Ensuite, installer `nodejs` via les commande suivante:

```sh
curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -
sudo apt-get install -y nodejs
```

Puis, aller dans le répertoire `srv` (c'est un répertoire contient les fichiers de sites
qui seront servis par ftp, rsync, www, cvs...).

Télécharger le projet Github en `https`. Ici, seul la lecture va nous intéresser.

```sh
git clone https://github.com/NicolasLeRoux/rpas.git
```

Puis, se déplacer dans le projet `rpas`.

Lancer la commande d'installation des dépendances node (`npm i`).

Ensuite, il est nécessaire d'installer la librairie `node-webrtc` globalement. En revanche, 
ce n'est pas la librairie officielle, mais un fork de cette dernière spécifique
à l'architecture du raspberry pi 3.

```sh
cd ~
git clone https://github.com/ssaroha/node-webrtc.git
cd node-webrtc
gunzip third_party/webrtc/lib/libwebrtc.a.gz
npm install
npm link
```


## Démarrage

### Local

Démarrer l'application avec la commande ``npm run start:local``.

:warning: Le serveur doit être démarré afin d'initier la communication web socket.


### À distance (Heroku)

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

Afin d'exécuter les applications `Python` et `Node` dans des process séparés, un
`message broker` est utilisé pour effectuer la communication entre eux. Ici, c'est
RabbitMQ notre `message broker`, avec `amqplib` pour l'intégration avec `Node` et
`pika` pour `Python`. Cf [medium](https://medium.com/@HolmesLaurence/integrating-node-and-python-6b8454bfc272)

RabbitMQ implémente entre autre le protocole AMQP qui permet de transporter des
messages contenant de l'information. Ce transport se fait de point à point ou bien
sur le principe de l'abonnement à un type de message.


### Installation

#### OSX

Installation avec brew:

```sh
brew update
brew install rabbitmq
```

Plus d'information [ici](https://www.rabbitmq.com/install-homebrew.html).


#### Raspberry Pi 3

Télécharger l'archive. La dernière version est la 3.1.5.:

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

Pour accéder au Raspberry Pi, aller à l'adresse `http://<ip du raspberry>:15672/#/`
avec les identifiants par défaut:
- Username `guest`
- Password `guest`


## Annexe

Pour construire `node-webrtc`, voir [ici](https://github.com/js-platform/node-webrtc/wiki/Building)
