"use strict";

class DataCollection {
  constructor(model) {
    this.model = model;
  }

  async get(id) {
    let record = null;
    try{
      if (id) {
        record = await this.model.findOne({ where: { id } });
      } else {
        record = await this.model.findAll();
      }
  
      return record;
    } catch (err) {
      console.log(`Error accured while getting a record for the ${this.model} model, err: ${err}`);
    }
  }

  async create(obj) {
    try {
      let record = await this.model.create(obj);
      return record;
    } catch (err) {
      console.log(`Error accured while creating a new record for the ${this.model} model, err: ${err}`);
    }
  }

  async update(id, obj) {
    try {
      if (!id) {
        throw new Error("an ID should be provided");
      }
      await this.model.update(obj, { where: { id } });
      const updatedRecord = await this.model.findOne({
        where: { id: id }
      });
      return updatedRecord;
    } catch (err) {
      console.log(`Error accured while updating a record for the ${this.model} model, err: ${err}`);
    }
  }

  async delete(id) {
    try {
      if (!id) {
        throw new Error("an ID should be provided");
      }
      const record = await this.model.destroy({where : {id}});
      return record;
    } catch (err) {
      console.log(`Error accured while deleting a record for the ${this.model} model, err: ${err}`);
    }
  }
}

module.exports = DataCollection;
