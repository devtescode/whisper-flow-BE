// const mongoose = require("mongoose");
// const bcrypt = require("bcryptjs");

// let schema = new mongoose.Schema(
//   {
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// const saltRounds = 10;

// schema.pre("save", async function () {
//   if (!this.isModified("password")) return;

//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
// });


// schema.methods.compareUser = async function (userPass) {
//   try {
//     return await bcrypt.compare(userPass, this.password);
//   } catch (err) {
//     console.log(err);
//   }
// };

// const Userschema = mongoose.model("whisperflow", schema);
// module.exports = { Userschema };  









const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const adminSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
}, { timestamps: true });


adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return; // no next()
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});


module.exports = mongoose.model("admin", adminSchema);