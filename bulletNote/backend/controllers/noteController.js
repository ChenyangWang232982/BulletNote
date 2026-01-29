const {Note, User} = require('../models');
const { protect } = require('../middleware/auth.middleware');
const { createAspect } = require('../utils/aspect');

const getNotes = async (req, res) => {
    console.log('starting to load notes')
    const userId = req.user.id;
    const notes = await Note.findAll({
        where: {userId: req.user.id},
        order: [['createdAt', 'DESC']],
        include: [
            {
                model: User,
                as: 'author',
            }
        ] 
    });
    res.status(200).json({
        success: true,
        message: 'Successfully loading notes',
        data: notes.map(note => note.toJSON())
    });
};

const createNote = async (req, res) => {
    console.log('creating note')
    const userId = req.user.id;
    const {title, content, category} = req.body;

    if (!title || !content) {
        return res.status(400).json({
            success: false,
            message: 'Cannot be empty'});
    }
    const newNote = await Note.create({
        userId,
        title,
        content,
        category: category || 'default',
    });
    res.status(201).json({
        success: true,
        data: newNote
    });
};

const updateNote = async (req,res) => {
    const userId = req.user.id;
    const {id} = req.params;
    const {title, content, category} = req.body;

    const note = await Note.findOne({
        where: {
            id,
            userId
        }
    });
    if (!note) {
        return res.status(404).json({
            success: false,
            message: 'Note does not exist'})
    }

    await note.update({
        title: title || note.title,
        content: content || note.content,
        category: category || note.category
    });

    res.status(200).json({
        success: true,
        data: note
    }
    );
};

const deleteNote = async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    const note = await Note.findOne({
        where: {
            id,
            userId
        }
    });
    if(!note) {
        return res.status(404).json({
            success: false,
            message: 'Note does not exist'});
    }
    await note.destroy();
    res.status(200).json({
        success: true,
        message: 'Deleted note successfully'});
};

const getNoteByTitle = async (req, res) => {
    const { name } = req.params;
    const userId = req.user.id;

    const note = await Note.findAll({
        where: {
            title: name,
            userId
        },
        order: [['createdAt', 'DESC']]
    });
    if(!note) {
        return res.status(404).json({
            success: false,
            message: 'Note does not exist'});
    }
    res.status(200).json({
        success: true,
        data: note
    });
};

exports.getNotes = createAspect(getNotes);
exports.createNote = createAspect(createNote);
exports.updateNote = createAspect(updateNote);
exports.deleteNote = createAspect(deleteNote);
exports.getNoteByTitle = createAspect(getNoteByTitle);