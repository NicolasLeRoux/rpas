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
sudo apt-get install cmake
```

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
