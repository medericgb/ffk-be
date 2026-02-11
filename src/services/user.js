import { faker } from '@faker-js/faker';
import bcrypt from 'bcryptjs';
import prisma from '../lib/prisma.js';

const MAX_GENERATE = 500;
const BCRYPT_ROUNDS = 10;

function generateUser() {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const birthDate = faker.date.birthdate({ min: 18, max: 80, mode: 'age' });
  return {
    firstName,
    lastName,
    birthDate: birthDate.toISOString().slice(0, 10),
    city: faker.location.city(),
    country: faker.location.countryCode('alpha-2'),
    avatar: faker.image.avatar(),
    company: faker.company.name(),
    jobPosition: faker.person.jobTitle(),
    mobile: faker.phone.number(),
    username: faker.internet.username({ firstName, lastName }).toLowerCase().replace(/[^a-z0-9._]/g, '_'),
    email: faker.internet.email({ firstName, lastName }).toLowerCase(),
    password: faker.string.alphanumeric({ length: { min: 6, max: 10 } }),
    role: faker.helpers.arrayElement(['admin', 'user']),
  };
}

function generateUsers(count = 10) {
  const safeCount = Math.min(
    Math.max(1, parseInt(count, 10) || 1),
    MAX_GENERATE
  );
  return Array.from({ length: safeCount }, generateUser);
}

async function importBatch(fileBuffer) {
  let data;
  try {
    data = JSON.parse(fileBuffer.toString('utf8'));
  } catch {
    throw new Error('Fichier JSON invalide');
  }
  if (!Array.isArray(data)) {
    throw new Error('Le fichier doit contenir un tableau d\'utilisateurs');
  }

  const existing = await prisma.user.findMany({
    select: { email: true, username: true },
  });
  const existingEmails = new Set(existing.map((u) => u.email));
  const existingUsernames = new Set(existing.map((u) => u.username));

  let imported = 0;
  for (const row of data) {
    const email = row.email?.trim?.();
    const username = row.username?.trim?.();
    if (!email || !username) continue;
    if (existingEmails.has(email) || existingUsernames.has(username)) continue;

    const hashedPassword = await bcrypt.hash(String(row.password || ''), BCRYPT_ROUNDS);
    await prisma.user.create({
      data: {
        firstName: row.firstName ?? null,
        lastName: row.lastName ?? null,
        birthDate: row.birthDate ? new Date(row.birthDate) : null,
        city: row.city ?? null,
        country: row.country ?? null,
        avatar: row.avatar ?? null,
        company: row.company ?? null,
        jobPosition: row.jobPosition ?? null,
        mobile: row.mobile ?? null,
        username,
        email,
        password: hashedPassword,
        role: (row.role === 'admin' || row.role === 'user') ? row.role : 'user',
      },
    });
    existingEmails.add(email);
    existingUsernames.add(username);
    imported += 1;
  }

  return { total: data.length, imported, notImported: data.length - imported };
}

async function findByUsernameOrEmail(login) {
  const s = String(login ?? '').trim();
  if (!s) return null;
  return prisma.user.findFirst({
    where: {
      OR: [{ email: s }, { username: s }],
    },
  });
}

async function findByUsername(username) {
  if (!username) return null;
  return prisma.user.findUnique({
    where: { username: String(username).trim() },
  });
}

function sanitizeUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

export {
  generateUser,
  generateUsers,
  importBatch,
  findByUsernameOrEmail,
  findByUsername,
  sanitizeUser,
  MAX_GENERATE,
};
