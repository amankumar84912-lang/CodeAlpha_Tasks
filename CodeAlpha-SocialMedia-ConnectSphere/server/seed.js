import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Post from './models/Post.js';
import Comment from './models/Comment.js';

const USERS_DATA = [
  {
    username: 'sarah_designer',
    email: 'sarah@connectsphere.com',
    bio: 'Product Designer & UI Specialist. Loving glassmorphic minimalism and dark mode interfaces. ◈',
    profilePic: {
      url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      publicId: ''
    }
  },
  {
    username: 'alex_mercer',
    email: 'alex@connectsphere.com',
    bio: 'Full Stack Dev | React & Node enthusiast. Building open-source tools for the developer community. 🚀',
    profilePic: {
      url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      publicId: ''
    }
  },
  {
    username: 'elena_rostova',
    email: 'elena@connectsphere.com',
    bio: 'Travel photographer & mountaineer. Capturing moments from peak to valley. 🏔️📸',
    profilePic: {
      url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
      publicId: ''
    }
  },
  {
    username: 'david_chen',
    email: 'david@connectsphere.com',
    bio: 'AI researcher and coffee geek. Exploring neural networks by day, roasting beans by night. ☕🧠',
    profilePic: {
      url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      publicId: ''
    }
  }
];

const seedDB = async () => {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected! Cleaning collections...');

    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});

    console.log('Generating password hashes...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    console.log('Creating users...');
    const users = [];
    for (const u of USERS_DATA) {
      const user = await User.create({
        username: u.username,
        email: u.email,
        password: passwordHash,
        bio: u.bio,
        profilePic: u.profilePic
      });
      users.push(user);
    }
    console.log(`Created ${users.length} mock users.`);

    // Set up cross-following relationships
    console.log('Setting up following relationships...');
    // Sarah follows Alex and Elena
    await User.findByIdAndUpdate(users[0]._id, { $addToSet: { following: [users[1]._id, users[2]._id] } });
    await User.findByIdAndUpdate(users[1]._id, { $addToSet: { followers: users[0]._id } });
    await User.findByIdAndUpdate(users[2]._id, { $addToSet: { followers: users[0]._id } });

    // Alex follows Elena and David
    await User.findByIdAndUpdate(users[1]._id, { $addToSet: { following: [users[2]._id, users[3]._id] } });
    await User.findByIdAndUpdate(users[2]._id, { $addToSet: { followers: users[1]._id } });
    await User.findByIdAndUpdate(users[3]._id, { $addToSet: { followers: users[1]._id } });

    // Elena follows David and Sarah
    await User.findByIdAndUpdate(users[2]._id, { $addToSet: { following: [users[3]._id, users[0]._id] } });
    await User.findByIdAndUpdate(users[3]._id, { $addToSet: { followers: users[2]._id } });
    await User.findByIdAndUpdate(users[0]._id, { $addToSet: { followers: users[2]._id } });

    // David follows Sarah and Alex
    await User.findByIdAndUpdate(users[3]._id, { $addToSet: { following: [users[0]._id, users[1]._id] } });
    await User.findByIdAndUpdate(users[0]._id, { $addToSet: { followers: users[3]._id } });
    await User.findByIdAndUpdate(users[1]._id, { $addToSet: { followers: users[3]._id } });

    console.log('Creating posts...');
    const posts = [];

    // Post 1: Sarah
    const p1 = await Post.create({
      user: users[0]._id,
      content: 'Just finalized the new glassmorphic design system tokens for ConnectSphere v3! The deep violet theme looks absolutely stunning in the dark mode body. What do you think of modern glassmorphism in SaaS products?',
      image: {
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80',
        publicId: ''
      }
    });
    posts.push(p1);

    // Post 2: Alex
    const p2 = await Post.create({
      user: users[1]._id,
      content: 'React 19 Server Actions combined with Vite 8 make the local build times incredibly fast. ConnectSphere compiles client code in less than 400ms. The future of full-stack developer tooling is bright!',
      image: {
        url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&auto=format&fit=crop&q=80',
        publicId: ''
      }
    });
    posts.push(p2);

    // Post 3: Elena
    const p3 = await Post.create({
      user: users[2]._id,
      content: 'Woke up at 4:30 AM to catch the sunrise at Lake Bachalpsee, Switzerland. The reflection on the crystal clear water was completely worth the freezing temperatures! 🏔️✨',
      image: {
        url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&auto=format&fit=crop&q=80',
        publicId: ''
      }
    });
    posts.push(p3);

    // Post 4: David
    const p4 = await Post.create({
      user: users[3]._id,
      content: 'Brewing a fresh cup of naturally processed Ethiopian Yirgacheffe coffee. Notes of blueberry, jasmine, and honey. Best fuel for debugging training loops all morning. ☕🧠'
    });
    posts.push(p4);

    console.log(`Created ${posts.length} mock posts.`);

    console.log('Generating comments & likes...');

    // Post 1 Comments
    const c1 = await Comment.create({ user: users[1]._id, post: posts[0]._id, text: 'This looks incredibly clean! Love the drop shadow glow on the purple cards.' });
    const c2 = await Comment.create({ user: users[2]._id, post: posts[0]._id, text: 'Absolutely gorgeous! Can we use this style for image gallery previews too?' });
    await Post.findByIdAndUpdate(posts[0]._id, {
      $push: { comments: [c1._id, c2._id] },
      $addToSet: { likes: [users[1]._id, users[2]._id, users[3]._id] }
    });

    // Post 2 Comments
    const c3 = await Comment.create({ user: users[0]._id, post: posts[1]._id, text: 'Vite 8 is a game changer. Thanks for sharing the setup config!' });
    await Post.findByIdAndUpdate(posts[1]._id, {
      $push: { comments: [c3._id] },
      $addToSet: { likes: [users[0]._id, users[3]._id] }
    });

    // Post 3 Comments
    const c4 = await Comment.create({ user: users[0]._id, post: posts[2]._id, text: 'Stunning capture, Elena! The contrast is magical.' });
    const c5 = await Comment.create({ user: users[3]._id, post: posts[2]._id, text: 'Wow, wish I was there right now instead of debugging.' });
    await Post.findByIdAndUpdate(posts[2]._id, {
      $push: { comments: [c4._id, c5._id] },
      $addToSet: { likes: [users[0]._id, users[1]._id, users[3]._id] }
    });

    // Post 4 Comments
    const c6 = await Comment.create({ user: users[1]._id, post: posts[3]._id, text: 'Nothing beats Ethiopian beans. Send some over to the office!' });
    await Post.findByIdAndUpdate(posts[3]._id, {
      $push: { comments: [c6._id] },
      $addToSet: { likes: [users[1]._id] }
    });

    console.log('Seeding process complete! Database successfully populated.');
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
