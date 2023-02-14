const { HttpError } = require('../helpers/index');
const { Contact } = require('../mod/contact');
const path = require('path');
const fs = require('fs/promises');
const Jimp = require("jimp");

// get list
async function getContacts(req, res) {
  // const { id: owner } = req.user;
  const { limit = 5, page = 1, favorite } = req.query;
  const skyp = (page - 1) * limit;

  console.log('limit:', limit);

  const contacts = await Contact.find({}).limit(Number(limit)).skip(Number(skyp));

  if (!favorite) {
    console.log('contacts:', contacts);
    res.status(200).json(contacts);
  } else {
    const favContacts = await contacts.filter((contact) => contact.favorite.toString() === favorite);
    return res.status(200).json(favContacts);
  }
}

// get by id
async function getContact(req, res, next) {
  const { id } = req.params;
  const contact = await Contact.findById(id);

  if (!contact) {
    return next(HttpError(404, 'Contact not found'));
  }
  return res.json(contact);
}

// post
async function createContact(req, res, next) {
  const { name, email, phone, favorite } = req.body;

  console.log('name:', name, 'email:', email, 'phone:', phone, 'favorite:', favorite);
  const newContact = await Contact.create({ name, email, phone, favorite });
  return res.status(201).json(newContact);
}

async function deleteContact(req, res, next) {
  const { id } = req.params;
  const contact = await Contact.findById(id);
  if (!contact) {
    return next(HttpError(404, 'No contact'));
  }
  await Contact.findByIdAndRemove(id);
  return res.status(200).json(contact);
}

async function updateContact(req, res, next) {
  const { body } = req;
  const { id } = req.params;
  const contact = await Contact.findByIdAndUpdate(id, body);
  if (!contact) {
    return next(HttpError(404, 'Not found'));
  }
  return res.json(contact);
}

async function updateStatusContact(req, res, next) {
  const { body } = req;
  const { id } = req.params;

  const contact = await Contact.findByIdAndUpdate(id, body, { new: true });
  if (!contact) {
    return next(HttpError(404, 'Not found'));
  }
  return res.status(200).json(contact);
}


async function uploadImage(req, res, next) {

  const { filename } = req.file;
  const tmpPath = path.resolve(__dirname, '../tmp', filename);

  // Вариант 1
  // resize
// const image = await Jimp.read(tmpPath);
// await image.resize(250, 250);
// await image.writeAsync(tmpPath)


  const publicPath = path.resolve(__dirname, '../public/avatars', filename);
  
  // Вариант 2

  await Jimp.read(tmpPath).then((image) => {
    return image.resize(250, 250).write(tmpPath);
  }).catch((error) => {
    console.error(error);
  });
  
  
  try {
    await fs.rename(tmpPath, publicPath);
  } catch (error) {
    await fs.unlink(tmpPath);
    throw error;
  }

  const contactId = req.params.id;

  const contact = await Contact.findById(contactId);
  contact.avatarURL = `/public/avatars/${filename}`;
  await contact.save();

 

  // TODO
  return res.json({
    data: {
      avatarURL: contact.avatarURL,
    },
  });
}

module.exports = {
  getContact,
  getContacts,
  createContact,
  deleteContact,
  updateContact,
  updateStatusContact,
  uploadImage,
};
