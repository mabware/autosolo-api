module.exports = {
  up(db) {
    return db.createCollection('events');
  },

  down(db) {
    return db.events.drop();
  },
};
