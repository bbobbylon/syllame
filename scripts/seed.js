/**
 * Seeds the database with test users and syllabi so you can log in and click
 * around without registering by hand.
 *
 * Usage:
 *   npm run seed            # add/refresh the seed data, leave everything else alone
 *   npm run seed -- --wipe  # empty the users and syllabi collections first
 *
 * Reads MONGO_URI from .env like the server does. Refuses to run against a
 * production database unless you pass --force, because the seed users have
 * well-known passwords.
 *
 * Analogy: this is the "sample data" checkbox some installers offer. It is
 * idempotent: running it twice replaces the seed users' data rather than
 * duplicating it, so you can reset your playground at any time.
 */

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const env = require("../config/env");
const User = require("../models/user");
const Syllabus = require("../models/syllabus");

/** Every seed account uses this password. */
const SEED_PASSWORD = "Password123";

/** Test accounts. Emails end in example.com, which can never receive mail. */
const SEED_USERS = [
  { firstname: "Alice", lastname: "Instructor", email: "alice@example.com" },
  { firstname: "Bob", lastname: "Adjunct", email: "bob@example.com" }
];

/** Syllabi keyed by the owner's email. */
const SEED_SYLLABI = {
  "alice@example.com": [
    {
      title: "Introduction to Databases",
      courseNumber: "CS 340",
      creditHours: 4,
      instructorName: "Alice Instructor",
      emailAddress: "alice@example.com",
      phoneNumber: "555-0100",
      officeNumber: "Engineering 214",
      officeHours: "Tue/Thu 2:00-3:30 PM or by appointment",
      courseDescription:
        "Relational data modeling, SQL, normalization, transactions, and an introduction to document databases such as MongoDB.",
      meetingTimes: "Mon/Wed/Fri 10:00-10:50 AM",
      meetingLocation: "Science Hall 120",
      courseMaterials:
        "Database System Concepts, 7th ed. (Silberschatz, Korth, Sudarshan)\nA laptop able to run PostgreSQL and MongoDB",
      courseSchedule:
        "Week 1: Course overview, relational model\nWeek 2-3: SQL fundamentals\nWeek 4-5: Schema design and normalization\nWeek 6: Midterm\nWeek 7-9: Transactions and indexing\nWeek 10-12: NoSQL and MongoDB\nWeek 13-14: Team project\nWeek 15: Final exam",
      gradingScale: "A 90-100\nB 80-89\nC 70-79\nD 60-69\nF below 60\n\nHomework 30%, Midterm 20%, Project 25%, Final 25%",
      extraInfo: "Late work loses 10% per day. Academic integrity policy applies to all submissions."
    },
    {
      title: "Web Application Development",
      courseNumber: "CS 371",
      creditHours: 3,
      instructorName: "Alice Instructor",
      emailAddress: "alice@example.com",
      officeNumber: "Engineering 214",
      officeHours: "Mon 1:00-3:00 PM",
      courseDescription: "Building full-stack applications with Node.js, Express, React and MongoDB.",
      meetingTimes: "Tue/Thu 11:00 AM-12:15 PM",
      meetingLocation: "Engineering 105 (lab)",
      courseMaterials: "No textbook. Readings are linked from the course site.",
      courseSchedule: "Weeks 1-4: JavaScript and Node\nWeeks 5-8: Express and MongoDB\nWeeks 9-12: React\nWeeks 13-15: Capstone",
      gradingScale: "Labs 40%, Capstone 40%, Participation 20%"
    },
    {
      title: "Senior Seminar (draft)",
      courseNumber: "CS 495",
      creditHours: 1,
      instructorName: "Alice Instructor",
      courseDescription: "Weekly discussion of current topics in computing. Details to be finalized."
    }
  ],
  "bob@example.com": [
    {
      title: "Discrete Mathematics",
      courseNumber: "MATH 210",
      creditHours: 3,
      instructorName: "Bob Adjunct",
      emailAddress: "bob@example.com",
      officeHours: "By appointment",
      courseDescription: "Logic, sets, functions, relations, combinatorics, graphs and proof techniques.",
      meetingTimes: "Mon/Wed 3:00-4:15 PM",
      meetingLocation: "Math Building 22",
      gradingScale: "Weekly problem sets 50%, two exams 50%"
    }
  ]
};

/**
 * Inserts (or refreshes) the seed data.
 *
 * @param {object} [options]
 * @param {boolean} [options.wipe=false] - Empty both collections before seeding.
 * @param {(msg: string) => void} [options.log=console.log]
 * @returns {Promise<{ users: number, syllabi: number }>} Counts of documents created.
 */
async function seed({ wipe = false, log = console.log } = {}) {
  if (wipe) {
    await Promise.all([User.deleteMany({}), Syllabus.deleteMany({})]);
    log("Emptied users and syllabi collections.");
  }

  // Remove any previous seed data so re-running never duplicates it.
  const emails = SEED_USERS.map((u) => u.email);
  const previous = await User.find({ email: { $in: emails } }, { _id: 1 });
  if (previous.length > 0) {
    await Syllabus.deleteMany({ owner: { $in: previous.map((u) => u._id) } });
    await User.deleteMany({ _id: { $in: previous.map((u) => u._id) } });
  }

  const hash = await bcrypt.hash(SEED_PASSWORD, 10);
  let syllabiCount = 0;
  for (const info of SEED_USERS) {
    const user = await User.create({ ...info, password: hash });
    const docs = (SEED_SYLLABI[info.email] || []).map((s) => ({ ...s, owner: user._id }));
    if (docs.length > 0) {
      await Syllabus.insertMany(docs);
      syllabiCount += docs.length;
    }
    log(`  ${info.email}  password: ${SEED_PASSWORD}  syllabi: ${docs.length}`);
  }
  return { users: SEED_USERS.length, syllabi: syllabiCount };
}

/** CLI entry point. */
async function main() {
  const args = new Set(process.argv.slice(2));
  if (env.isProduction && !args.has("--force")) {
    console.error("Refusing to seed a production database. Pass --force if you really mean it.");
    process.exit(1);
  }

  try {
    await mongoose.connect(env.mongoURI, { serverSelectionTimeoutMS: 5000 });
  } catch (err) {
    console.error("Could not connect to MongoDB. Check MONGO_URI in your .env file.");
    console.error(err.message);
    process.exit(1);
  }

  console.log(`Seeding ${mongoose.connection.name} ...`);
  const counts = await seed({ wipe: args.has("--wipe") });
  console.log(`Done: ${counts.users} users, ${counts.syllabi} syllabi.`);
  console.log("Start the app (npm run dev), open http://localhost:3000/login and use one of the accounts above.");
  await mongoose.disconnect();
}

if (require.main === module) {
  main();
}

module.exports = { seed, SEED_USERS, SEED_PASSWORD, SEED_SYLLABI };
