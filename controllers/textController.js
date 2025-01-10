import bcrypt from 'bcryptjs';

const plainTextPassword = 'a1s1d1f1';
const storedHash = '$2a$10$iSJ57950C5AjIxtvwiKEd.F6qphOT8AJYyBQruVhM9HBc5SRFn.QO';

// Compare plain text password with stored hash
const isMatch = bcrypt.compareSync(plainTextPassword, storedHash);
console.log('Password Match with Stored Hash:', isMatch);

// Generate a new hash and test
const newHash = bcrypt.hashSync(plainTextPassword, 10);
console.log('New Hash:', newHash);

const isNewMatch = bcrypt.compareSync(plainTextPassword, newHash);
console.log('Password Match with New Hash:', isNewMatch);
