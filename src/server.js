const express = require('express');
const path = require('path');

const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const autosoloDb = require('./autosoloDb.js');

const swaggerDocument = YAML.load(path.resolve('./src/swagger.yml'));

const app = express();
const port = process.env.PORT || 5000;

const dbUrl = process.env.DB_CONNECTION || 'mongodb://localhost:27017';
const dbName = process.env.DB_NAME || 'autosolo';

app.use(express.json());
app.use(cors());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/events', async (req, res) => {
  try {
    const events = await autosoloDb.getEvents();
    res.json(events);
  } catch (err) {
    res.sendStatus(err.errorCode || 500);
  }
});

app.get('/events/:id', async (req, res) => {
  try {
    const event = await autosoloDb.getEvent(req.params.id);
    res.json(event);
  } catch (err) {
    res.sendStatus(err.errorCode || 500);
  }
});

app.put('/events', async (req, res) => {
  try {
    await autosoloDb.saveEvent(req.body);
    res.sendStatus(204);
  } catch (err) {
    console.log(err)
    res.sendStatus(err.errorCode || 500);
  }
});

app.delete('/events/:id', async (req, res) => {
  try {
    await autosoloDb.deleteEvent(req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.sendStatus(err.errorCode || 500);
  }
});

app.get('/events/:eventId/drivers', async (req, res) => {
  try {
    const drivers = await autosoloDb.getDrivers(req.params.eventId);
    res.json(drivers);
  } catch (err) {
    res.sendStatus(err.errorCode || 500);
  }
});

app.put('/events/:eventId/drivers', async (req, res) => {
  try {
    await autosoloDb.saveDriver(req.params.eventId, req.body);
    res.sendStatus(204);
  } catch (err) {
    res.sendStatus(err.errorCode || 500);
  }
});

app.put('/events/:eventId/drivers/:id/append', async (req, res) => {
  try {
    await autosoloDb.appendTime(req.params.eventId, req.params.id, req.body);
    res.sendStatus(204);
  } catch (err) {
    res.sendStatus(err.errorCode || 500);
  }
});

app.get('/events/:eventId/drivers/:id', async (req, res) => {
  try {
    const event = await autosoloDb.getDriver(req.params.id);
    res.json(event);
  } catch (err) {
    res.sendStatus(err.errorCode || 500);
  }
});

app.delete('/events/:eventId/drivers/:id', async (req, res) => {
  try {
    await autosoloDb.deleteDriver(req.params.eventId, req.params.id);
    res.sendStatus(204);
  } catch (err) {
    res.sendStatus(err.errorCode || 500);
  }
});

const connectToDb = async () => {
  try {
    await autosoloDb.connectToDb(dbUrl, dbName);
    app.listen(port, () => {
      // eslint-disable-next-line no-console
      console.log(`server is listening on ${port}`);
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log('unable to connect to mongo');
  }
};

connectToDb();

module.exports = app;
