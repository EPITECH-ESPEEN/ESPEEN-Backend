import mongoose, { Schema, Document } from "mongoose";

interface IService extends Document {
  uid: number;
  name: string;
}

const serviceSchema: Schema<IService> = new mongoose.Schema(
  {
    uid: {
      type: Number,
      required: [true, "Service id is required"],
      unique: true,
    },
    name: {
      type: String,
      required: [true, "Service name is required"],
    },
  },
  { timestamps: true }
);

//Define uid
serviceSchema.pre<IService>("save", async function (next) {
  if (this.isNew) {
    const highestUidUser = await (this.constructor as mongoose.Model<IService>).findOne().sort("-uid").exec();
    if (highestUidUser) {
      this.uid = highestUidUser.uid + 1;
    } else {
      this.uid = 1;
    }
  }
  next();
});

const Service = mongoose.model<IService>("Services", serviceSchema);

export default Service;
