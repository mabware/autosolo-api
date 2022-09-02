docker volume create --name=mongodata
docker run -p 27017:27017 -v mongodata:/data/db --name autosolo-mongo -d mongo:4.2.2