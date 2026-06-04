const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const DATA_DIR = path.join(__dirname, "..", "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Read database file
function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    return { User: [], Project: [], Task: [] };
  }
  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data || '{"User":[],"Project":[],"Task":[]}');
  } catch (err) {
    console.error("Failed to read local DB file, resetting:", err.message);
    return { User: [], Project: [], Task: [] };
  }
}

// Write database file
function writeDb(data) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Failed to write local DB file:", err.message);
  }
}

// Flag set by server.js when Atlas connection fails
global.mongoConnectionFailed = global.mongoConnectionFailed || false;

function useLocalDb() {
  // If connection is not active and we have flagged a failure or aren't connecting
  return mongoose.connection.readyState !== 1 && (global.mongoConnectionFailed || mongoose.connection.readyState === 0);
}

class LocalQuery {
  constructor(data, modelName) {
    this.data = data;
    this.modelName = modelName;
  }

  populate(pathName, selectFields) {
    const db = readDb();
    if (pathName === "assignedTo") {
      this.data = this.data.map(item => {
        const assignedId = item.assignedTo;
        if (!assignedId) return { ...item, assignedTo: null };
        const user = db.User.find(u => u._id.toString() === assignedId.toString());
        return {
          ...item,
          assignedTo: user ? { _id: user._id, name: user.name, email: user.email } : null
        };
      });
    } else if (pathName === "projectId") {
      this.data = this.data.map(item => {
        const projId = item.projectId;
        if (!projId) return { ...item, projectId: null };
        const project = db.Project.find(p => p._id.toString() === projId.toString());
        return {
          ...item,
          projectId: project ? { _id: project._id, name: project.name } : null
        };
      });
    }
    return this;
  }

  then(onResolve, onReject) {
    return Promise.resolve(this.data).then(onResolve, onReject);
  }
}

function createModelWrapper(modelName, mongooseModel) {
  return {
    async create(data) {
      if (!useLocalDb()) {
        try {
          return await mongooseModel.create(data);
        } catch (err) {
          // If mongoose failed during operation, fallback to local database
          console.warn(`Mongoose create failed for ${modelName}, falling back to local storage:`, err.message);
        }
      }

      console.log(`Using Local DB fallback for: ${modelName}.create`);
      const db = readDb();
      if (!db[modelName]) db[modelName] = [];

      const newItem = {
        _id: new mongoose.Types.ObjectId().toString(),
        ...data,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      db[modelName].push(newItem);
      writeDb(db);
      return newItem;
    },

    findOne(query) {
      if (!useLocalDb()) {
        return mongooseModel.findOne(query);
      }

      console.log(`Using Local DB fallback for: ${modelName}.findOne`);
      const db = readDb();
      const items = db[modelName] || [];

      const matched = items.find(item => {
        return Object.keys(query).every(key => {
          return item[key] === query[key];
        });
      });

      // Wrap in thenable query
      return new LocalQuery(matched || null, modelName);
    },

    find(query = {}) {
      if (!useLocalDb()) {
        return mongooseModel.find(query);
      }

      console.log(`Using Local DB fallback for: ${modelName}.find`);
      const db = readDb();
      let items = db[modelName] || [];

      if (Object.keys(query).length > 0) {
        items = items.filter(item => {
          return Object.keys(query).every(key => {
            return item[key] === query[key];
          });
        });
      }

      return new LocalQuery(items, modelName);
    },

    async findByIdAndUpdate(id, update, options = {}) {
      if (!useLocalDb()) {
        try {
          return await mongooseModel.findByIdAndUpdate(id, update, options);
        } catch (err) {
          console.warn(`Mongoose findByIdAndUpdate failed for ${modelName}, falling back:`, err.message);
        }
      }

      console.log(`Using Local DB fallback for: ${modelName}.findByIdAndUpdate`);
      const db = readDb();
      const items = db[modelName] || [];
      const idx = items.findIndex(item => item._id.toString() === id.toString());

      if (idx !== -1) {
        items[idx] = {
          ...items[idx],
          ...update,
          updatedAt: new Date().toISOString()
        };
        writeDb(db);
        return items[idx];
      }
      return null;
    },

    async countDocuments(query = {}) {
      if (!useLocalDb()) {
        try {
          return await mongooseModel.countDocuments(query);
        } catch (err) {
          console.warn(`Mongoose countDocuments failed for ${modelName}, falling back:`, err.message);
        }
      }

      console.log(`Using Local DB fallback for: ${modelName}.countDocuments`);
      const db = readDb();
      let items = db[modelName] || [];

      if (Object.keys(query).length > 0) {
        items = items.filter(item => {
          // Status check
          if (query.status) {
            if (typeof query.status === "object" && query.status.$ne) {
              if (item.status === query.status.$ne) return false;
            } else {
              if (item.status !== query.status) return false;
            }
          }
          // Due date check
          if (query.dueDate && query.dueDate.$lt) {
            if (!item.dueDate || new Date(item.dueDate) >= new Date(query.dueDate.$lt)) return false;
          }
          return true;
        });
      }

      return items.length;
    }
  };
}

module.exports = {
  createModelWrapper,
  useLocalDb
};
