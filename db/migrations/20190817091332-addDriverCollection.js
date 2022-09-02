module.exports = {
  up(db) {
    return db.createCollection('drivers');
  },

  down(db) {
    return db.drivers.drop();
  },
};
