# Installation

- [Fast launch with docker (recommended for testing)](#fast-launch-with-docker)
- [Manual installation](#manual-installation)
- [All parameters of the config file](ConfigYML.md)

## Fast launch with docker

__Required applications__

- Docker ([install](https://docs.docker.com/engine/install/))
- Docker Compose ([install](https://docs.docker.com/compose/install/))

__Install__

- Download and unpack repository `https://github.com/chain-action/http-notification/tree/contest`

- Go to directory ./docker `cd ./docker`
- Start the docker application (change ports in the `.env` file if they are busy)
```shell
docker-compose up --build -d
```

## Manual installation
__Required applications__

- MariaDB or Mysql ([install](https://mariadb.org/download/))
- Java JRE (OpenJDK JRE at least 15 version)
- Redis ([install](https://redis.io/download))
- InfluxDB 2.0 ([install](https://portal.influxdata.com/downloads/)) (optional)

__Install__

- Create application directory and go to it
```shell
mkdir app
cd app
```

- [Download](https://github.com/chain-action/http-notification/releases/download/v1.0.3/HttpNotification.main.jar) or compile the application into an executable JAR file
```shell
wget -O HttpNotification.main.jar https://github.com/chain-action/http-notification/releases/download/v1.0.3/HttpNotification.main.jar
```

- Create file `config.yml` based on `example.config.yml` and edit its parameters (mysql, kafka, influxdb sections). [More on config.yml parameters](ConfigYML.md)
```shell
cp example.config.yml config.yml
vim config.yml
```
- Application initialization (creating tables in the database)
```shell
java -Dfile.encoding=UTF-8 -jar HttpNotification.main.jar --createtable
```
- Application launch
```shell
java -Dfile.encoding=UTF-8 -jar HttpNotification.main.jar
```

- Configure a backend server (nginx, apache, etc, ...) for API accessibility via https protocol

Examples `location` for Nginx
```txt
    location ~ ^/(v1|v0){
      proxy_pass http://127.0.0.1:8010;
    }
```

## [Usage application](USAGE.md)

## Misc for developers

```shell
# Running helper services (mysql,) in docker 
docker-compose -f docker-compose.dev.yml -p http_notify_dev up --build --force-recreate -d

# Application initialization (creating tables in the database) 
java -Dfile.encoding=UTF-8 -jar HttpNotification.main.jar --createtable
# Application launch 
java -Dfile.encoding=UTF-8 -jar HttpNotification.main.jar
```

