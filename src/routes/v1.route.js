'use strict';

const express = require('express');
const modelsMiddleware = require('../middleware/modelsMiddleware');

const router = express.Router();

router.param('model', modelsMiddleware);

router.get('/:model', handleGetAll);
router.get('/:model/:id', handleGetOne);
router.post('/:model', handleCreate);
router.put('/:model/:id', handleUpdate);
router.patch('/:model/:id', handlePatch);
router.delete('/:model/:id', handleDelete);

async function handleGetAll(req, res) {
  try{
    let allRecords = await req.model.get();
    res.status(200).json(allRecords);
  }catch(err){
    console.error('error trying to get records', err);
  }
}

async function handleGetOne(req, res) {
  try{
    const id = req.params.id;
    let theRecord = await req.model.get(id)
    res.status(200).json(theRecord);
  }catch(err){
    console.error('error trying to get one record', err);
  }
}

async function handleCreate(req, res) {
  try{
    let obj = req.body;
    let newRecord = await req.model.create(obj);
    res.status(201).json(newRecord);
  }catch(err){
    console.error('error trying to create a record', err);
  }
}

async function handleUpdate(req, res) {
  try{
    const id = req.params.id;
    const obj = req.body;
    let updatedRecord = await req.model.update(id, obj)
    res.status(203).json(updatedRecord);
  }catch(err){
    console.error('error with updating a record - put ', err);
  }
}

async function handlePatch(req, res) {
  try{
    const id = req.params.id;
    const obj = req.body;
    let updatedRecord = await req.model.update(id, obj)
    res.status(203).json(updatedRecord);
  }catch(err){
    console.error('error with updating a record - patch ', err);
  }
}

async function handleDelete(req, res) {
  try{
    let id = req.params.id;
    let deletedRecord = await req.model.delete(id);
    res.status(204).json(deletedRecord);
  }catch(err){
    console.error('error trying to delete a record', err);
  }
}

module.exports = router;