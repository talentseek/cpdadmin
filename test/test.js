import bcrypt from 'bcrypt';
import User from '../models/User.mjs';

describe('User Model Tests', () => {
  test('Hash Password', async () => {
    const password = "testPassword";
    const hashedPassword = await bcrypt.hash(password, 10);
    expect(hashedPassword).not.toBe(password);
    expect(hashedPassword.length).toBeGreaterThan(0);
  });

  test('Validate Correct Password', async () => {
    const password = "testPassword";
    const hashedPassword = await bcrypt.hash(password, 10);
    const isMatch = await bcrypt.compare(password, hashedPassword);
    expect(isMatch).toBe(true);
  });

  test('Validate Incorrect Password', async () => {
    const password = "testPassword";
    const wrongPassword = "wrongPassword";
    const hashedPassword = await bcrypt.hash(password, 10);
    const isMatch = await bcrypt.compare(wrongPassword, hashedPassword);
    expect(isMatch).toBe(false);
  });

  test('Create User and Find by Email', async () => {
    const userData = {
      firstName: "John",
      lastName: "Doe",
      companyName: "Acme Inc",
      email: "john.doe@example.com",
      password: "securePassword123",
      isAdmin: false,
      campaignIds: []
    };

    const newUser = new User(userData);
    await newUser.save();

    const foundUser = await User.findOne({ email: userData.email });
    expect(foundUser).not.toBeNull();
    expect(foundUser.email).toBe(userData.email);

    // Cleanup
    await User.deleteOne({ email: userData.email });
  });
});