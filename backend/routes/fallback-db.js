const fs = require('fs').promises;
const path = require('path');

const DB_FILE = path.join(__dirname, '../data/users.json');

class FallbackDB {
  async readUsers() {
    try {
      const data = await fs.readFile(DB_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        return [];
      }
      throw error;
    }
  }

  async writeUsers(users) {
    await fs.writeFile(DB_FILE, JSON.stringify(users, null, 2));
  }

  async addUser(user) {
    const users = await this.readUsers();
    const newUser = {
      _id: Date.now().toString(),
      ...user,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    users.push(newUser);
    await this.writeUsers(users);
    return newUser;
  }

  async findUser(query) {
    const users = await this.readUsers();
    return users.find(user => {
      return Object.keys(query).every(key => {
        if (typeof query[key] === 'object' && query[key] !== null) {
          return JSON.stringify(user[key]) === JSON.stringify(query[key]);
        }
        return user[key] === query[key];
      });
    });
  }

  async getAllUsers() {
    return await this.readUsers();
  }

  async getUserStats() {
    const users = await this.readUsers();
    const totalUsers = users.length;
    const verifiedUsers = users.filter(u => u.isEmailVerified).length;
    const socialUsers = users.filter(u => u.socialAccounts && u.socialAccounts.length > 0).length;
    
    return {
      totalUsers,
      verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      socialUsers,
      regularUsers: totalUsers - socialUsers
    };
  }
}

module.exports = new FallbackDB();