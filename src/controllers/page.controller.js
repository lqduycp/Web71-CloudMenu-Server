import { ObjectId } from 'mongodb';
import { db } from '../config/database.js';
import asyncHandler from 'express-async-handler';

const createPage = asyncHandler(async (req, res) => {
  const { userId, name, businessType } = req.body;

  const existingUser = await db.users.findOne({ _id: new ObjectId(userId) });
  if (!existingUser) {
    res.status(400);
    throw new Error('User not found');
  }

  const newPage = {
    _id: new ObjectId(),
    ...req.body,
    createdAt: new Date(),
    updateAt: new Date(),
    activeMenuId: null
  };
  await db.pages.insertOne(newPage);
  await db.users.updateOne(
    { _id: new ObjectId(userId) },
    { $set: { ...existingUser, activePageId: newPage._id, updateAt: new Date() } }
  );

  await db.news.insertOne({
    time: new Date(),
    type: 'create page',
    action: `bắt đầu kinh doanh`,
    object: `${businessType} - ${name}`,
    objectId: newPage._id,
    madeBy: `${existingUser.firstName} ${existingUser.lastName}`
  });

  res.status(201).json({
    message: 'Created page successfully'
  });
});

const getAllOfUser = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const existingUser = await db.users.findOne({ _id: new ObjectId(userId) });

  if (!existingUser) {
    res.status(400);
    throw new Error('User not found');
  }

  const pages = await db.pages.find({ userId: userId }).toArray();

  res.json({ data: pages ?? [] });
});

const getPageById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingId = await db.pages.findOne({ _id: new ObjectId(id) });

  if (!existingId) {
    res.status(400);
    throw new Error('Page not found');
  }

  res.json(existingId);
});

const updatePage = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updatedFields = req.body;

  const existingPage = await db.pages.findOne({ _id: new ObjectId(id) });

  if (!existingPage) {
    res.status(400);
    throw new Error('Page not found');
  }

  await db.pages.updateOne({ _id: new ObjectId(id) }, { $set: updatedFields });

  return res.json({
    message: 'Update page successfully'
  });
});

const deletePage = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const existingId = await db.pages.findOne({ _id: new ObjectId(id) });

  if (!existingId) {
    res.status(400);
    throw new Error('Page not found');
  }

  await db.pages.deleteOne({ _id: new ObjectId(id) });
  return res.json({
    message: 'Delete successfully'
  });
});

const applyMenu = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { menuId } = req.body;

  const existingPage = await db.pages.findOne({ _id: new ObjectId(id) });
  if (!existingPage) {
    res.status(400);
    throw new Error('Page not found');
  }
  console.log(existingPage);

  const existingMenu = await db.menus.findOne({ _id: new ObjectId(menuId) });
  if (!existingMenu) {
    res.status(400);
    throw new Error('Menu not found');
  }
  console.log(existingMenu);

  const newPageData = { ...existingPage, activeMenuId: menuId };
  await db.pages.updateOne({ _id: new ObjectId(id) }, { $set: newPageData });

  return res.json({
    message: 'Menu is applied'
  });
});

const PageController = {
  createPage,
  getAllOfUser,
  getPageById,
  updatePage,
  deletePage,
  applyMenu
};

export default PageController;
