const { MongoClient, ObjectId } = require('mongodb');
const HttpError = require('./httpError');

let db;

const connectToDb = (dbUrl, dbName) => new Promise((resolve) => {
  MongoClient.connect(dbUrl, (err, database) => {
    if (err) {
      setTimeout(connectToDb, 5000);
      // eslint-disable-next-line no-console
      console.log(err);
    } else {
      db = database.db(dbName);
      resolve();
    }
  });
});

const getEvents = async () => new Promise((resolve, reject) => {
  db.collection('events').find().toArray((err, results) => {
    if (!err) {
      resolve(results.map((result) => {
        const { _id, ...event } = result;
        return { id: _id, ...event };
      }));
    } else {
      reject(new HttpError(500, err.message));
    }
  });
});

const getEvent = (id) => new Promise((resolve, reject) => {
  db.collection('events').findOne({ _id: ObjectId(id) }, (err, result) => {
    if (!err && result) {
      const { _id, ...event } = result;
      resolve({ id: _id, ...event });
    } else if (!err && !result) {
      reject(new HttpError(404, 'Not Found'));
    } else {
      reject(new HttpError(500, err.message));
    }
  });
});

const saveEvent = (apiEvent) => {
  const { id, ...event } = apiEvent;
  return new Promise((resolve, reject) => {
    db.collection('events').save({ _id: ObjectId(id), date: new Date(apiEvent.date), ...event }, (err) => {
      if (!err) {
        resolve();
      } else {
        reject(new HttpError(500, err.message));
      }
    });
  });
};

const deleteEvent = (id) => new Promise((resolve, reject) => {
  db.collection('events').deleteOne({ _id: ObjectId(id) }, (err) => {
    if (!err) {
      db.collection('drivers').deleteMany({ eventId: id }, (manyErr) => {
        if (!manyErr) {
          resolve();
        } else {
          reject(new HttpError(500, err.message));
        }
      });
    } else {
      reject(new HttpError(500, err.message));
    }
  });
});

const getDrivers = (id) => new Promise((resolve, reject) => {
  db.collection('drivers').find({ eventId: id }).toArray((err, results) => {
    if (!err && results) {
      resolve(results.map((result) => {
        const { _id, eventId, ...event } = result;
        return { id: _id, ...event };
      }));
    } else if (!err && !results) {
      reject(new HttpError(404, `No drivers found for eventId: ${id}`));
    } else {
      reject(new HttpError(500, err.message));
    }
  });
});

const getDriver = (id) => new Promise((resolve, reject) => {
  db.collection('drivers').findOne({ _id: ObjectId(id) }, (err, result) => {
    if (!err && result) {
      const { _id, eventId, ...event } = result;
      resolve({ id: _id, ...event });
    } else if (!err && !result) {
      reject(new HttpError(404, 'Not Found'));
    } else {
      reject(new HttpError(500, err.message));
    }
  });
});

const saveDriver = (eventId, apiDriver) => {
  const { id, ...driver } = apiDriver;
  return new Promise((resolve, reject) => {
    db.collection('drivers').save({ _id: ObjectId(id), eventId, ...driver }, (err) => {
      if (!err) {
        resolve();
      } else {
        reject(new HttpError(500, err.message));
      }
    });
  });
};

const appendTime = async (eventId, driverId, timeJson) => {
  const event = await getEvent(eventId);
  const driver = await getDriver(driverId);
  const courses = Object.keys(event.config);
  let timeAdded = false;
  courses.forEach(course => {
    const runs = parseInt(event.config[course].runs, 10);
    if (runs && !timeAdded) {
      for (var i = 1; i <= runs; i += 1) {
        if (driver.times[course] == undefined) {
          driver.times[course] = {};
        }
        if (driver.times[course][i] === undefined) {
          timeAdded = true;
          driver.times[course][i] = timeJson.time;
          break;
        }
      }
    }
  })

  return new Promise((resolve, reject) => {
    db.collection('drivers').save({ _id: ObjectId(driverId), eventId, ...driver }, (err) => {
      if (!err) {
        resolve();
      } else {
        reject(new HttpError(500, err.message));
      }
    });
  });
};

const deleteDriver = (eventId, driverId) => new Promise((resolve, reject) => {
  db.collection('drivers').deleteOne({ _id: ObjectId(driverId), eventId }, (err) => {
    if (!err) {
      resolve();
    } else {
      reject(new HttpError(500, err.message));
    }
  });
});

module.exports = {
  connectToDb,
  getEvents,
  getEvent,
  saveEvent,
  deleteEvent,
  getDrivers,
  getDriver,
  saveDriver,
  appendTime,
  deleteDriver,
};
