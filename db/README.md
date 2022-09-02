# Autosolo Database

## Development

### Prerequisites
* Docker

### Running
Mongo is run in a docker container, migrate-mongo is used for upgrades/downgrades to the database.

Start the container with a volume to persist data
```
docker volume create --name=mongodata
docker run -p 27017:27017 -v mongodata:/data/db --name autosolo-mongo -d mongo:4.2.2
```

Run migration scripts
```
npm install
.\node_modules\.bin\migrate-mongo up
```